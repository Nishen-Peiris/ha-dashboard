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
  onToggle,
}) {
  return (
    <motion.div whileHover={{ y: -4 }} className={`card climate-card${subtitle ? ' has-subtitle' : ''}${isOn ? ' active' : ''}`}>
      <div className="card-head climate-card-head">
        <div className="climate-card-head-main">
          <div className="card-title climate-card-title">{title}</div>
          {subtitle ? <div className="climate-card-subtitle">{subtitle}</div> : null}
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
        </div>
      </div>
    </motion.div>
  )
}
