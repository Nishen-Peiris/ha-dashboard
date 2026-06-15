import { motion } from 'framer-motion'
import { Monitor, Pause, Play } from 'lucide-react'

function Toggle({ checked, onClick }) {
  return (
    <button className={`control-switch media-card-toggle${checked ? ' on' : ''}`} onClick={onClick} aria-pressed={checked} type="button">
      <span className="control-switch-thumb" />
    </button>
  )
}

export default function MediaCard({
  title,
  subtitle,
  wide = false,
  isOn,
  imageSrc,
  volume = 0,
  onToggle,
  onPlay,
  onPause,
  onVolumeChange,
}) {
  const volumeText = `${Math.round(volume)}%`

  return (
    <motion.div whileHover={{ y: -4 }} className={`card media-card${wide ? ' wide' : ''}${isOn ? ' active' : ''}`}>
      <div className="card-head media-card-head">
        <div className="media-card-head-main">
          <div className="card-title media-card-title">{title}</div>
          <div className="media-card-subtitle">{subtitle ?? 'Media'}</div>
        </div>
        <div className="media-card-controls">
          <Toggle checked={isOn} onClick={onToggle} />
        </div>
      </div>

      <div className="media-card-body">
        <div className="media-card-hero">
          {imageSrc ? (
            <img className="media-card-image" src={imageSrc} alt="" aria-hidden="true" />
          ) : (
            <div className="media-card-icon-wrap">
              <Monitor size={46} />
            </div>
          )}
        </div>

        <div className="media-card-controls-row">
          <div className="media-card-actions">
            <button
              className="media-card-button"
              onClick={onPlay}
              type="button"
              aria-label={`Play ${title}`}
              title={`Play ${title}`}
            >
              <Play size={15} />
            </button>
            <button
              className="media-card-button"
              onClick={onPause}
              type="button"
              aria-label={`Pause ${title}`}
              title={`Pause ${title}`}
            >
              <Pause size={15} />
            </button>
          </div>

          <div className="media-card-slider-block">
            <input
              className="media-card-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={volume}
              onChange={(event) => onVolumeChange?.(Number(event.target.value))}
              aria-label={`${title} volume`}
            />
          </div>
          <div className="media-card-level">{volumeText}</div>
        </div>
      </div>
    </motion.div>
  )
}
