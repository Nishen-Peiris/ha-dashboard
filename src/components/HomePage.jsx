import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import {
  BriefcaseBusiness,
  Clapperboard,
  Cloud,
  CloudFog,
  CloudMoon,
  CloudRain,
  CloudSun,
  Droplets,
  Gamepad2,
  History,
  House,
  Leaf,
  MoonStar,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'

const SCENES = [
  { entityId: 'input_boolean.away', label: 'Away', icon: House, accent: '#0ea5e9', activationDelayMs: 5 * 60 * 1000 },
  { entityId: 'input_boolean.sleep_me', label: 'Sleep: Me', icon: MoonStar, accent: '#8b5cf6', activationDelayMs: 60 * 1000 },
  { entityId: 'input_boolean.sleep_both', label: 'Sleep: Both', icon: MoonStar, accent: '#14b8a6', activationDelayMs: 60 * 1000 },
  { entityId: 'input_boolean.work_time', label: 'Work', icon: BriefcaseBusiness, accent: '#4f46e5' },
  { entityId: 'input_boolean.play_time', label: 'Play', icon: Gamepad2, accent: '#ec4899' },
  { entityId: 'input_boolean.movie_time', label: 'Movie', icon: Clapperboard, accent: '#f97316' },
]

const OVERVIEW_DEVICE_GROUPS = {
  lights: [
    { entityId: 'light.outdoor_light', name: 'Outdoor Light' },
    { entityId: 'light.corner_light', name: 'Living Room Corner Light' },
    { entityId: 'light.front_room_light', name: 'Front Room Light' },
    { entityId: 'light.light_strip', name: 'Front Room Light Strip' },
    { entityId: 'switch.table_lamp', name: 'Bedroom Table Lamp' },
    { entityId: 'light.kitchen_light', name: 'Kitchen Light' },
    { entityId: 'light.back_room_light', name: 'Back Room Light' },
    { entityId: 'light.bathroom_light', name: 'Bathroom Light' },
  ],
  fans: [
    { entityId: 'fan.living_room_fan', name: 'Living Room Fan' },
    { entityId: 'fan.front_room_fan', name: 'Front Room Fan' },
    { entityId: 'fan.bedroom_fan', name: 'Bedroom Fan' },
  ],
  airConditioners: [
    { entityId: 'input_boolean.front_room_ac_power', name: 'Front Room Air Conditioner' },
    { entityId: 'input_boolean.bedroom_ac_power', name: 'Bedroom Air Conditioner' },
  ],
}

const OVERVIEW_GROUP_LABELS = {
  lights: 'Lights',
  fans: 'Fans',
  airConditioners: 'Air conditioners',
}

function titleCase(value) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function formatWeatherCondition(value) {
  const normalized = (value ?? '').toLowerCase()

  const labels = {
    'clear-night': 'Clear Night',
    clear_night: 'Clear Night',
    exceptional: 'Exceptional',
    fog: 'Fog',
    hail: 'Hail',
    lightning: 'Lightning',
    'lightning-rainy': 'Lightning Rain',
    lightning_rainy: 'Lightning Rain',
    partlycloudy: 'Partly Cloudy',
    pouring: 'Pouring',
    rainy: 'Rainy',
    snowy: 'Snowy',
    'snowy-rainy': 'Snowy Rain',
    snowy_rainy: 'Snowy Rain',
    sunny: 'Sunny',
    windy: 'Windy',
    'windy-variant': 'Windy',
    windy_variant: 'Windy',
  }

  return labels[normalized] ?? titleCase(normalized.replace(/-/g, ' '))
}

function getWeatherEntity(entityIndex) {
  return entityIndex['weather.forecast_home']
    ?? Object.values(entityIndex).find((entity) => entity.entity_id.startsWith('weather.'))
}

function formatTemperature(value, fallbackUnit = '°C') {
  const numericValue = Number.parseFloat(value)

  if (!Number.isFinite(numericValue)) {
    return '--'
  }

  return `${Math.round(numericValue)}${fallbackUnit}`
}

function getOutdoorHumidity(entityIndex, weatherEntity) {
  const weatherHumidity = weatherEntity?.attributes?.humidity

  if (typeof weatherHumidity === 'number') {
    return `${Math.round(weatherHumidity)}%`
  }

  const outdoorHumiditySensor = Object.values(entityIndex).find((entity) => {
    const entityId = entity.entity_id.toLowerCase()
    return entityId.includes('outdoor') && entityId.includes('humidity')
  })

  const numericValue = Number.parseFloat(outdoorHumiditySensor?.state)
  return Number.isFinite(numericValue) ? `${Math.round(numericValue)}%` : '--'
}

function getAirQualityText(entityIndex) {
  const pm25Entity = entityIndex['sensor.xiaomi_cpa4_680c_pm25_density']
  const value = Number.parseFloat(pm25Entity?.state)

  if (!Number.isFinite(value)) {
    return '--'
  }

  return `${Math.round(value)} µg/m³`
}

function getWeatherVisuals(condition) {
  const normalized = (condition ?? '').toLowerCase()

  if (normalized.includes('rain') || normalized.includes('pouring')) {
    return { Icon: CloudRain, accent: '#2563eb', theme: 'rain' }
  }

  if (normalized.includes('fog') || normalized.includes('mist') || normalized.includes('haze')) {
    return { Icon: CloudFog, accent: '#64748b', theme: 'mist' }
  }

  if (normalized.includes('night')) {
    return { Icon: CloudMoon, accent: '#7c3aed', theme: 'night' }
  }

  if (normalized.includes('cloud')) {
    return { Icon: CloudSun, accent: '#0ea5e9', theme: 'cloud' }
  }

  return { Icon: Sun, accent: '#f59e0b', theme: 'sun' }
}

function getForecastItems(weatherEntity) {
  const forecast = weatherEntity?.attributes?.forecast

  if (!Array.isArray(forecast)) {
    return []
  }

  return forecast
    .map((entry, index) => {
      const temperature = Number.parseFloat(entry.temperature)
      const low = Number.parseFloat(entry.templow)
      const rainChance = Number.parseFloat(entry.precipitation_probability)

      return {
        index,
        datetime: entry.datetime,
        condition: titleCase(entry.condition ?? ''),
        conditionRaw: entry.condition ?? '',
        temperature: Number.isFinite(temperature) ? temperature : null,
        low: Number.isFinite(low) ? low : null,
        rainChance: Number.isFinite(rainChance) ? rainChance : null,
      }
    })
    .filter((entry) => entry.temperature !== null || entry.condition)
}

function formatForecastLabel(datetime, index) {
  if (!datetime) {
    return index === 0 ? 'Now' : `+${index}`
  }

  const parsed = new Date(datetime)
  if (Number.isNaN(parsed.getTime())) {
    return index === 0 ? 'Now' : `+${index}`
  }

  const sameDay = parsed.toDateString() === new Date().toDateString()
  return new Intl.DateTimeFormat('en-US', sameDay
    ? { hour: 'numeric' }
    : { weekday: 'short' }).format(parsed)
}

function buildSparklinePoints(values, width = 320, height = 72) {
  const filteredValues = values.filter((value) => Number.isFinite(value))

  if (filteredValues.length < 2) {
    return ''
  }

  const min = Math.min(...filteredValues)
  const max = Math.max(...filteredValues)
  const range = max - min || 1

  return filteredValues
    .map((value, index) => {
      const x = (index / (filteredValues.length - 1)) * width
      const y = height - (((value - min) / range) * (height - 10) + 5)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function getActiveOverviewDevices(entityIndex, devices, activeStates = ['on']) {
  return devices.filter((device) => activeStates.includes(entityIndex[device.entityId]?.state))
}

function normalizeForecastItems(forecastItems = []) {
  return forecastItems.map((entry, index) => {
    if ('conditionRaw' in entry) {
      return entry
    }

    const temperature = Number.parseFloat(entry.temperature)
    const low = Number.parseFloat(entry.templow)
    const rain = Number.parseFloat(entry.precipitation_probability)

    return {
      index,
      datetime: entry.datetime,
      condition: titleCase(entry.condition ?? ''),
      conditionRaw: entry.condition ?? '',
      temperature: Number.isFinite(temperature) ? temperature : null,
      low: Number.isFinite(low) ? low : null,
      rainChance: Number.isFinite(rain) ? rain : null,
    }
  })
}

function formatRelativeTime(timestamp) {
  const parsed = new Date(timestamp)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  const diffSeconds = Math.round((parsed.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const absoluteSeconds = Math.abs(diffSeconds)

  if (absoluteSeconds < 60) {
    return formatter.format(diffSeconds, 'second')
  }

  const diffMinutes = Math.round(diffSeconds / 60)
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  return formatter.format(diffHours, 'hour')
}

export default function HomePage({
  activity = [],
  entityIndex,
  outdoorTemperature,
  weatherForecast,
  onCallService,
}) {
  const weatherEntity = getWeatherEntity(entityIndex)
  const weatherCondition = formatWeatherCondition(weatherEntity?.state ?? 'clear')
  const outdoorTemperatureText = formatTemperature(
    weatherEntity?.attributes?.temperature ?? outdoorTemperature?.state,
    outdoorTemperature?.attributes?.unit_of_measurement ?? '°C',
  )
  const feelsLikeText = formatTemperature(
    weatherEntity?.attributes?.apparent_temperature ?? weatherEntity?.attributes?.temperature,
    outdoorTemperature?.attributes?.unit_of_measurement ?? '°C',
  )
  const humidityText = getOutdoorHumidity(entityIndex, weatherEntity)
  const airQualityText = getAirQualityText(entityIndex)
  const windValue = weatherEntity?.attributes?.wind_speed
  const windUnit = weatherEntity?.attributes?.wind_speed_unit ?? 'km/h'
  const windText = typeof windValue === 'number' ? `${Math.round(windValue)} ${windUnit}` : '--'
  const { Icon: WeatherIcon, accent: weatherAccent, theme: weatherTheme } = getWeatherVisuals(weatherEntity?.state)
  const hourlyForecastItems = normalizeForecastItems(
    Array.isArray(weatherForecast?.hourly) && weatherForecast.hourly.length
      ? weatherForecast.hourly
      : getForecastItems(weatherEntity),
  )
  const dailyForecastItems = normalizeForecastItems(Array.isArray(weatherForecast?.daily) ? weatherForecast.daily : [])
  const forecastItems = hourlyForecastItems.slice(0, 5)
  const forecastTemperatures = forecastItems.map((item) => item.temperature).filter((value) => Number.isFinite(value))
  const sparklinePath = buildSparklinePoints(forecastTemperatures)
  const dailyHighs = dailyForecastItems
    .map((item) => item.temperature)
    .filter((value) => Number.isFinite(value))
  const forecastHigh = dailyHighs.length
    ? Math.max(...dailyHighs)
    : (forecastTemperatures.length ? Math.max(...forecastTemperatures) : null)
  const forecastLow = dailyForecastItems.length ? dailyForecastItems : forecastItems
  const lowValues = forecastLow
    .map((item) => item.low)
    .filter((value) => Number.isFinite(value))
  const dayLow = lowValues.length ? Math.min(...lowValues) : null
  const rainSource = dailyForecastItems.length ? dailyForecastItems : forecastItems
  const rainChance = rainSource
    .map((item) => item.rainChance)
    .filter((value) => Number.isFinite(value))
  const peakRainChance = rainChance.length ? Math.max(...rainChance) : null

  const activeLights = getActiveOverviewDevices(entityIndex, OVERVIEW_DEVICE_GROUPS.lights)
  const activeFans = getActiveOverviewDevices(entityIndex, OVERVIEW_DEVICE_GROUPS.fans)
  const activeAirConditioners = getActiveOverviewDevices(entityIndex, OVERVIEW_DEVICE_GROUPS.airConditioners)
  const visibleActivity = activity.slice(0, 2)
  const [pendingActivations, setPendingActivations] = useState({})
  const [selectedOverviewGroup, setSelectedOverviewGroup] = useState(null)
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const selectedOverviewDevices = selectedOverviewGroup ? {
    lights: activeLights,
    fans: activeFans,
    airConditioners: activeAirConditioners,
  }[selectedOverviewGroup] : []

  useEffect(() => {
    if (!Object.keys(pendingActivations).length) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [pendingActivations])

  useEffect(() => {
    const expiredSceneIds = Object.entries(pendingActivations)
      .filter(([, activateAt]) => activateAt <= currentTime)
      .map(([entityId]) => entityId)

    if (!expiredSceneIds.length) {
      return
    }

    expiredSceneIds.forEach((entityId) => {
      if (entityIndex[entityId]?.state !== 'on') {
        onCallService('input_boolean', 'toggle', undefined, { entity_id: [entityId] })
      }
    })

    setPendingActivations((current) => {
      const next = { ...current }
      expiredSceneIds.forEach((entityId) => {
        delete next[entityId]
      })
      return next
    })
  }, [currentTime, entityIndex, onCallService, pendingActivations])

  useEffect(() => {
    setPendingActivations((current) => {
      const next = { ...current }
      let changed = false

      Object.keys(next).forEach((entityId) => {
        if (entityIndex[entityId]?.state === 'on') {
          delete next[entityId]
          changed = true
        }
      })

      return changed ? next : current
    })
  }, [entityIndex])

  const delayedSceneIds = useMemo(
    () => new Set(SCENES.filter((scene) => scene.activationDelayMs).map((scene) => scene.entityId)),
    [],
  )

  const handleSceneToggle = (scene, isActive) => {
    const pendingUntil = pendingActivations[scene.entityId]

    if (pendingUntil) {
      setPendingActivations((current) => {
        const next = { ...current }
        delete next[scene.entityId]
        return next
      })
      return
    }

    if (delayedSceneIds.has(scene.entityId) && !isActive) {
      setPendingActivations((current) => ({
        ...current,
        [scene.entityId]: Date.now() + scene.activationDelayMs,
      }))
      return
    }

    onCallService('input_boolean', 'toggle', undefined, { entity_id: [scene.entityId] })
  }

  return (
    <div className="home-shell">
      <section className="home-hero">
        <motion.div
          whileHover={{ y: -4 }}
          className={`card home-weather-card weather-theme-${weatherTheme}`}
        >
          <div className="home-weather-top">
            <div className="home-weather-copy">
              <div className="home-weather-condition">{weatherCondition}</div>
              <div className="home-weather-temperature">{outdoorTemperatureText}</div>
            </div>
            <div className="home-weather-icon" style={{ color: weatherAccent }}>
              <WeatherIcon size={44} />
            </div>
          </div>

          <div className="home-weather-hero-stats">
            <div className="home-weather-pill">
              <Thermometer size={14} />
              <span>Feels like {feelsLikeText}</span>
            </div>
            <div className="home-weather-pill">
              <Sun size={14} />
              <span>High {forecastHigh !== null ? formatTemperature(forecastHigh) : '--'}</span>
            </div>
            <div className="home-weather-pill">
              <Cloud size={14} />
              <span>Low {dayLow !== null ? formatTemperature(dayLow) : '--'}</span>
            </div>
            <div className="home-weather-pill">
              <CloudRain size={14} />
              <span>Rain {peakRainChance !== null ? `${Math.round(peakRainChance)}%` : '--'}</span>
            </div>
          </div>

          {sparklinePath ? (
            <div className="home-weather-graph">
              <svg viewBox="0 0 320 72" preserveAspectRatio="none" aria-hidden="true">
                <path className="home-weather-graph-fill" d={`${sparklinePath} L 320 72 L 0 72 Z`} />
                <path className="home-weather-graph-line" d={sparklinePath} />
              </svg>
            </div>
          ) : null}

          {forecastItems.length ? (
            <div className="home-forecast-row">
              {forecastItems.map((item) => {
                const { Icon } = getWeatherVisuals(item.conditionRaw)
                return (
                  <div className="home-forecast-item" key={`${item.datetime ?? item.index}-${item.conditionRaw}`}>
                    <span className="home-forecast-label">{formatForecastLabel(item.datetime, item.index)}</span>
                    <Icon size={16} />
                    <span className="home-forecast-temp">
                      {item.temperature !== null ? formatTemperature(item.temperature) : '--'}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : null}

          <div className="home-weather-metrics">
            <div className="home-mini-stat">
              <Droplets size={14} />
              <span>Humidity {humidityText}</span>
            </div>
            <div className="home-mini-stat">
              <Wind size={14} />
              <span>Wind {windText}</span>
            </div>
            <div className="home-mini-stat">
              <Leaf size={14} />
              <span>Air quality {airQualityText}</span>
            </div>
          </div>
        </motion.div>

        <div className="home-side-stack">
          <motion.div whileHover={{ y: -4 }} className="card home-overview-card">
            <div className="home-overview-head">
              <div>
                <div className="home-section-title">Overview</div>
              </div>
              <div className="home-overview-icon">
                <House size={18} />
              </div>
            </div>
            <div className="home-overview-grid">
              <div className="home-overview-stat">
                <button
                  className={`home-overview-value-button${selectedOverviewGroup === 'lights' ? ' active' : ''}`}
                  onClick={() => setSelectedOverviewGroup((current) => (current === 'lights' ? null : 'lights'))}
                  type="button"
                  aria-label="Show lights that are on"
                >
                  <span className="home-overview-value">{activeLights.length} <span className="home-overview-suffix">on</span></span>
                </button>
                <span className="home-overview-label">Lights</span>
                {selectedOverviewGroup === 'lights' ? (
                  <div className="home-overview-tooltip" role="tooltip">
                    <div className="home-overview-tooltip-title">{OVERVIEW_GROUP_LABELS[selectedOverviewGroup]} on</div>
                    {selectedOverviewDevices.length ? (
                      <div className="home-overview-tooltip-list">
                        {selectedOverviewDevices.map((device) => (
                          <div className="home-overview-tooltip-item" key={device.entityId}>{device.name}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="home-overview-tooltip-empty">None on</div>
                    )}
                  </div>
                ) : null}
              </div>
              <div className="home-overview-stat">
                <button
                  className={`home-overview-value-button${selectedOverviewGroup === 'fans' ? ' active' : ''}`}
                  onClick={() => setSelectedOverviewGroup((current) => (current === 'fans' ? null : 'fans'))}
                  type="button"
                  aria-label="Show fans that are on"
                >
                  <span className="home-overview-value">{activeFans.length} <span className="home-overview-suffix">on</span></span>
                </button>
                <span className="home-overview-label">Fans</span>
                {selectedOverviewGroup === 'fans' ? (
                  <div className="home-overview-tooltip" role="tooltip">
                    <div className="home-overview-tooltip-title">{OVERVIEW_GROUP_LABELS[selectedOverviewGroup]} on</div>
                    {selectedOverviewDevices.length ? (
                      <div className="home-overview-tooltip-list">
                        {selectedOverviewDevices.map((device) => (
                          <div className="home-overview-tooltip-item" key={device.entityId}>{device.name}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="home-overview-tooltip-empty">None on</div>
                    )}
                  </div>
                ) : null}
              </div>
              <div className="home-overview-stat">
                <button
                  className={`home-overview-value-button${selectedOverviewGroup === 'airConditioners' ? ' active' : ''}`}
                  onClick={() => setSelectedOverviewGroup((current) => (current === 'airConditioners' ? null : 'airConditioners'))}
                  type="button"
                  aria-label="Show air conditioners that are on"
                >
                  <span className="home-overview-value">{activeAirConditioners.length} <span className="home-overview-suffix">on</span></span>
                </button>
                <span className="home-overview-label">Air conditioners</span>
                {selectedOverviewGroup === 'airConditioners' ? (
                  <div className="home-overview-tooltip align-right" role="tooltip">
                    <div className="home-overview-tooltip-title">{OVERVIEW_GROUP_LABELS[selectedOverviewGroup]} on</div>
                    {selectedOverviewDevices.length ? (
                      <div className="home-overview-tooltip-list">
                        {selectedOverviewDevices.map((device) => (
                          <div className="home-overview-tooltip-item" key={device.entityId}>{device.name}</div>
                        ))}
                      </div>
                    ) : (
                      <div className="home-overview-tooltip-empty">None on</div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -4 }} className="card home-activity-card">
            <div className="home-activity-head">
              <div>
                <div className="home-section-title">Recent events</div>
              </div>
              <div className="home-activity-icon">
                <History size={18} />
              </div>
            </div>

            {visibleActivity.length ? (
              <div className="home-activity-list">
                {visibleActivity.map((item) => (
                  <div className="home-activity-item" key={item.id}>
                    <span className="home-activity-text">{item.label}</span>
                    <span className="home-activity-time">{formatRelativeTime(item.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="home-activity-empty">No recent activity</div>
            )}
          </motion.div>
        </div>
      </section>

      <section className="home-section">
        <motion.div whileHover={{ y: -4 }} className="card home-scenes-card">
          <div className="home-scenes-head">
            <div className="home-section-title">Scenes</div>
            <div className="home-scene-group-icon">
              <Clapperboard size={18} />
            </div>
          </div>

          <div className="home-scenes-grid">
            {SCENES.map((scene) => {
              const Icon = scene.icon
              const isActive = entityIndex[scene.entityId]?.state === 'on'
              const pendingUntil = pendingActivations[scene.entityId]
              const isPending = typeof pendingUntil === 'number' && pendingUntil > currentTime
              const pendingProgress = isPending && scene.activationDelayMs
                ? Math.min(100, Math.max(0, ((scene.activationDelayMs - (pendingUntil - currentTime)) / scene.activationDelayMs) * 100))
                : 0
              const stateLabel = isPending ? 'Activating' : (isActive ? 'Active' : 'Standby')

              return (
                <motion.button
                  key={scene.entityId}
                  whileTap={{ scale: 0.98 }}
                  className={`home-scene-card${isActive ? ' active' : ''}${isPending ? ' pending' : ''}`}
                  onClick={() => handleSceneToggle(scene, isActive)}
                  type="button"
                >
                  <div className="home-scene-head">
                    <span className="home-scene-label">{scene.label}</span>
                    <div className="home-scene-icon" style={{ color: scene.accent }}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="home-scene-copy">
                    <span className="home-scene-state">{stateLabel}</span>
                    {isPending ? (
                      <div className="home-scene-progress" aria-hidden="true">
                        <div className="home-scene-progress-fill" style={{ width: `${pendingProgress}%` }} />
                      </div>
                    ) : null}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
