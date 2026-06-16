import { useEffect, useRef, useState } from 'react'
import { Clapperboard, DoorOpen, Fan, Home, Menu, Moon, Power, RotateCcw, Snowflake, Sun, X } from 'lucide-react'

const DEVICE_GROUPS = {
  lights: [
    'light.outdoor_light',
    'light.corner_light',
    'light.front_room_light',
    'light.light_strip',
    'switch.table_lamp',
    'light.kitchen_light',
    'light.back_room_light',
    'light.bathroom_light',
  ],
  fans: [
    'fan.living_room_fan',
    'fan.front_room_fan',
    'fan.bedroom_fan',
  ],
  airConditioners: [
    'input_boolean.front_room_ac_power',
    'input_boolean.bedroom_ac_power',
  ],
}

const SCENE_ENTITY_IDS = [
  'input_boolean.away',
  'input_boolean.sleep_me',
  'input_boolean.sleep_both',
  'input_boolean.work_time',
  'input_boolean.play_time',
  'input_boolean.movie_time',
]

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

function formatRelativeTime(timestamp) {
  const parsed = new Date(timestamp)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  const diffSeconds = Math.round((parsed.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const absoluteSeconds = Math.abs(diffSeconds)

  if (absoluteSeconds < 60) {
    return formatter.format(diffSeconds, 'second')
  }

  const diffMinutes = Math.round(diffSeconds / 60)
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute')
  }

  const diffHours = Math.round(diffMinutes / 60)
  return formatter.format(diffHours, 'hour')
}

export default function DashboardHeader({
  activity = [],
  entityIndex,
  onPowerOff,
  onRestart,
  onThemeChange,
  occupiedRooms,
  openDoors,
  theme,
}) {
  const [activityOpen, setActivityOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const activityDialogRef = useRef(null)
  const visibleActivity = activity.slice(0, 12)
  const activeRooms = occupiedRooms.filter((room) => room.occupied)
  const activeDoors = openDoors.filter((door) => door.open)
  const doorText = activeDoors.length ? joinNatural(activeDoors.map((door) => stripTrailingWord(door.name, 'Door'))) : 'All secure'
  const occupancyText = activeRooms.length
    ? (activeRooms.length <= 2
      ? joinNatural(activeRooms.map((room) => room.name))
      : formatCount(activeRooms.length, 'room'))
    : 'No active rooms'
  const lightsOn = DEVICE_GROUPS.lights.filter((entityId) => entityIndex[entityId]?.state === 'on').length
  const fansOn = DEVICE_GROUPS.fans.filter((entityId) => entityIndex[entityId]?.state === 'on').length
  const airConditionersOn = DEVICE_GROUPS.airConditioners.filter((entityId) => entityIndex[entityId]?.state === 'on').length
  const activeScenes = SCENE_ENTITY_IDS.filter((entityId) => entityIndex[entityId]?.state === 'on').length
  const openActivity = () => setActivityOpen(true)

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => window.removeEventListener('pointerdown', handlePointerDown)
  }, [menuOpen])

  useEffect(() => {
    if (!activityOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!activityDialogRef.current?.contains(event.target)) {
        setActivityOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActivityOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activityOpen])

  return (
    <div className="header">
      <div className="header-main">
        <div className="header-chip-row">
          <button className="header-chip header-chip-button" onClick={openActivity} type="button">
            <DoorOpen size={14} />
            <div className="header-chip-body">
              <span className="header-chip-label">Doors</span>
              <span className="header-chip-value">{doorText}</span>
            </div>
          </button>
          <button className="header-chip header-chip-button" onClick={openActivity} type="button">
            <Home size={14} />
            <div className="header-chip-body">
              <span className="header-chip-label">Occupancy</span>
              <span className="header-chip-value">{occupancyText}</span>
            </div>
          </button>
          <button className="header-chip header-chip-button" onClick={openActivity} type="button">
            <Sun size={14} />
            <div className="header-chip-body">
              <span className="header-chip-label">Lights</span>
              <span className="header-chip-value">{formatCount(lightsOn, 'light')}</span>
            </div>
          </button>
          <button className="header-chip header-chip-button" onClick={openActivity} type="button">
            <Fan size={14} />
            <div className="header-chip-body">
              <span className="header-chip-label">Fans</span>
              <span className="header-chip-value">{formatCount(fansOn, 'fan')}</span>
            </div>
          </button>
          <button className="header-chip header-chip-button" onClick={openActivity} type="button">
            <Snowflake size={14} />
            <div className="header-chip-body">
              <span className="header-chip-label">Air Conditioners</span>
              <span className="header-chip-value">{formatCount(airConditionersOn, 'air conditioner')}</span>
            </div>
          </button>
          <button className="header-chip header-chip-button" onClick={openActivity} type="button">
            <Clapperboard size={14} />
            <div className="header-chip-body">
              <span className="header-chip-label">Scenes</span>
              <span className="header-chip-value">{formatCount(activeScenes, 'active scene')}</span>
            </div>
          </button>
        </div>

        <div className="header-title-actions" ref={menuRef}>
          <button
            className={`header-menu-button${menuOpen ? ' active' : ''}`}
            onClick={() => setMenuOpen((current) => !current)}
            title="Dashboard menu"
            aria-label="Dashboard menu"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            type="button"
          >
            <Menu size={16} />
          </button>

          {menuOpen ? (
            <div className="header-menu" role="menu" aria-label="Dashboard menu">
              <div className="header-menu-section">
                <div className="header-menu-label">Theme</div>
                <div className="header-theme-toggle" role="group" aria-label="Theme">
                  <button
                    className={`header-theme-option${theme === 'dark' ? ' active' : ''}`}
                    onClick={() => {
                      onThemeChange('dark')
                      setMenuOpen(false)
                    }}
                    type="button"
                  >
                    <Moon size={14} />
                    <span>Dark</span>
                  </button>
                  <button
                    className={`header-theme-option${theme === 'light' ? ' active' : ''}`}
                    onClick={() => {
                      onThemeChange('light')
                      setMenuOpen(false)
                    }}
                    type="button"
                  >
                    <Sun size={14} />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              <div className="header-menu-section">
                <button
                  className="header-menu-action"
                  onClick={() => {
                    setMenuOpen(false)
                    onRestart()
                  }}
                  role="menuitem"
                  type="button"
                >
                  <RotateCcw size={16} />
                  <span>Restart Home Assistant</span>
                </button>
                <button
                  className="header-menu-action danger"
                  onClick={() => {
                    setMenuOpen(false)
                    onPowerOff()
                  }}
                  role="menuitem"
                  type="button"
                >
                  <Power size={16} />
                  <span>Power Off Home Assistant</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {activityOpen ? (
        <div className="header-popup-backdrop">
          <div className="header-popup card" ref={activityDialogRef} role="dialog" aria-label="Recent events">
            <div className="header-popup-head">
              <div className="home-section-title">Recent events</div>
              <button
                className="header-popup-close"
                onClick={() => setActivityOpen(false)}
                title="Close recent events"
                aria-label="Close recent events"
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            {visibleActivity.length ? (
              <div className="home-activity-list">
                {visibleActivity.map((item) => (
                  <div className="home-activity-item" key={item.id}>
                    <span className="home-activity-text">{item.label}</span>
                    <span className="home-activity-time">{formatRelativeTime(item.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="home-activity-empty">No recent activity</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
