import {
  formatFuelMileage,
  formatFuelNumber,
  formatMoney,
  sortFuelRecordsDescending,
} from '../lib/fuel.js'
import { formatServiceDate } from '../lib/maintenance.js'

function FuelList({ preferences, records, onDeleteRecord, onEditRecord }) {
  const sortedRecords = sortFuelRecordsDescending(records)
  const distanceUnit = preferences?.distanceUnit ?? 'miles'
  const currencySymbol = preferences?.currencySymbol ?? '$'
  const dateFormat = preferences?.dateFormat ?? 'mdy'

  if (sortedRecords.length === 0) {
    return (
      <section className="page-panel">
        <div className="empty-state">
          <h3>No fuel records yet</h3>
          <p>Add the first fill-up to start tracking MPG, fuel spend, and cost per mile.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-panel">
      <div className="page-header compact">
        <div>
          <p className="section-label">Fuel history</p>
          <h2>Fuel records</h2>
        </div>
      </div>

      <div className="maintenance-list">
        {sortedRecords.map((record) => (
          <article key={record.id} className="maintenance-card fuel-card">
            <div className="vehicle-card-header">
              <div>
                <p className="vehicle-title">{formatServiceDate(record.fillDate, dateFormat)}</p>
                <p className="vehicle-subtitle">
                  {formatFuelMileage(Number(record.mileage) || null, distanceUnit)} -{' '}
                  {formatFuelNumber(Number(record.gallons) || null)} gallons -{' '}
                  {formatMoney(record.cost, currencySymbol)}
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

            <dl className="vehicle-details maintenance-details fuel-details">
              <div>
                <dt>Station</dt>
                <dd>{record.station || 'Not set'}</dd>
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

export default FuelList
