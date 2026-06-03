import { formatMoney, formatServiceDate } from '../lib/maintenance.js'

function MaintenanceList({ records, onDeleteRecord, onEditRecord }) {
  if (records.length === 0) {
    return (
      <section className="page-panel">
        <div className="empty-state">
          <h3>No maintenance records yet</h3>
          <p>Add the first service entry above.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-panel">
      <div className="page-header compact">
        <div>
          <p className="section-label">Maintenance history</p>
          <h2>Service records</h2>
        </div>
      </div>

      <div className="maintenance-list">
        {records.map((record) => (
          <article key={record.id} className="maintenance-card">
            <div className="vehicle-card-header">
              <div>
                <p className="vehicle-title">{record.serviceType}</p>
                <p className="vehicle-subtitle">
                  {formatServiceDate(record.serviceDate)} · {record.mileage} miles ·{' '}
                  {formatMoney(record.cost)}
                </p>
              </div>
              <div className="vehicle-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onEditRecord(record)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => onDeleteRecord(record.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <dl className="vehicle-details maintenance-details">
              <div>
                <dt>Shop</dt>
                <dd>{record.shop || 'Not set'}</dd>
              </div>
              <div className="vehicle-notes">
                <dt>Notes</dt>
                <dd>{record.notes || 'No notes yet'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MaintenanceList
