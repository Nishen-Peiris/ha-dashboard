import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

function Toggle({ checked, onClick }) {
  return (
    <button className={`control-switch device-card-toggle${checked ? ' on' : ''}`} onClick={onClick} aria-pressed={checked} type="button">
      <span className="control-switch-thumb" />
    </button>
  )
}

export default function DeviceCard({
  title,
  subtitle,
  subtitleMenuLabel,
  subtitleMenuOpen = false,
  subtitleMenuOptions = [],
  onSubtitleClick,
  onSubtitleSelect,
  icon: Icon,
  imageSrc,
  imageClassName,
  isOn,
  onCardClick,
  onToggle,
  headerControl,
  showToggle = true,
}) {
  const isInteractiveCard = typeof onCardClick === 'function'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`card device-card${subtitle ? ' has-subtitle' : ''}${isOn ? ' active' : ''}${isInteractiveCard ? ' has-brightness-control' : ''}`}
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
      <div className="card-head device-card-head">
        <div className="device-card-head-main">
          <div className="card-title device-card-title">{title}</div>
          {subtitle ? (
            onSubtitleClick ? (
              <div className="device-card-subtitle-wrap">
                <button
                  className={`device-card-subtitle-button${subtitleMenuOpen ? ' active' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSubtitleClick()
                  }}
                  type="button"
                >
                  <span>{subtitleMenuLabel ?? subtitle}</span>
                  <ChevronDown size={12} />
                </button>
                {subtitleMenuOpen ? (
                  <div className="device-card-subtitle-menu">
                    {subtitleMenuOptions.map((option) => (
                      <button
                        key={option}
                        className={`device-card-subtitle-option${subtitle === option ? ' active' : ''}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          onSubtitleSelect?.(option)
                        }}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="device-card-subtitle">{subtitle}</div>
            )
          ) : null}
        </div>
        {headerControl ? (
          <div className="device-card-controls">{headerControl}</div>
        ) : showToggle ? (
          <div className="device-card-controls">
            <Toggle checked={isOn} onClick={(event) => {
              event.stopPropagation()
              onToggle?.()
            }}
            />
          </div>
        ) : null}
      </div>

      <div className="device-card-body">
        <div className="device-card-visual">
          {imageSrc ? (
            <img className={`device-card-image${imageClassName ? ` ${imageClassName}` : ''}`} src={imageSrc} alt="" aria-hidden="true" />
          ) : (
            <div className="device-card-icon-wrap">
              <Icon size={44} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
