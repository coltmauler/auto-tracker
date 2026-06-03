import { formatMoney, formatServiceDate } from '../lib/maintenance.js'

function Dashboard({
  latestMaintenanceRecord,
  latestMaintenanceVehicle,
  maintenanceRecordCount,
  totalMaintenanceCost,
  vehicleCount,
}) {
  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="section-label">Dashboard</p>
          <h2>Track your fleet and its service history in one place.</h2>
        </div>
        <div className="stat-card">
          <span className="stat-value">{vehicleCount}</span>
          <span className="stat-label">vehicles saved</span>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid-four">
        <article className="info-card">
          <h3>Total Vehicles</h3>
          <p className="big-number">{vehicleCount}</p>
          <p className="muted">All saved vehicles in localStorage.</p>
        </article>

        <article className="info-card">
          <h3>Total Maintenance Records</h3>
          <p className="big-number">{maintenanceRecordCount}</p>
          <p className="muted">Every service entry across all vehicles.</p>
        </article>

        <article className="info-card">
          <h3>Total Maintenance Cost</h3>
          <p className="big-number">{formatMoney(totalMaintenanceCost)}</p>
          <p className="muted">Sum of all maintenance costs recorded so far.</p>
        </article>

        <article className="info-card latest-activity-card">
          <h3>Latest Maintenance Activity</h3>
          {latestMaintenanceRecord ? (
            <div className="vehicle-summary">
              <strong>
                {latestMaintenanceRecord.serviceType}
                {latestMaintenanceVehicle
                  ? ` on ${latestMaintenanceVehicle.year} ${latestMaintenanceVehicle.make} ${latestMaintenanceVehicle.model}`
                  : ''}
              </strong>
              <p className="muted">
                {formatServiceDate(latestMaintenanceRecord.serviceDate)} ·{' '}
                {formatMoney(latestMaintenanceRecord.cost)}
              </p>
              {latestMaintenanceRecord.shop ? <p>{latestMaintenanceRecord.shop}</p> : null}
            </div>
          ) : (
            <p className="muted">No maintenance records have been logged yet.</p>
          )}
        </article>
      </div>
    </section>
  )
}

export default Dashboard
