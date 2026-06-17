import { motion } from 'framer-motion'
import { Snowflake } from 'lucide-react'

function Toggle({ checked, onClick }) {
  return (
    <button className={`control-switch climate-card-toggle${checked ? ' on' : ''}`} onClick={onClick} aria-pressed={checked} type="button">
      <span className="control-switch-thumb" />
    </button>
  )
}

export default function ClimateCard({
  title,
  subtitle,
  isOn,
  imageSrc,
  imageClassName,
  onCardClick,
  onToggle,
}) {
  const isInteractiveCard = typeof onCardClick === 'function'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`card climate-card${subtitle ? ' has-subtitle' : ''}${isOn ? ' active' : ''}${isInteractiveCard ? ' has-adjustment-control' : ''}`}
      onClick={onCardClick}
      onKeyDown={(event) => {
        if (!isInteractiveCard) {
          return
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onCardClick()
        }
      }}
      role={isInteractiveCard ? 'button' : undefined}
      tabIndex={isInteractiveCard ? 0 : undefined}
    >
      <div className="card-head climate-card-head">
        <div className="climate-card-head-main">
          <div className="card-title climate-card-title">{title}</div>
          {subtitle ? <div className="climate-card-subtitle">{subtitle}</div> : null}
        </div>
        <div className="climate-card-controls">
          <Toggle checked={isOn} onClick={(event) => {
            event.stopPropagation()
            onToggle?.()
          }}
          />
        </div>
      </div>

      <div className="climate-card-body">
        <div className="climate-card-hero">
          {imageSrc ? (
            <img className={`climate-card-image${imageClassName ? ` ${imageClassName}` : ''}`} src={imageSrc} alt="" aria-hidden="true" />
          ) : (
            <div className="climate-card-icon-wrap">
              <Snowflake size={42} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
