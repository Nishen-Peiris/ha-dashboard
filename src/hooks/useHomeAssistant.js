import { useEffect, useMemo, useRef, useState } from 'react'
import {
  defaultDoors,
  defaultMetricHistory,
  defaultMetrics,
  defaultRooms,
  defaultSettings,
  doorEntities,
  doorLabels,
} from '../data/dashboard'
import { fetchEntityHistory, readSavedSettings, saveSettings, toWebSocketUrl } from '../lib/homeAssistant'

const STORAGE_KEY = 'ha-dashboard-settings'
const RECONNECT_DELAY_MS = 5000
const MAX_HISTORY_POINTS = 240
const HISTORY_BACKFILL_HOURS = 12
const OCCUPANCY_HINTS = ['occupancy', 'motion', 'presence']
const WEATHER_FORECAST_ENTITY_ID = 'weather.forecast_home'
const WEATHER_FORECAST_REFRESH_MS = 30 * 60 * 1000
const MAX_ACTIVITY_ITEMS = 5
const EMPTY_WEATHER_FORECAST = {
  hourly: [],
  daily: [],
}
const ACTIVITY_MOTION_SENSORS = {
  'binary_sensor.front_room_motion_sensor_motion': 'Front Room',
  'binary_sensor.bedroom_motion_sensor_motion': 'Bedroom',
  'binary_sensor.kitchen_motion_sensor_motion': 'Kitchen',
  'binary_sensor.back_room_motion_sensor': 'Back Room',
  'binary_sensor.bathroom_motion_sensor': 'Bathroom',
}
const ACTIVITY_VACUUM_ENTITY_ID = 'sensor.xiaomi_ov51gl_cfcf_status'

function getNumericState(entity) {
  const parsed = Number.parseFloat(entity?.state)
  return Number.isFinite(parsed) ? parsed : null
}

function getFriendlyName(entity) {
  return entity?.attributes?.friendly_name ?? entity?.entity_id ?? 'Unknown'
}

function stripSuffix(value, suffix) {
  const pattern = new RegExp(`\\s*${suffix}$`, 'i')
  return value.replace(pattern, '').trim()
}

function matchesHint(entity, hints) {
  return hints.some((hint) => entity.entity_id.includes(hint))
}

function buildActivityItem(change) {
  const nextState = change.newState
  const previousState = change.oldState

  if (!nextState || nextState.state === previousState?.state) {
    return null
  }

  const entityId = nextState.entity_id
  const roomName = ACTIVITY_MOTION_SENSORS[entityId]

  if (roomName) {
    return {
      id: `${entityId}-${change.timestamp}`,
      label: `${roomName} motion ${nextState.state === 'on' ? 'detected' : 'cleared'}`,
      timestamp: change.timestamp,
    }
  }

  if (entityId === ACTIVITY_VACUUM_ENTITY_ID) {
    return {
      id: `${entityId}-${change.timestamp}`,
      label: `Xiaomi Robot Vacuum ${nextState.state.replace(/_/g, ' ')}`,
      timestamp: change.timestamp,
    }
  }

  return null
}

function buildStateIndex(states) {
  return Object.fromEntries(states.map((entity) => [entity.entity_id, entity]))
}

function getMappedStat(stateIndex, entityId, fallbackLabel, fallbackColor, unit = '%') {
  if (!entityId) {
    return { label: fallbackLabel, value: 0, color: fallbackColor, displayLabel: '--' }
  }

  const entity = stateIndex[entityId]
  const numericValue = getNumericState(entity)

  if (numericValue === null) {
    return { label: fallbackLabel, value: 0, color: fallbackColor, displayLabel: '--' }
  }

  return {
    label: fallbackLabel,
    value: numericValue,
    color: fallbackColor,
    displayLabel: `${numericValue}${unit}`,
  }
}

