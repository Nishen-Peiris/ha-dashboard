import { useEffect, useRef, useState } from 'react'
import { Power, RotateCcw } from 'lucide-react'
import ControlsPage from './components/ControlsPage'
import DashboardHeader from './components/DashboardHeader'
import HomePage from './components/HomePage'
import MetricCard from './components/MetricCard'
import NavigationRail from './components/NavigationRail'
import { useHomeAssistant } from './hooks/useHomeAssistant'

const HOME_IDLE_TIMEOUT_MS = 5 * 60 * 1000

export default function App() {
  const [activePage, setActivePage] = useState('home')
  const [selectedRoom, setSelectedRoom] = useState('Kitchen')
  const { callService, dashboardData } = useHomeAssistant()
  const { activity, doors, entityIndex, metrics, rooms, weatherForecast } = dashboardData
  const primaryMetrics = metrics.slice(0, 3)
  const secondaryMetrics = metrics.slice(3)
  const idleTimeoutRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
  }, [])

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

  return (
    <div className="dashboard">
      <div className="page-shell">
        <DashboardHeader
          occupiedRooms={rooms}
          openDoors={doors}
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

              if (item.type === 'page') {
                setActivePage('dashboard')
                return
              }

              setSelectedRoom(item.key)
              setActivePage('controls')
            }}
          />

          <div className="page-content">
            {activePage === 'home' ? (
              <HomePage
                activity={activity}
                entityIndex={entityIndex}
                outdoorTemperature={entityIndex['sensor.outdoor_temperature']}
                weatherForecast={weatherForecast}
                onCallService={callService}
              />
            ) : activePage === 'dashboard' ? (
              <div className="maintenance-shell">
                <div className="maintenance-toolbar">
                  <button
                    className="maintenance-toolbar-button"
                    onClick={() => {
                      if (window.confirm('Restart Home Assistant?')) {
                        callService('homeassistant', 'restart')
                      }
                    }}
                    title="Restart Home Assistant"
                    aria-label="Restart Home Assistant"
                    type="button"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    className="maintenance-toolbar-button danger"
                    onClick={() => {
                      if (window.confirm('Power off Home Assistant?')) {
                        callService('homeassistant', 'stop')
                      }
                    }}
                    title="Power Off Home Assistant"
                    aria-label="Power Off Home Assistant"
                    type="button"
                  >
                    <Power size={16} />
                  </button>
                </div>

                <div className="grid">
                  {primaryMetrics.map((metric) => (
                    <MetricCard key={metric.title} {...metric} />
                  ))}
                </div>

                {secondaryMetrics.length ? (
                  <div className="grid grid-secondary">
                    {secondaryMetrics.map((metric) => (
                      <MetricCard key={metric.title} {...metric} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <ControlsPage selectedRoom={selectedRoom} entityIndex={entityIndex} onCallService={callService} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
