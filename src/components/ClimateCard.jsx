import { motion } from 'framer-motion'
import { Minus, Plus, Snowflake } from 'lucide-react'

function Toggle({ checked, onClick }) {
  return (
    <button className={`control-switch climate-card-toggle${checked ? ' on' : ''}`} onClick={onClick} aria-pressed={checked} type="button">
      <span className="control-switch-thumb" />
    </button>
  )
}

export default function ClimateCard({
  title,
  wide = false,
  isOn,
  targetTemperature,
  filterRemaining,
  imageSrc,
  step = 1,
  onToggle,
  onTemperatureChange,
}) {
  const filterValue = Number.isFinite(filterRemaining)
    ? Math.max(0, Math.min(100, Math.round(filterRemaining)))
    : null
  const filterText = filterValue !== null ? `Filter ${filterValue}%` : 'Filter --'
  const canDecrease = isOn
  const canIncrease = isOn

  return (
    <motion.div whileHover={{ y: -4 }} className={`card climate-card${wide ? ' wide' : ''}${isOn ? ' active' : ''}`}>
      <div className="card-head climate-card-head">
        <div className="climate-card-head-main">
          <div className="card-title climate-card-title">{title}</div>
          <div className="climate-card-subtitle">Cool</div>
        </div>
        <div className="climate-card-controls">
          <Toggle checked={isOn} onClick={onToggle} />
        </div>
      </div>

      <div className="climate-card-body">
        <div className="climate-card-hero">
          {imageSrc ? (
            <img className="climate-card-image" src={imageSrc} alt="" aria-hidden="true" />
          ) : (
            <div className="climate-card-icon-wrap">
              <Snowflake size={42} />
            </div>
          )}
          <div className="climate-card-temperature">
            <span className="climate-card-temperature-value">{Number.isFinite(targetTemperature) ? Math.round(targetTemperature) : '--'}</span>
            <span className="climate-card-temperature-unit">°C</span>
          </div>
        </div>

        <div className="climate-card-stepper" aria-label={`${title} temperature controls`}>
          <button
            className="climate-card-stepper-button"
            onClick={() => canDecrease && onTemperatureChange?.(targetTemperature - step)}
            disabled={!canDecrease}
            aria-label={`Decrease ${title} temperature`}
            type="button"
          >
            <Minus size={16} />
          </button>
          <div className="climate-card-stepper-range">
            <div className="climate-card-filter-label">{filterText}</div>
            <div className="climate-card-filter-track" aria-hidden="true">
              <div
                className={`climate-card-filter-fill${filterValue !== null && filterValue <= 25 ? ' low' : ''}`}
                style={{ width: `${filterValue ?? 0}%` }}
              />
            </div>
          </div>
          <button
            className="climate-card-stepper-button"
            onClick={() => canIncrease && onTemperatureChange?.(targetTemperature + step)}
            disabled={!canIncrease}
            aria-label={`Increase ${title} temperature`}
            type="button"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
