import {
  formatReportDate,
  formatReportMileage,
  formatReportMoney,
  formatReportMpg,
  formatReportDocumentDate,
  getReportDocumentStatus,
} from '../lib/reports.js'

function ReportsPage({ reports }) {
  return (
    <div className="page-stack">
      <section className="page-panel">
        <div className="page-header">
          <div>
            <p className="section-label">Reports</p>
            <h2>Fleet reporting from your existing data</h2>
            <p className="muted">Tables and cards only, with no chart library.</p>
          </div>
        </div>
      </section>

      <section className="page-panel">
        <div className="page-header compact">
          <div>
            <p className="section-label">Vehicle cost summary</p>
            <h2>Per-vehicle ownership snapshot</h2>
          </div>
        </div>
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Maintenance</th>
                <th>Fuel</th>
                <th>Expenses</th>
                <th>Total</th>
                <th>Cost / mile</th>
              </tr>
            </thead>
            <tbody>
              {reports.vehicleCostSummary.map((row) => (
                <tr key={row.vehicle.id}>
                  <td>{row.vehicleLabel}</td>
                  <td>{formatReportMoney(row.maintenanceCost)}</td>
                  <td>{formatReportMoney(row.fuelCost)}</td>
                  <td>{formatReportMoney(row.expenseCost)}</td>
                  <td>{formatReportMoney(row.ownershipCost)}</td>
                  <td>{row.costPerMile != null ? formatReportMoney(row.costPerMile) : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="report-grid">
        <article className="page-panel">
          <div className="page-header compact">
            <div>
              <p className="section-label">Monthly spending</p>
              <h2>Spending by month</h2>
            </div>
          </div>
          <div className="report-list">
            {reports.monthlySpending.map((row) => (
              <div key={row.monthKey} className="report-card">
                <strong>{row.label}</strong>
                <p className="muted">Total: {formatReportMoney(row.total)}</p>
                <p className="muted">Maintenance: {formatReportMoney(row.maintenance)}</p>
                <p className="muted">Fuel: {formatReportMoney(row.fuel)}</p>
                <p className="muted">Expenses: {formatReportMoney(row.expenses)}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="page-panel">
          <div className="page-header compact">
            <div>
              <p className="section-label">Spending by category</p>
              <h2>Expense categories</h2>
            </div>
          </div>
          <div className="report-list">
            {reports.spendingByCategory.map((row) => (
              <div key={row.category} className="report-card">
                <strong>{row.category}</strong>
                <p className="muted">Total: {formatReportMoney(row.total)}</p>
                <p className="muted">Records: {row.count}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="report-grid">
        <article className="page-panel">
          <div className="page-header compact">
            <div>
              <p className="section-label">Fuel efficiency</p>
              <h2>Vehicle MPG</h2>
            </div>
          </div>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>MPG</th>
                  <th>Miles</th>
                  <th>Gallons</th>
                  <th>Cost / mile</th>
                </tr>
              </thead>
              <tbody>
                {reports.fuelEfficiency.map((row) => (
                  <tr key={row.vehicle.id}>
                    <td>{row.vehicleLabel}</td>
                    <td>{row.averageMpg != null ? formatReportMpg(row.averageMpg) : 'N/A'}</td>
                    <td>{formatReportMileage(row.fuelMiles)}</td>
                    <td>{formatReportMileage(row.fuelGallons)}</td>
                    <td>{row.costPerMile != null ? formatReportMoney(row.costPerMile) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="page-panel">
          <div className="page-header compact">
            <div>
              <p className="section-label">Maintenance cost</p>
              <h2>Service spend by vehicle</h2>
            </div>
          </div>
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Service count</th>
                  <th>Total cost</th>
                  <th>Last service</th>
                </tr>
              </thead>
              <tbody>
                {reports.maintenanceCosts.map((row) => (
                  <tr key={row.vehicle.id}>
                    <td>{row.vehicleLabel}</td>
                    <td>{row.maintenanceCount}</td>
                    <td>{formatReportMoney(row.totalMaintenanceCost)}</td>
                    <td>{row.lastServiceDate ? formatReportDate(row.lastServiceDate) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="page-panel">
        <div className="page-header compact">
          <div>
            <p className="section-label">Comparison</p>
            <h2>Vehicle comparison report</h2>
          </div>
        </div>
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Vehicle</th>
                <th>Ownership cost</th>
                <th>Cost / mile</th>
                <th>Documents</th>
                <th>Expenses</th>
              </tr>
            </thead>
            <tbody>
              {reports.comparison.map((row) => (
                <tr key={row.vehicle.id}>
                  <td>{row.rank}</td>
                  <td>{row.vehicleLabel}</td>
                  <td>{formatReportMoney(row.ownershipCost)}</td>
                  <td>{row.costPerMile != null ? formatReportMoney(row.costPerMile) : 'N/A'}</td>
                  <td>{row.documentCount}</td>
                  <td>{formatReportMoney(row.expenseCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="page-panel">
        <div className="page-header compact">
          <div>
            <p className="section-label">Document status</p>
            <h2>Document report</h2>
          </div>
        </div>
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Issue</th>
                <th>Expiration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.documentRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.documentType}</td>
                  <td>{row.issueDate ? formatReportDocumentDate(row.issueDate) : 'Not set'}</td>
                  <td>{row.expirationDate ? formatReportDocumentDate(row.expirationDate) : 'Not set'}</td>
                  <td>{getReportDocumentStatus(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default ReportsPage
