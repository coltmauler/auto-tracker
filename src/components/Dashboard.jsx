function Dashboard({ vehicleCount, vehicles }) {
  const latestVehicle = vehicles[0]

  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="section-label">Dashboard</p>
          <h2>Track the vehicles you own without leaving the browser.</h2>
        </div>
        <div className="stat-card">
          <span className="stat-value">{vehicleCount}</span>
          <span className="stat-label">vehicles saved</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="info-card">
          <h3>Current inventory</h3>
          <p>
            Add vehicles on the Vehicles page. Everything is stored in localStorage
            for now, so the data stays on this device.
          </p>
        </article>

        <article className="info-card">
          <h3>Vehicle count</h3>
          <p className="big-number">{vehicleCount}</p>
          <p className="muted">This count updates as you add, edit, or delete vehicles.</p>
        </article>

        <article className="info-card">
          <h3>Latest entry</h3>
          {latestVehicle ? (
            <div className="vehicle-summary">
              <strong>
                {latestVehicle.year} {latestVehicle.make} {latestVehicle.model}
              </strong>
              <p>{latestVehicle.nickname || 'No nickname yet'}</p>
              <p className="muted">
                {latestVehicle.mileage} miles
                {latestVehicle.licensePlate ? ` · ${latestVehicle.licensePlate}` : ''}
              </p>
            </div>
          ) : (
            <p className="muted">No vehicles have been added yet.</p>
          )}
        </article>
      </div>
    </section>
  )
}

export default Dashboard