function createHistoryStat(entity, fallbackLabel, fallbackColor, dataKey, unit = '%') {
  const numericValue = getNumericState(entity)

  if (numericValue === null) {
    return { label: fallbackLabel, value: 0, color: fallbackColor, dataKey, displayLabel: '--' }
  }

  return {
    label: fallbackLabel,
    value: numericValue,
    color: fallbackColor,
    dataKey,
    displayLabel: `${numericValue}${unit}`,
  }
}

function getDeviceStatus(entity, activeStates, warnStates = []) {
  const rawValue = entity?.state ?? 'unknown'
  const value = rawValue.replace(/_/g, ' ')
  const lower = rawValue.toLowerCase()

  if (activeStates.includes(lower)) {
    return {
      value,
      tone: 'active',
    }
  }

  if (warnStates.includes(lower)) {
    return {
      value,
      tone: 'warn',
    }
  }

  return {
    value,
    tone: 'idle',
  }
}

function getVacuumStatus(entity) {
  return getDeviceStatus(entity, ['cleaning', 'returning', 'docking'], ['paused', 'error'])
}

function getAirPurifierStatus(entity) {
  return getDeviceStatus(entity, ['on', 'auto', 'favorite', 'idle'], ['unavailable', 'unknown'])
}

function getAirConditionerStatus(entity) {
  return getDeviceStatus(entity, ['on'], ['unavailable', 'unknown'])
}

function buildMetricsFromStates(states, mappings, history) {
  if (!states.length) {
    return defaultMetrics.map((metric) => ({
      ...metric,
      history: metric.historyKey ? history[metric.historyKey] : undefined,
    }))
  }

  const stateIndex = buildStateIndex(states)
  const systemStats = [
    getMappedStat(stateIndex, mappings.systemCpu, 'CPU', '#2563eb'),
    getMappedStat(stateIndex, mappings.systemMemory, 'Memory', '#7c3aed'),
  ].map((stat, index) => ({
    ...stat,
    dataKey: index === 0 ? 'cpu' : 'memory',
  }))

  const networkStats = [
    getMappedStat(stateIndex, mappings.networkDownload, 'Download', '#0ea5e9', ' MB/s'),
    getMappedStat(stateIndex, mappings.networkUpload, 'Upload', '#14b8a6', ' MB/s'),
  ].map((stat, index) => ({
    ...stat,
    dataKey: index === 0 ? 'download' : 'upload',
  }))
  const pm25Stats = [
    createHistoryStat(stateIndex[mappings.pm25Density], 'PM2.5', '#0f766e', 'pm25', ' μg/m³'),
  ]
  const vacuumStatus = getVacuumStatus(stateIndex[mappings.vacuumStatus])
  const airPurifierStatus = getAirPurifierStatus(stateIndex[mappings.airPurifierStatus])
  const airConditionerStatus = getAirConditionerStatus(stateIndex[mappings.airConditionerStatus])

  return [
    {
      ...defaultMetrics[0],
      stats: systemStats,
      history: history.system,
    },
    {
      ...defaultMetrics[1],
      stats: networkStats,
      history: history.network,
    },
    {
      ...defaultMetrics[2],
      stats: pm25Stats,
      history: history.pm25,
    },
    {
      ...defaultMetrics[3],
      status: airConditionerStatus,
      stats: [getMappedStat(stateIndex, mappings.airConditionerFilter, 'Air Conditioner Filter', '#d97706')],
      tone: airConditionerStatus.tone === 'active' ? '#0f766e' : airConditionerStatus.tone === 'warn' ? '#d97706' : '#475569',
    },
    {
      ...defaultMetrics[4],
      status: vacuumStatus,
      stats: [
        getMappedStat(stateIndex, mappings.vacuumDustBag, 'Vacuum Dust Bag', '#dc2626'),
      ],
      tone: vacuumStatus.tone === 'active' ? '#0f766e' : vacuumStatus.tone === 'warn' ? '#d97706' : '#475569',
    },
    {
      ...defaultMetrics[5],
      status: airPurifierStatus,
      stats: [
        getMappedStat(stateIndex, mappings.airPurifierFilter, 'Air Purifier Filter', '#0f766e'),
      ],
      tone: airPurifierStatus.tone === 'active' ? '#0f766e' : airPurifierStatus.tone === 'warn' ? '#d97706' : '#475569',
    },
  ]
}

