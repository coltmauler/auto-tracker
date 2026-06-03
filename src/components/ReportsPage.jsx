import {
  formatReportCostPerDistance,
  formatReportDate,
  formatReportMileage,
  formatReportMoney,
  formatReportMpg,
  formatReportDocumentDate,
  getReportCostPerDistanceLabel,
  getReportDocumentStatus,
} from '../lib/reports.js'

function ReportsPage({ preferences, reports }) {
  const costPerDistanceLabel = getReportCostPerDistanceLabel(preferences)

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
        {reports.vehicleCostSummary.length > 0 ? (
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Maintenance</th>
                  <th>Fuel</th>
                  <th>Expenses</th>
                  <th>Total</th>
                  <th>{costPerDistanceLabel}</th>
                </tr>
              </thead>
              <tbody>
                {reports.vehicleCostSummary.map((row) => (
                  <tr key={row.vehicle.id}>
                    <td>{row.vehicleLabel}</td>
                    <td>{formatReportMoney(row.maintenanceCost, preferences)}</td>
                    <td>{formatReportMoney(row.fuelCost, preferences)}</td>
                    <td>{formatReportMoney(row.expenseCost, preferences)}</td>
                    <td>{formatReportMoney(row.ownershipCost, preferences)}</td>
                    <td>
                      {row.costPerMile != null
                        ? formatReportCostPerDistance(row.costPerMile, preferences)
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted empty-report-note">Add vehicles and expenses to generate this report.</p>
        )}
      </section>

      <section className="report-grid">
        <article className="page-panel">
          <div className="page-header compact">
            <div>
              <p className="section-label">Monthly spending</p>
              <h2>Spending by month</h2>
            </div>
          </div>
          {reports.monthlySpending.length > 0 ? (
            <div className="report-list">
              {reports.monthlySpending.map((row) => (
                <div key={row.monthKey} className="report-card">
                  <strong>{row.label}</strong>
                  <p className="muted">Total: {formatReportMoney(row.total, preferences)}</p>
                  <p className="muted">
                    Maintenance: {formatReportMoney(row.maintenance, preferences)}
                  </p>
                  <p className="muted">Fuel: {formatReportMoney(row.fuel, preferences)}</p>
                  <p className="muted">Expenses: {formatReportMoney(row.expenses, preferences)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted empty-report-note">Add dated records to populate the monthly view.</p>
          )}
        </article>

        <article className="page-panel">
          <div className="page-header compact">
            <div>
              <p className="section-label">Spending by category</p>
              <h2>Expense categories</h2>
            </div>
          </div>
          {reports.spendingByCategory.length > 0 ? (
            <div className="report-list">
              {reports.spendingByCategory.map((row) => (
                <div key={row.category} className="report-card">
                  <strong>{row.category}</strong>
                  <p className="muted">Total: {formatReportMoney(row.total, preferences)}</p>
                  <p className="muted">Records: {row.count}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted empty-report-note">Add expenses to see spending by category.</p>
          )}
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
          {reports.fuelEfficiency.length > 0 ? (
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>MPG</th>
                    <th>Miles</th>
                    <th>Gallons</th>
                    <th>{costPerDistanceLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.fuelEfficiency.map((row) => (
                    <tr key={row.vehicle.id}>
                      <td>{row.vehicleLabel}</td>
                      <td>{row.averageMpg != null ? formatReportMpg(row.averageMpg) : 'N/A'}</td>
                      <td>{formatReportMileage(row.fuelMiles, preferences)}</td>
                      <td>{formatReportMpg(row.fuelGallons)}</td>
                      <td>
                        {row.costPerMile != null
                          ? formatReportCostPerDistance(row.costPerMile, preferences)
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted empty-report-note">Add fuel records to compare fuel efficiency.</p>
          )}
        </article>

        <article className="page-panel">
          <div className="page-header compact">
            <div>
              <p className="section-label">Maintenance cost</p>
              <h2>Service spend by vehicle</h2>
            </div>
          </div>
          {reports.maintenanceCosts.length > 0 ? (
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
                      <td>{formatReportMoney(row.totalMaintenanceCost, preferences)}</td>
                      <td>{row.lastServiceDate ? formatReportDate(row.lastServiceDate, preferences) : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="muted empty-report-note">Add maintenance records to see service spend.</p>
          )}
        </article>
      </section>

      <section className="page-panel">
        <div className="page-header compact">
          <div>
            <p className="section-label">Comparison</p>
            <h2>Vehicle comparison report</h2>
          </div>
        </div>
        {reports.comparison.length > 0 ? (
          <div className="report-table-wrap">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Vehicle</th>
                  <th>Ownership cost</th>
                  <th>{costPerDistanceLabel}</th>
                  <th>Documents</th>
                  <th>Expenses</th>
                </tr>
              </thead>
              <tbody>
                {reports.comparison.map((row) => (
                  <tr key={row.vehicle.id}>
                    <td>{row.rank}</td>
                    <td>{row.vehicleLabel}</td>
                    <td>{formatReportMoney(row.ownershipCost, preferences)}</td>
                    <td>
                      {row.costPerMile != null
                        ? formatReportCostPerDistance(row.costPerMile, preferences)
                        : 'N/A'}
                    </td>
                    <td>{row.documentCount}</td>
                    <td>{formatReportMoney(row.expenseCost, preferences)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted empty-report-note">Add vehicles and records to compare ownership costs.</p>
        )}
      </section>

      <section className="page-panel">
        <div className="page-header compact">
          <div>
            <p className="section-label">Document status</p>
            <h2>Document report</h2>
          </div>
        </div>
        {reports.documentRows.length > 0 ? (
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
                    <td>{row.issueDate ? formatReportDocumentDate(row.issueDate, preferences) : 'Not set'}</td>
                    <td>{row.expirationDate ? formatReportDocumentDate(row.expirationDate, preferences) : 'Not set'}</td>
                    <td>{getReportDocumentStatus(row, preferences)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted empty-report-note">Add documents to review issue dates and expirations.</p>
        )}
      </section>
    </div>
  )
}

export default ReportsPage
