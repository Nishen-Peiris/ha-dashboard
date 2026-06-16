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

function getWelcomeMessage() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function getEntityLabel(entity, fallbackEntityId) {
  return entity?.attributes?.friendly_name ?? fallbackEntityId
}

export default function DashboardHeader({
  entityIndex,
  onPowerOff,
  onRestart,
  onThemeChange,
  occupiedRooms,
  openDoors,
  theme,
}) {
  const [selectedChip, setSelectedChip] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const chipDialogRef = useRef(null)
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
  const openChip = (chip) => setSelectedChip(chip)
  const activeLightItems = DEVICE_GROUPS.lights
    .filter((entityId) => entityIndex[entityId]?.state === 'on')
    .map((entityId) => getEntityLabel(entityIndex[entityId], entityId))
  const activeFanItems = DEVICE_GROUPS.fans
    .filter((entityId) => entityIndex[entityId]?.state === 'on')
    .map((entityId) => getEntityLabel(entityIndex[entityId], entityId))
  const activeAirConditionerItems = DEVICE_GROUPS.airConditioners
    .filter((entityId) => entityIndex[entityId]?.state === 'on')
    .map((entityId) => getEntityLabel(entityIndex[entityId], entityId))
  const activeSceneItems = SCENE_ENTITY_IDS
    .filter((entityId) => entityIndex[entityId]?.state === 'on')
    .map((entityId) => getEntityLabel(entityIndex[entityId], entityId))
  const headerChips = [
    activeDoors.length > 0 ? {
      key: 'doors',
      icon: DoorOpen,
      label: 'Doors',
      value: doorText,
      items: activeDoors.map((door) => door.name),
    } : null,
    activeRooms.length > 0 ? {
      key: 'occupancy',
      icon: Home,
      label: 'Occupancy',
      value: occupancyText,
      items: activeRooms.map((room) => room.name),
    } : null,
    lightsOn > 0 ? {
      key: 'lights',
      icon: Sun,
      label: 'Lights',
      value: formatCount(lightsOn, 'light'),
      items: activeLightItems,
    } : null,
    fansOn > 0 ? {
      key: 'fans',
      icon: Fan,
      label: 'Fans',
      value: formatCount(fansOn, 'fan'),
      items: activeFanItems,
    } : null,
    airConditionersOn > 0 ? {
      key: 'air-conditioners',
      icon: Snowflake,
      label: 'Air Conditioners',
      value: formatCount(airConditionersOn, 'air conditioner'),
      items: activeAirConditionerItems,
    } : null,
    activeScenes > 0 ? {
      key: 'scenes',
      icon: Clapperboard,
      label: 'Scenes',
      value: formatCount(activeScenes, 'active scene'),
      items: activeSceneItems,
    } : null,
  ].filter(Boolean)

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
    if (!selectedChip) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!chipDialogRef.current?.contains(event.target)) {
        setSelectedChip(null)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedChip(null)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedChip])

  return (
    <div className="header">
      <div className="header-main">
        <div className="header-greeting" aria-hidden="true">
          <div className="header-greeting-title">{getWelcomeMessage()}</div>
        </div>

        <div className="header-chip-row">
          {headerChips.map((chip) => {
            const Icon = chip.icon

            return (
              <button className="header-chip header-chip-button" onClick={() => openChip(chip)} type="button" key={chip.key}>
                <Icon size={14} />
                <div className="header-chip-body">
                  <span className="header-chip-label">{chip.label}</span>
                  <span className="header-chip-value">{chip.value}</span>
                </div>
              </button>
            )
          })}
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

      {selectedChip ? (
        <div className="header-popup-backdrop">
          <div className="header-popup card" ref={chipDialogRef} role="dialog" aria-label={selectedChip.label}>
            <div className="header-popup-head">
              <div className="home-section-title">{selectedChip.label}</div>
              <button
                className="header-popup-close"
                onClick={() => setSelectedChip(null)}
                title={`Close ${selectedChip.label}`}
                aria-label={`Close ${selectedChip.label}`}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            {selectedChip.items.length ? (
              <div className="home-activity-list">
                {selectedChip.items.map((item) => (
                  <div className="home-activity-item" key={item}>
                    <span className="home-activity-text">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="home-activity-empty">No active items</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
