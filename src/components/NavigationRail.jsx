import {
  Bath,
  BedDouble,
  ChefHat,
  DoorOpen,
  House,
  LayoutGrid,
  Sofa,
  Trees,
  Warehouse,
} from 'lucide-react'

const NAV_ITEMS = [
  { key: 'home', label: 'Home', shortLabel: 'Home', icon: House, type: 'page' },
  { key: 'Outdoor', label: 'Outdoor', shortLabel: 'Out', icon: Trees, type: 'room' },
  { key: 'Living Room', label: 'Living Room', shortLabel: 'Living', icon: Sofa, type: 'room' },
  { key: 'Front Room', label: 'Front Room', shortLabel: 'Front', icon: DoorOpen, type: 'room' },
  { key: 'Bedroom', label: 'Bedroom', shortLabel: 'Bed', icon: BedDouble, type: 'room' },
  { key: 'Kitchen', label: 'Kitchen', shortLabel: 'Kit', icon: ChefHat, type: 'room' },
  { key: 'Back Room', label: 'Back Room', shortLabel: 'Back', icon: Warehouse, type: 'room' },
  { key: 'Bathroom', label: 'Bathroom', shortLabel: 'Bath', icon: Bath, type: 'room' },
  { key: 'dashboard', label: 'Maintenance', shortLabel: 'Main', icon: LayoutGrid, type: 'page' },
]

export default function NavigationRail({ activePage, selectedRoom, onNavigate }) {
  return (
    <nav className="nav-rail" aria-label="Primary navigation">
      <div className="nav-rail-track">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.type === 'page'
            ? activePage === item.key
            : activePage === 'controls' && selectedRoom === item.key

          return (
            <button
              key={item.key}
              className={`nav-rail-button${isActive ? ' active' : ''}`}
              onClick={() => onNavigate(item)}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              type="button"
            >
              <Icon size={18} />
              <span className="nav-rail-label">{item.shortLabel}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
