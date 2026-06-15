export default function Gauge({ value, color, label = value === null ? '--' : `${value}%` }) {
  const radius = 34
  const circumference = 2 * Math.PI * radius
  const normalizedValue = value === null ? 0 : Math.max(0, Math.min(100, value))
  const offset = circumference - (normalizedValue / 100) * circumference

  return (
    <div className="gauge" aria-label={label}>
      <svg viewBox="0 0 86 86">
        <circle className="gauge-track" cx="43" cy="43" r={radius} />
        <circle
          className="gauge-value"
          cx="43"
          cy="43"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="gauge-label">{label}</div>
    </div>
  )
}
