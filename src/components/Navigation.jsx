function Navigation({ activePage, onNavigate, vehicleCount }) {
  return (
    <nav className="navigation" aria-label="Primary">
      <button
        type="button"
        className={activePage === 'dashboard' ? 'nav-button active' : 'nav-button'}
        onClick={() => onNavigate('dashboard')}
      >
        Dashboard
      </button>
      <button
        type="button"
        className={activePage === 'vehicles' ? 'nav-button active' : 'nav-button'}
        onClick={() => onNavigate('vehicles')}
      >
        Vehicles
        <span className="nav-count">{vehicleCount}</span>
      </button>
    </nav>
  )
}

export default Navigation
