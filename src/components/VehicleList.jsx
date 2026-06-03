import { formatDistanceValue } from '../lib/preferences.js'

function VehicleList({
  preferences,
  vehicles,
  onDeleteVehicle,
  onEditVehicle,
  onViewVehicle,
}) {
  const distanceUnit = preferences?.distanceUnit ?? 'miles'

  if (vehicles.length === 0) {
    return (
      <section className="page-panel">
        <div className="empty-state">
          <h3>No vehicles yet</h3>
          <p>Add your first vehicle to start tracking service, fuel, expenses, and documents.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-panel">
      <div className="page-header compact">
        <div>
          <p className="section-label">Vehicle list</p>
          <h2>All saved vehicles</h2>
        </div>
      </div>

      <div className="vehicle-list">
        {vehicles.map((vehicle) => (
          <article
            key={vehicle.id}
            className="vehicle-card vehicle-card-clickable"
            role="button"
            tabIndex={0}
            onClick={() => onViewVehicle(vehicle.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onViewVehicle(vehicle.id)
              }
            }}
          >
            <div className="vehicle-card-header">
              <div>
                <p className="vehicle-title">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
                <p className="vehicle-subtitle">{vehicle.nickname || 'No nickname'}</p>
                <p className="vehicle-link-hint">Open details and maintenance history</p>
              </div>
              <div className="vehicle-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEditVehicle(vehicle)
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onDeleteVehicle(vehicle.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            <dl className="vehicle-details">
              <div>
                <dt>Mileage</dt>
                <dd>{formatDistanceValue(vehicle.mileage, distanceUnit)}</dd>
              </div>
              <div>
                <dt>VIN</dt>
                <dd>{vehicle.vin || 'Not set'}</dd>
              </div>
              <div>
                <dt>License plate</dt>
                <dd>{vehicle.licensePlate || 'Not set'}</dd>
              </div>
              <div className="vehicle-notes">
                <dt>Notes</dt>
                <dd>{vehicle.notes || 'No notes yet'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}

export default VehicleList