function buildDoorData(states) {
  const stateIndex = buildStateIndex(states)
  const doors = doorEntities
    .map((entityId) => {
      const entity = stateIndex[entityId]

      if (!entity) {
        return null
      }

      return {
        name: doorLabels[entityId] ?? getFriendlyName(entity),
        open: ['on', 'open', 'opening', 'unlocked'].includes(entity.state),
      }
    })
    .filter(Boolean)

  return doors.length ? doors : defaultDoors
}

function buildRoomData(states) {
  const rooms = states
    .filter((entity) => {
      const deviceClass = entity.attributes?.device_class
      return entity.entity_id.startsWith('binary_sensor.') && (OCCUPANCY_HINTS.includes(deviceClass) || matchesHint(entity, OCCUPANCY_HINTS))
    })
    .map((entity) => ({
      name: stripSuffix(getFriendlyName(entity), 'Occupancy'),
      occupied: entity.state === 'on',
    }))

  return rooms.length ? rooms.slice(0, 6) : defaultRooms
}

function mapHistorySeries(entityHistory, dataKey) {
  return entityHistory
    .map((entry, index) => {
      const value = Number.parseFloat(entry.state)
      if (!Number.isFinite(value)) {
        return null
      }

      return {
        index,
        [dataKey]: value,
      }
    })
    .filter(Boolean)
}

function buildHistoryFromApi(historyResponse) {
  const historyByEntity = Object.fromEntries(
    historyResponse
      .filter((series) => Array.isArray(series) && series.length)
      .map((series) => [series[0].entity_id, series]),
  )

  return {
    pm25: mapHistorySeries(historyByEntity['sensor.xiaomi_cpa4_680c_pm25_density'] ?? [], 'pm25').slice(-MAX_HISTORY_POINTS),
  }
}

function appendHistoryPoint(history, key, point) {
  const nextPoint = {
    index: history[key].length ? history[key][history[key].length - 1].index + 1 : 0,
    ...point,
  }

  return {
    ...history,
    [key]: [...history[key], nextPoint].slice(-MAX_HISTORY_POINTS),
  }
}

function connectToHomeAssistant(baseUrl, token, onStates, onStateChanged, onFailure, onReady) {
  const socket = new WebSocket(toWebSocketUrl(baseUrl))
  let nextMessageId = 1
  const pendingRequests = new Map()

  const sendMessage = (message, onResult) => {
    const messageId = nextMessageId
    if (onResult) {
      pendingRequests.set(messageId, onResult)
    }

    socket.send(JSON.stringify({
      id: messageId,
      ...message,
    }))
    nextMessageId += 1
  }

  socket.addEventListener('message', (event) => {
    const payload = JSON.parse(event.data)

    if (payload.type === 'auth_required') {
      socket.send(JSON.stringify({
        type: 'auth',
        access_token: token,
      }))
      return
    }

    if (payload.type === 'auth_invalid') {
      onFailure(new Error(payload.message || 'WebSocket authentication failed.'))
      socket.close()
      return
    }

    if (payload.type === 'auth_ok') {
      onReady(sendMessage)
      sendMessage({ type: 'get_states' })
      sendMessage({ type: 'subscribe_events', event_type: 'state_changed' })
      return
    }

    if (payload.type === 'result') {
      const pendingRequest = pendingRequests.get(payload.id)
      if (pendingRequest) {
        pendingRequests.delete(payload.id)
        pendingRequest(payload)
        return
      }

      if (payload.success && Array.isArray(payload.result)) {
        onStates(payload.result)
      }

      return
    }

    if (payload.type === 'event' && payload.event?.event_type === 'state_changed') {
      onStateChanged?.({
        entityId: payload.event.data.entity_id,
        oldState: payload.event.data.old_state,
        newState: payload.event.data.new_state,
        timestamp: payload.event.time_fired ?? new Date().toISOString(),
      })
      onStates((currentStates) => {
        const nextState = payload.event.data.new_state

        if (!nextState) {
          return currentStates.filter((entity) => entity.entity_id !== payload.event.data.entity_id)
        }

        const nextStates = currentStates.filter((entity) => entity.entity_id !== nextState.entity_id)
        nextStates.push(nextState)
        return nextStates
      })
    }
  })

  socket.addEventListener('error', () => {
    onFailure(new Error(`Could not reach ${baseUrl} over WebSocket.`))
  })

  return socket
}

