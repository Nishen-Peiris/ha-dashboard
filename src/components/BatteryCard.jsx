export default function BatteryCard({ name, value }) {
  const color = value > 60 ? '#22c55e' : value > 30 ? '#eab308' : '#ef4444'

  return (
    <div className="battery-row">
      <div className="battery-name">{name}</div>

      <div className="battery-progress">
        <div
          className="battery-progress-inner"
          style={{
            width: `${value}%`,
            background: color,
          }}
        />
      </div>

      <div className="battery-value">{value}%</div>
    </div>
  )
}
