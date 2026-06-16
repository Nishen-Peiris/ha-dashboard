import { motion } from 'framer-motion'
import MetricCard from './MetricCard'

const SECOND_ROW_METRIC_TITLES = new Set([
  'Comfri Air Conditioner',
  'Xiaomi Robot Vacuum',
  'Xiaomi Air Purifier',
])

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

export default function HomePage({ metrics = [] }) {
  const primaryMetrics = metrics.filter((metric) => !SECOND_ROW_METRIC_TITLES.has(metric.title))
  const secondaryMetrics = metrics.filter((metric) => SECOND_ROW_METRIC_TITLES.has(metric.title))

  return (
    <div className="home-shell">
      {metrics.length ? (
        <section className="home-section">
          <div className="home-metrics-layout">
            <div className="home-metrics-stack">
              {primaryMetrics.length ? (
                <div className="home-metrics-grid" aria-label="System metrics">
                  {primaryMetrics.map((metric) => (
                    <MetricCard key={metric.title} {...metric} />
                  ))}
                </div>
              ) : null}

              {secondaryMetrics.length ? (
                <div className="home-metrics-grid" aria-label="Device status metrics">
                  {secondaryMetrics.map((metric) => (
                    <MetricCard key={metric.title} {...metric} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