export function useHomeAssistant() {
  const [settings, setSettings] = useState(() => readSavedSettings(STORAGE_KEY, defaultSettings))
  const [states, setStates] = useState([])
  const [history, setHistory] = useState(defaultMetricHistory)
  const [weatherForecast, setWeatherForecast] = useState(EMPTY_WEATHER_FORECAST)
  const [activity, setActivity] = useState([])
  const commandSenderRef = useRef(null)

  useEffect(() => {
    saveSettings(STORAGE_KEY, settings)
  }, [settings])

  useEffect(() => {
    if (!settings.baseUrl || !settings.token) {
      return undefined
    }

    let activeSocket = null
    let cancelled = false
    let reconnectTimeoutId = null
    let forecastIntervalId = null

    const requestWeatherForecast = (type) => {
      if (!commandSenderRef.current) {
        return
      }

      commandSenderRef.current({
        type: 'call_service',
        domain: 'weather',
        service: 'get_forecasts',
        service_data: { type },
        target: { entity_id: [WEATHER_FORECAST_ENTITY_ID] },
        return_response: true,
      }, (payload) => {
        if (!payload.success) {
          return
        }

        const forecast = payload.result?.response?.[WEATHER_FORECAST_ENTITY_ID]?.forecast
        setWeatherForecast((current) => ({
          ...current,
          [type]: Array.isArray(forecast) ? forecast : [],
        }))
      })
    }

    const connect = (urls) => {
      if (!urls.length || cancelled) {
        setStates([])
        setWeatherForecast(EMPTY_WEATHER_FORECAST)
        setActivity([])
        return
      }

      const [currentUrl, ...remainingUrls] = urls

      activeSocket = connectToHomeAssistant(
        currentUrl,
        settings.token,
        setStates,
        (change) => {
          const item = buildActivityItem(change)

          if (!item) {
            return
          }

          setActivity((current) => [item, ...current.filter((entry) => entry.label !== item.label)].slice(0, MAX_ACTIVITY_ITEMS))
        },
        () => {
          commandSenderRef.current = null
          if (forecastIntervalId !== null) {
            window.clearInterval(forecastIntervalId)
            forecastIntervalId = null
          }
          if (cancelled) {
            return
          }

          if (remainingUrls.length) {
            connect(remainingUrls)
            return
          }

          reconnectTimeoutId = window.setTimeout(() => {
            connect([settings.baseUrl, ...settings.fallbackUrls])
          }, RECONNECT_DELAY_MS)
        },
        (sendMessage) => {
          commandSenderRef.current = sendMessage
          requestWeatherForecast('hourly')
          requestWeatherForecast('daily')
          forecastIntervalId = window.setInterval(() => {
            requestWeatherForecast('hourly')
            requestWeatherForecast('daily')
          }, WEATHER_FORECAST_REFRESH_MS)
        },
      )

      activeSocket.addEventListener('close', () => {
        commandSenderRef.current = null
        if (forecastIntervalId !== null) {
          window.clearInterval(forecastIntervalId)
          forecastIntervalId = null
        }
        if (cancelled || reconnectTimeoutId !== null) {
          return
        }

        if (remainingUrls.length) {
          connect(remainingUrls)
          return
        }

        reconnectTimeoutId = window.setTimeout(() => {
          connect([settings.baseUrl, ...settings.fallbackUrls])
        }, RECONNECT_DELAY_MS)
      })
    }

    connect([settings.baseUrl, ...settings.fallbackUrls])

    return () => {
      cancelled = true
      commandSenderRef.current = null
      setWeatherForecast(EMPTY_WEATHER_FORECAST)
      setActivity([])
      if (reconnectTimeoutId !== null) {
        window.clearTimeout(reconnectTimeoutId)
      }
      if (forecastIntervalId !== null) {
        window.clearInterval(forecastIntervalId)
      }
      activeSocket?.close()
    }
  }, [settings.baseUrl, settings.fallbackUrls, settings.token])

  useEffect(() => {
    if (!settings.baseUrl || !settings.token) {
      return undefined
    }

    let cancelled = false

    const loadHistory = async () => {
      try {
        const historyResponse = await fetchEntityHistory(
          settings.baseUrl,
          settings.token,
          [settings.mappings.pm25Density],
          HISTORY_BACKFILL_HOURS,
        )

        if (cancelled) {
          return
        }

        const nextHistory = buildHistoryFromApi(historyResponse)
        setHistory((currentHistory) => ({
          ...currentHistory,
          pm25: nextHistory.pm25.length ? nextHistory.pm25 : currentHistory.pm25,
        }))
      } catch {
        // Keep fallback and live in-memory history if the history API is unavailable.
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [
    settings.baseUrl,
    settings.mappings.pm25Density,
    settings.token,
  ])

  useEffect(() => {
    if (!states.length) {
      return
    }

    const stateIndex = buildStateIndex(states)
    const cpu = getNumericState(stateIndex[settings.mappings.systemCpu])
    const memory = getNumericState(stateIndex[settings.mappings.systemMemory])
    const download = getNumericState(stateIndex[settings.mappings.networkDownload])
    const upload = getNumericState(stateIndex[settings.mappings.networkUpload])
    const pm25 = getNumericState(stateIndex[settings.mappings.pm25Density])

    setHistory((currentHistory) => {
      let nextHistory = currentHistory
      const lastSystemPoint = currentHistory.system[currentHistory.system.length - 1]
      const lastNetworkPoint = currentHistory.network[currentHistory.network.length - 1]
      const lastPm25Point = currentHistory.pm25[currentHistory.pm25.length - 1]

      if (cpu !== null && memory !== null && (lastSystemPoint.cpu !== cpu || lastSystemPoint.memory !== memory)) {
        nextHistory = appendHistoryPoint(nextHistory, 'system', { cpu, memory })
      }

      if (download !== null && upload !== null && (lastNetworkPoint.download !== download || lastNetworkPoint.upload !== upload)) {
        nextHistory = appendHistoryPoint(nextHistory, 'network', { download, upload })
      }

      if (pm25 !== null && lastPm25Point.pm25 !== pm25) {
        nextHistory = appendHistoryPoint(nextHistory, 'pm25', { pm25 })
      }

      return nextHistory
    })
  }, [
    settings.mappings.networkDownload,
    settings.mappings.networkUpload,
    settings.mappings.pm25Density,
    settings.mappings.systemCpu,
    settings.mappings.systemMemory,
    states,
  ])

  const dashboardData = useMemo(() => ({
    activity,
    metrics: buildMetricsFromStates(states, settings.mappings, history),
    doors: buildDoorData(states),
    entityIndex: buildStateIndex(states),
    rooms: buildRoomData(states),
    weatherForecast,
  }), [activity, history, settings.mappings, states, weatherForecast])

  const callService = (domain, service, serviceData, target) => {
    if (!commandSenderRef.current) {
      return false
    }

    commandSenderRef.current({
      type: 'call_service',
      domain,
      service,
      ...(serviceData ? { service_data: serviceData } : {}),
      ...(target ? { target } : {}),
    })

    return true
  }

  return {
    callService,
    dashboardData,
  }
}
