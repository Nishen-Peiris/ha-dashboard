import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import Gauge from './Gauge'

function StatGaugeRow({ stats }) {
  return (
    <div className={`system-resource-wrapper${stats.length > 2 ? ' system-resource-wrapper-wide' : ''}`}>
      {stats.map((stat) => (
        <div className="resource-block" key={stat.label}>
          <div className="resource-label">{stat.label}</div>
          <Gauge
            value={Math.min(stat.value, 100)}
            color={stat.color}
            label={stat.displayLabel ?? `${stat.value}%`}
          />
        </div>
      ))}
    </div>
  )
}

function HistoryRow({ history, stats }) {
  return (
    <div className="metric-history">
      <div className="metric-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            {stats.map((stat) => (
              <Area
                key={stat.label}
                type="monotone"
                dataKey={stat.dataKey}
                stroke={stat.color}
                fill={stat.color}
                fillOpacity={0.12}
                strokeWidth={2.5}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="metric-stat-row">
        {stats.map((stat) => (
          <div className="metric-stat" key={stat.label}>
            <div className="metric-stat-label">
              <span className="metric-stat-dot" style={{ background: stat.color }} />
              {stat.label}
            </div>
            <div className="metric-stat-value">{stat.displayLabel ?? `${stat.value}%`}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusRow({ status, stats = [], Icon, tone, imageSrc }) {
  const isActive = status.tone === 'active'

  return (
    <div className={`status-card status-card-${status.tone}`}>
      <motion.div
        className={imageSrc ? 'status-product-image-wrap' : 'status-product-icon'}
        style={{ color: tone }}
        animate={isActive ? { y: [0, -4, 0] } : { y: 0 }}
        transition={isActive ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' } : undefined}
      >
        {imageSrc ? (
          <img className="status-product-image" src={imageSrc} alt="" aria-hidden="true" />
        ) : (
          <Icon size={48} />
        )}
      </motion.div>
      <div className="status-main">
        {stats.length ? (
          <div className="status-gauge">
            <div className="resource-block">
              <div className="resource-label">{stats[0].label}</div>
              <Gauge
                value={Math.min(stats[0].value, 100)}
                color={stats[0].color}
                label={stats[0].displayLabel ?? `${stats[0].value}%`}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function MetricCard({ title, kind, value, suffix, icon: Icon, tone, stats, history, status, imageSrc }) {
  const isStatusCard = kind === 'status'
  const useProminentTitle = isStatusCard || kind === 'history'

  return (
    <motion.div whileHover={{ y: -4 }} className="card">
      <div className="card-head">
        <div className={useProminentTitle ? 'card-title-block' : undefined}>
          <div className={`card-title${useProminentTitle ? ' card-title-status' : ''}`}>{title}</div>
          {isStatusCard ? <div className="card-subtitle">{status?.value}</div> : null}
        </div>

        <div className="metric-icon" style={{ color: tone }}>
          <Icon />
        </div>
      </div>

      {kind === 'single' ? (
        <div className="metric-body">
          <div className="big">
            {value}
            {suffix}
          </div>

          <Gauge value={value} color={tone} />
        </div>
      ) : kind === 'history' ? (
        <HistoryRow history={history} stats={stats} />
      ) : kind === 'status' ? (
        <StatusRow status={status} stats={stats} Icon={Icon} tone={tone} imageSrc={imageSrc} />
      ) : (
        <StatGaugeRow stats={stats} />
      )}
    </motion.div>
  )
}
