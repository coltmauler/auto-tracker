function Navigation({ activePage, appVersion, onNavigate, vehicleCount }) {
  return (
    <div className="navigation-shell">
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
          className={activePage === 'reports' ? 'nav-button active' : 'nav-button'}
          onClick={() => onNavigate('reports')}
        >
          Reports
        </button>
        <button
          type="button"
          className={activePage === 'settings' ? 'nav-button active' : 'nav-button'}
          onClick={() => onNavigate('settings')}
        >
          Settings
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
      <div className="nav-version" aria-label={`App version ${appVersion}`}>
        <span className="nav-version-label">App</span>
        <strong>{appVersion}</strong>
      </div>
    </div>
  )
}

export default Navigation
