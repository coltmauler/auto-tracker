import { useState } from 'react'
import MaintenanceForm from './MaintenanceForm.jsx'
import MaintenanceList from './MaintenanceList.jsx'
import { formatMoney, getMaintenanceStats } from '../lib/maintenance.js'

function VehicleDetailPage({
  maintenanceRecords,
  onBack,
  onDeleteMaintenance,
  onSaveMaintenance,
  selectedVehicle,
}) {
  const vehicleMaintenanceRecords = maintenanceRecords.filter(
    (record) => record.vehicleId === selectedVehicle.id,
  )
  const stats = getMaintenanceStats(vehicleMaintenanceRecords, selectedVehicle.mileage)

  return (
    <div className="page-stack">
      <section className="page-panel vehicle-detail-panel">
        <div className="page-header">
          <div>
            <p className="section-label">Vehicle detail</p>
            <h2>
              {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            </h2>
            <p className="muted">{selectedVehicle.nickname || 'No nickname'}</p>
          </div>
          <button type="button" className="secondary-button" onClick={onBack}>
            Back to vehicles
          </button>
        </div>

        <div className="vehicle-detail-grid">
          <article className="info-card">
            <h3>Vehicle info</h3>
            <dl className="vehicle-details detail-stats">
              <div>
                <dt>Year</dt>
                <dd>{selectedVehicle.year}</dd>
              </div>
              <div>
                <dt>Make</dt>
                <dd>{selectedVehicle.make}</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>{selectedVehicle.model}</dd>
              </div>
              <div>
                <dt>Nickname</dt>
                <dd>{selectedVehicle.nickname || 'Not set'}</dd>
              </div>
              <div>
                <dt>Mileage</dt>
                <dd>{selectedVehicle.mileage || 'Not set'}</dd>
              </div>
              <div>
                <dt>VIN</dt>
                <dd>{selectedVehicle.vin || 'Not set'}</dd>
              </div>
              <div>
                <dt>License plate</dt>
                <dd>{selectedVehicle.licensePlate || 'Not set'}</dd>
              </div>
              <div className="vehicle-notes">
                <dt>Notes</dt>
                <dd>{selectedVehicle.notes || 'No notes yet'}</dd>
              </div>
            </dl>
          </article>

          <article className="info-card">
            <h3>Maintenance statistics</h3>
            <div className="detail-stat-grid">
              <div className="detail-stat">
                <span>Current mileage</span>
                <strong>{stats.currentMileage}</strong>
              </div>
              <div className="detail-stat">
                <span>Maintenance records</span>
                <strong>{stats.maintenanceCount}</strong>
              </div>
              <div className="detail-stat">
                <span>Lifetime maintenance cost</span>
                <strong>{formatMoney(stats.totalCost)}</strong>
              </div>
              <div className="detail-stat">
                <span>Last service date</span>
                <strong>{stats.lastServiceDate}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      <VehicleMaintenanceSection
        maintenanceRecords={vehicleMaintenanceRecords}
        onDeleteMaintenance={onDeleteMaintenance}
        onSaveMaintenance={onSaveMaintenance}
        selectedVehicleId={selectedVehicle.id}
      />
    </div>
  )
}

function VehicleMaintenanceSection({
  maintenanceRecords,
  onDeleteMaintenance,
  onSaveMaintenance,
  selectedVehicleId,
}) {
  const [editingMaintenanceId, setEditingMaintenanceId] = useState(null)
  const editingRecord =
    maintenanceRecords.find((record) => record.id === editingMaintenanceId) ?? null

  function handleSaveRecord(recordData, editingId) {
    onSaveMaintenance(selectedVehicleId, recordData, editingId)
    setEditingMaintenanceId(null)
  }

  return (
    <>
      <MaintenanceForm
        key={editingRecord?.id ?? `maintenance-new-${selectedVehicleId}`}
        editingRecord={editingRecord}
        onCancelEdit={() => setEditingMaintenanceId(null)}
        onSaveRecord={handleSaveRecord}
      />
      <MaintenanceList
        records={maintenanceRecords}
        onDeleteRecord={onDeleteMaintenance}
        onEditRecord={(record) => setEditingMaintenanceId(record.id)}
      />
    </>
  )
}

export default VehicleDetailPage
