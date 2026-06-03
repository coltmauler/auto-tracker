import { formatMoney, formatServiceDate } from '../lib/maintenance.js'
import { formatFuelMileage, formatFuelNumber } from '../lib/fuel.js'

function Dashboard({
  fuelAverageMpg,
  fuelCostPerMile,
  fuelLifetimeSpend,
  fuelMonthlySpend,
  fuelRecordCount,
  latestFuelRecord,
  latestFuelVehicle,
  latestMaintenanceRecord,
  latestMaintenanceVehicle,
  nextAlert,
  overdueAlertCount,
  maintenanceRecordCount,
  upcomingAlertCount,
  totalMaintenanceCost,
  vehicleCount,
}) {
  return (
    <section className="page-panel">
      <div className="page-header">
        <div>
          <p className="section-label">Dashboard</p>
          <h2>Track your fleet, service work, alerts, and fuel history in one place.</h2>
        </div>
        <div className="stat-card">
          <span className="stat-value">{vehicleCount}</span>
          <span className="stat-label">vehicles saved</span>
        </div>
      </div>

      <div className="dashboard-stack">
        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <h3>Overview</h3>
            <p className="muted">Core inventory and activity totals.</p>
          </div>
          <div className="dashboard-grid dashboard-grid-three">
            <article className="info-card">
              <h3>Total Vehicles</h3>
              <p className="big-number">{vehicleCount}</p>
            </article>

            <article className="info-card">
              <h3>Total Maintenance Records</h3>
              <p className="big-number">{maintenanceRecordCount}</p>
            </article>

            <article className="info-card">
              <h3>Total Fuel Records</h3>
              <p className="big-number">{fuelRecordCount}</p>
            </article>

            <article className="info-card">
              <h3>Total Maintenance Cost</h3>
              <p className="big-number">{formatMoney(totalMaintenanceCost)}</p>
            </article>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <h3>Alerts</h3>
            <p className="muted">Maintenance warnings from service schedules.</p>
          </div>
          <div className="dashboard-grid dashboard-grid-three">
            <article className="info-card">
              <h3>Upcoming Alerts</h3>
              <p className="big-number">{upcomingAlertCount}</p>
            </article>

            <article className="info-card">
              <h3>Overdue Alerts</h3>
              <p className="big-number">{overdueAlertCount}</p>
            </article>

            <article className="info-card latest-activity-card">
              <h3>Next Alert</h3>
              {nextAlert ? (
                <div className="vehicle-summary">
                  <strong>
                    {nextAlert.serviceLabel}
                    {nextAlert.vehicleLabel ? ` on ${nextAlert.vehicleLabel}` : ''}
                  </strong>
                  <p className="muted">{nextAlert.message}</p>
                </div>
              ) : (
                <p className="muted">No upcoming or overdue alerts right now.</p>
              )}
            </article>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <h3>Fuel</h3>
            <p className="muted">Spend and efficiency across all saved vehicles.</p>
          </div>
          <div className="dashboard-grid dashboard-grid-two">
            <article className="info-card">
              <h3>Lifetime Fuel Spend</h3>
              <p className="big-number">{formatMoney(fuelLifetimeSpend)}</p>
            </article>

            <article className="info-card">
              <h3>Monthly Fuel Spend</h3>
              <p className="big-number">{formatMoney(fuelMonthlySpend)}</p>
              <p className="muted">Current calendar month.</p>
            </article>

            <article className="info-card">
              <h3>Average MPG</h3>
              <p className="big-number">
                {fuelAverageMpg != null ? formatFuelNumber(fuelAverageMpg) : 'N/A'}
              </p>
            </article>

            <article className="info-card">
              <h3>Cost per Mile</h3>
              <p className="big-number">
                {fuelCostPerMile != null ? formatMoney(fuelCostPerMile) : 'N/A'}
              </p>
            </article>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <h3>Recent Activity</h3>
            <p className="muted">Latest maintenance and fuel entries.</p>
          </div>
          <div className="dashboard-grid dashboard-grid-two">
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
                    {formatServiceDate(latestMaintenanceRecord.serviceDate)} -{' '}
                    {formatMoney(latestMaintenanceRecord.cost)}
                  </p>
                  {latestMaintenanceRecord.shop ? <p>{latestMaintenanceRecord.shop}</p> : null}
                </div>
              ) : (
                <p className="muted">No maintenance records have been logged yet.</p>
              )}
            </article>

            <article className="info-card latest-activity-card">
              <h3>Latest Fuel Activity</h3>
              {latestFuelRecord ? (
                <div className="vehicle-summary">
                  <strong>
                    {formatServiceDate(latestFuelRecord.fillDate)}
                    {latestFuelVehicle
                      ? ` on ${latestFuelVehicle.year} ${latestFuelVehicle.make} ${latestFuelVehicle.model}`
                      : ''}
                  </strong>
                  <p className="muted">
                    {formatFuelMileage(Number(latestFuelRecord.mileage) || null)} miles -{' '}
                    {formatFuelMileage(Number(latestFuelRecord.gallons) || null)} gallons -{' '}
                    {formatMoney(latestFuelRecord.cost)}
                  </p>
                  {latestFuelRecord.station ? <p>{latestFuelRecord.station}</p> : null}
                </div>
              ) : (
                <p className="muted">No fuel records have been logged yet.</p>
              )}
            </article>
          </div>
        </section>
      </div>
    </section>
  )
}

export default Dashboard
