import { useEffect, useMemo, useState } from 'react'
import { DoorOpen, Home } from 'lucide-react'

const IST_TIME_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
  timeZone: 'Asia/Kolkata',
})

const IST_DATE_FORMATTER = new Intl.DateTimeFormat('en-IN', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'Asia/Kolkata',
})

function getWelcomeMessage() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function joinNatural(items) {
  if (!items.length) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function formatCount(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function stripTrailingWord(value, word) {
  return value.replace(new RegExp(`\\s*${word}$`, 'i'), '').trim()
}

export default function DashboardHeader({
  occupiedRooms,
  openDoors,
}) {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const formattedTime = useMemo(() => IST_TIME_FORMATTER.format(currentTime), [currentTime])
  const formattedDate = useMemo(() => IST_DATE_FORMATTER.format(currentTime), [currentTime])
  const activeRooms = occupiedRooms.filter((room) => room.occupied)
  const activeDoors = openDoors.filter((door) => door.open)
  const doorText = activeDoors.length ? joinNatural(activeDoors.map((door) => stripTrailingWord(door.name, 'Door'))) : 'All secure'
  const occupancyText = activeRooms.length
    ? (activeRooms.length <= 2
      ? joinNatural(activeRooms.map((room) => room.name))
      : formatCount(activeRooms.length, 'room'))
    : 'No active rooms'
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="header">
      <div className="header-main">
        <div className="header-copy">
          <div className="title">{getWelcomeMessage()}</div>
        </div>

        <div className="header-chip-row">
          <div className="header-chip">
            <DoorOpen size={14} />
            <div className="header-chip-body">
              <span className="header-chip-label">Doors</span>
              <span className="header-chip-value">{doorText}</span>
            </div>
          </div>
          <div className="header-chip">
            <Home size={14} />
            <div className="header-chip-body">
              <span className="header-chip-label">Occupancy</span>
              <span className="header-chip-value">{occupancyText}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="header-side">
        <div className="header-topline">
          <div className="header-time-block">
            <div className="header-time-label">{formattedDate}</div>
            <div className="header-time">{formattedTime}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
