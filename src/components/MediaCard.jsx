import { motion } from 'framer-motion'
import { Monitor } from 'lucide-react'

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
  isOn,
  imageSrc,
  imageClassName,
  onToggle,
}) {
  return (
    <motion.div whileHover={{ y: -4 }} className={`card media-card${subtitle ? ' has-subtitle' : ''}${isOn ? ' active' : ''}`}>
      <div className="card-head media-card-head">
        <div className="media-card-head-main">
          <div className="card-title media-card-title">{title}</div>
          {subtitle ? <div className="media-card-subtitle">{subtitle}</div> : null}
        </div>
        <div className="media-card-controls">
          <Toggle checked={isOn} onClick={onToggle} />
        </div>
      </div>

      <div className="media-card-body">
        <div className="media-card-hero">
          {imageSrc ? (
            <img className={`media-card-image${imageClassName ? ` ${imageClassName}` : ''}`} src={imageSrc} alt="" aria-hidden="true" />
          ) : (
            <div className="media-card-icon-wrap">
              <Monitor size={46} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
