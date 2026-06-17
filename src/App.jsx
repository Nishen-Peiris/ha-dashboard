import { useEffect, useRef, useState } from 'react'
import ControlsPage from './components/ControlsPage'
import DashboardHeader from './components/DashboardHeader'
import HomePage from './components/HomePage'
import NavigationRail from './components/NavigationRail'
import { useHomeAssistant } from './hooks/useHomeAssistant'

const HOME_IDLE_TIMEOUT_MS = 5 * 60 * 1000
const THEME_STORAGE_KEY = 'ha-dashboard-theme'
const TITLE_BAR_VISIBLE_STORAGE_KEY = 'ha-dashboard-title-bar-visible'

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [selectedRoom, setSelectedRoom] = useState('Kitchen')
  const [theme, setTheme] = useState(() => window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'dark')
  const [showTitleBar, setShowTitleBar] = useState(() => window.localStorage.getItem(TITLE_BAR_VISIBLE_STORAGE_KEY) !== 'false')
  const { callService, dashboardData } = useHomeAssistant()
  const { doors, entityIndex, metrics, rooms } = dashboardData
  const idleTimeoutRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem(TITLE_BAR_VISIBLE_STORAGE_KEY, String(showTitleBar))
  }, [showTitleBar])

  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current)
      }

      idleTimeoutRef.current = window.setTimeout(() => {
        setActivePage('home')
      }, HOME_IDLE_TIMEOUT_MS)
    }

    const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart']

    resetIdleTimer()
    events.forEach((eventName) => {
      window.addEventListener(eventName, resetIdleTimer, { passive: true })
    })

    return () => {
      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current)
      }

      events.forEach((eventName) => {
        window.removeEventListener(eventName, resetIdleTimer)
      })
    }
  }, [])

  const handleRestart = () => {
    if (window.confirm('Restart Home Assistant?')) {
      callService('homeassistant', 'restart')
    }
  }

  const handlePowerOff = () => {
    if (window.confirm('Power off Home Assistant?')) {
      callService('homeassistant', 'stop')
    }
  }

  return (
    <div className="dashboard">
      <div className="page-shell">
        <DashboardHeader
          entityIndex={entityIndex}
          onPowerOff={handlePowerOff}
          onRestart={handleRestart}
          onThemeChange={setTheme}
          occupiedRooms={rooms}
          openDoors={doors}
          onTitleBarVisibilityChange={setShowTitleBar}
          showTitleBar={showTitleBar}
          theme={theme}
        />

        <div className="content-layout">
          <NavigationRail
            activePage={activePage}
            selectedRoom={selectedRoom}
            onNavigate={(item) => {
              if (item.type === 'page' && item.key === 'home') {
                setActivePage('home')
                return
              }

              setSelectedRoom(item.key)
              setActivePage('controls')
            }}
          />

          <div className={`page-content${activePage === 'home' ? ' page-content-home' : ''}`}>
            {activePage === 'home' ? (
              <HomePage
                metrics={metrics}
              />
            ) : (
              <ControlsPage selectedRoom={selectedRoom} entityIndex={entityIndex} onCallService={callService} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
