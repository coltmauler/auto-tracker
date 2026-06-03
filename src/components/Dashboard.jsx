import { formatMoney, formatServiceDate } from '../lib/maintenance.js'
import { formatFuelMileage, formatFuelNumber } from '../lib/fuel.js'
import { formatDocumentDate } from '../lib/documents.js'
import { formatExpenseDate } from '../lib/expenses.js'
import {
  formatCostPerDistanceValue,
  getCostPerDistanceLabel,
} from '../lib/preferences.js'

function Dashboard({
  preferences,
  fuelAverageMpg,
  fuelCostPerMile,
  fuelLifetimeSpend,
  fuelMonthlySpend,
  fuelRecordCount,
  lifetimeExpenseSpend,
  expiringDocumentCount,
  latestFuelRecord,
  latestFuelVehicle,
  latestExpense,
  latestExpenseVehicle,
  latestDocument,
  latestDocumentVehicle,
  latestMaintenanceRecord,
  latestMaintenanceVehicle,
  nextAlert,
  overdueAlertCount,
  maintenanceRecordCount,
  monthlyExpenseSpend,
  recentDocumentCount,
  totalExpenseCount,
  upcomingAlertCount,
  totalDocumentCount,
  totalMaintenanceCost,
  vehicleCount,
}) {
  const distanceUnit = preferences?.distanceUnit ?? 'miles'
  const currencySymbol = preferences?.currencySymbol ?? '$'
  const dateFormat = preferences?.dateFormat ?? 'mdy'
  const reminderWindowDays = Number(preferences?.reminderWindowDays) || 30
  const costPerDistanceLabel = getCostPerDistanceLabel(distanceUnit)

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
              <p className="big-number">{formatMoney(totalMaintenanceCost, currencySymbol)}</p>
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
                <p className="muted">
                  No service or document reminders yet. Set up a maintenance schedule or add a
                  document with an expiration date.
                </p>
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
              <p className="big-number">{formatMoney(fuelLifetimeSpend, currencySymbol)}</p>
            </article>

            <article className="info-card">
              <h3>Monthly Fuel Spend</h3>
              <p className="big-number">{formatMoney(fuelMonthlySpend, currencySymbol)}</p>
              <p className="muted">Current calendar month.</p>
            </article>

            <article className="info-card">
              <h3>Average MPG</h3>
              <p className="big-number">
                {fuelAverageMpg != null ? formatFuelNumber(fuelAverageMpg) : 'N/A'}
              </p>
            </article>

            <article className="info-card">
              <h3>{costPerDistanceLabel}</h3>
              <p className="big-number">
                {fuelCostPerMile != null
                  ? formatCostPerDistanceValue(fuelCostPerMile, distanceUnit, currencySymbol)
                  : 'N/A'}
              </p>
            </article>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <h3>Expenses</h3>
            <p className="muted">Tracked vehicle ownership expenses.</p>
          </div>
          <div className="dashboard-grid dashboard-grid-three">
            <article className="info-card">
              <h3>Total Expenses</h3>
              <p className="big-number">{totalExpenseCount}</p>
            </article>

            <article className="info-card">
              <h3>Lifetime Expense Spend</h3>
              <p className="big-number">{formatMoney(lifetimeExpenseSpend, currencySymbol)}</p>
            </article>

            <article className="info-card">
              <h3>Monthly Expense Spend</h3>
              <p className="big-number">{formatMoney(monthlyExpenseSpend, currencySymbol)}</p>
              <p className="muted">Current calendar month.</p>
            </article>

            <article className="info-card latest-activity-card">
              <h3>Latest Expense Activity</h3>
              {latestExpense ? (
                <div className="vehicle-summary">
                  <strong>
                    {latestExpense.category}
                    {latestExpenseVehicle
                      ? ` on ${latestExpenseVehicle.year} ${latestExpenseVehicle.make} ${latestExpenseVehicle.model}`
                      : ''}
                  </strong>
                  <p className="muted">
                    {formatExpenseDate(latestExpense.date, dateFormat)} -{' '}
                    {formatMoney(latestExpense.amount, currencySymbol)}
                  </p>
                  {latestExpense.vendor ? <p>{latestExpense.vendor}</p> : null}
                </div>
              ) : (
                <p className="muted">
                  No expenses yet. Add a repair, insurance payment, registration fee, or other
                  ownership cost to see it here.
                </p>
              )}
            </article>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <h3>Documents</h3>
            <p className="muted">Document tracking and expiration monitoring.</p>
          </div>
          <div className="dashboard-grid dashboard-grid-three">
            <article className="info-card">
              <h3>Total Documents</h3>
              <p className="big-number">{totalDocumentCount}</p>
            </article>

            <article className="info-card">
              <h3>Expiring Documents</h3>
              <p className="big-number">{expiringDocumentCount}</p>
              <p className="muted">
                Documents expiring within {reminderWindowDays} days or already expired.
              </p>
            </article>

            <article className="info-card latest-activity-card">
              <h3>Recently Added Documents</h3>
              <p className="big-number">{recentDocumentCount}</p>
              {latestDocument ? (
                <div className="vehicle-summary">
                  <strong>
                    {latestDocument.title}
                    {latestDocumentVehicle
                      ? ` on ${latestDocumentVehicle.year} ${latestDocumentVehicle.make} ${latestDocumentVehicle.model}`
                      : ''}
                  </strong>
                  <p className="muted">
                    {latestDocument.documentType} -{' '}
                    {formatDocumentDate(latestDocument.issueDate, dateFormat)}
                  </p>
                </div>
              ) : (
                <p className="muted">
                  No documents yet. Add a registration, insurance card, or inspection record to
                  keep it on your dashboard.
                </p>
              )}
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
                    {formatServiceDate(latestMaintenanceRecord.serviceDate, dateFormat)} -{' '}
                    {formatMoney(latestMaintenanceRecord.cost, currencySymbol)}
                  </p>
                  {latestMaintenanceRecord.shop ? <p>{latestMaintenanceRecord.shop}</p> : null}
                </div>
              ) : (
                <p className="muted">
                  No maintenance history yet. Add an oil change, tire rotation, or repair to start
                  tracking service.
                </p>
              )}
            </article>

            <article className="info-card latest-activity-card">
              <h3>Latest Fuel Activity</h3>
              {latestFuelRecord ? (
                <div className="vehicle-summary">
                  <strong>
                    {formatServiceDate(latestFuelRecord.fillDate, dateFormat)}
                    {latestFuelVehicle
                      ? ` on ${latestFuelVehicle.year} ${latestFuelVehicle.make} ${latestFuelVehicle.model}`
                      : ''}
                  </strong>
                  <p className="muted">
                    {formatFuelMileage(Number(latestFuelRecord.mileage) || null, distanceUnit)} -{' '}
                    {formatFuelNumber(Number(latestFuelRecord.gallons) || null)} gallons -{' '}
                    {formatMoney(latestFuelRecord.cost, currencySymbol)}
                  </p>
                  {latestFuelRecord.station ? <p>{latestFuelRecord.station}</p> : null}
                </div>
              ) : (
                <p className="muted">
                  No fuel entries yet. Add a fill-up to start tracking MPG and fuel spend.
                </p>
              )}
            </article>
          </div>
        </section>
      </div>
    </section>
  )
}

export default Dashboard
