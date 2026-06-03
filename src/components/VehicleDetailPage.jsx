import { useState } from 'react'
import FuelForm from './FuelForm.jsx'
import FuelList from './FuelList.jsx'
import DocumentForm from './DocumentForm.jsx'
import DocumentList from './DocumentList.jsx'
import ExpenseForm from './ExpenseForm.jsx'
import ExpenseList from './ExpenseList.jsx'
import MaintenanceForm from './MaintenanceForm.jsx'
import MaintenanceList from './MaintenanceList.jsx'
import { formatMoney, formatServiceDate, getMaintenanceStats } from '../lib/maintenance.js'
import { getVehicleFuelStats } from '../lib/fuel.js'
import { getVehicleDocumentSummary } from '../lib/documents.js'
import { getVehicleExpenseStats, getVehicleOwnershipStats } from '../lib/expenses.js'
import { getVehicleServiceAlerts, getVehicleServiceSchedules } from '../lib/serviceSchedules.js'
import {
  formatCostPerDistanceValue,
  formatDistanceValue,
  getCostPerDistanceLabel,
} from '../lib/preferences.js'

function VehicleDetailPage({
  preferences,
  expenses,
  onDeleteExpense,
  onSaveExpense,
  documents,
  onDeleteDocument,
  onSaveDocument,
  fuelRecords,
  onDeleteFuel,
  onSaveFuel,
  maintenanceRecords,
  onBack,
  onDeleteMaintenance,
  onSaveMaintenance,
  selectedVehicle,
}) {
  const distanceUnit = preferences?.distanceUnit ?? 'miles'
  const currencySymbol = preferences?.currencySymbol ?? '$'
  const dateFormat = preferences?.dateFormat ?? 'mdy'
  const reminderWindowDays = Number(preferences?.reminderWindowDays) || 30
  const costPerDistanceLabel = getCostPerDistanceLabel(distanceUnit)

  const vehicleMaintenanceRecords = maintenanceRecords.filter(
    (record) => record.vehicleId === selectedVehicle.id,
  )
  const vehicleDocuments = documents.filter((document) => document.vehicleId === selectedVehicle.id)
  const vehicleFuelRecords = fuelRecords.filter((record) => record.vehicleId === selectedVehicle.id)
  const vehicleExpenses = expenses.filter((expense) => expense.vehicleId === selectedVehicle.id)
  const stats = getMaintenanceStats(
    vehicleMaintenanceRecords,
    selectedVehicle.mileage,
    preferences,
  )
  const fuelStats = getVehicleFuelStats(selectedVehicle, fuelRecords)
  const documentStats = getVehicleDocumentSummary(
    selectedVehicle,
    documents,
    new Date(),
    reminderWindowDays,
  )
  const expenseStats = getVehicleExpenseStats(selectedVehicle, expenses)
  const ownershipStats = getVehicleOwnershipStats({
    fuelStats,
    maintenanceRecords: vehicleMaintenanceRecords,
    expenses: vehicleExpenses,
    vehicle: selectedVehicle,
  })
  const schedules = getVehicleServiceSchedules(selectedVehicle)
  const alerts = getVehicleServiceAlerts(
    selectedVehicle,
    maintenanceRecords,
    new Date(),
    reminderWindowDays,
    distanceUnit,
  )

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
                <dd>{formatDistanceValue(selectedVehicle.mileage, distanceUnit)}</dd>
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
                <strong>{formatMoney(stats.totalCost, currencySymbol)}</strong>
              </div>
              <div className="detail-stat">
                <span>Last service date</span>
                <strong>{stats.lastServiceDate}</strong>
              </div>
            </div>
          </article>
        </div>

        <div className="detail-secondary-grid">
          <article className="info-card">
            <h3>Service schedule</h3>
            {schedules.length > 0 ? (
              <div className="schedule-summary-list">
                {schedules.map((schedule) => (
                  <div key={schedule.key} className="schedule-summary-item">
                    <strong>{schedule.label}</strong>
                    <p className="muted">
                      {schedule.miles ? `${formatDistanceValue(schedule.miles, distanceUnit)}` : 'No mileage'}
                      {schedule.miles && schedule.months ? ' or ' : ''}
                      {schedule.months ? `${schedule.months} months` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">
                No service schedule configured yet. Add oil change or tire rotation intervals to
                start alerts.
              </p>
            )}
          </article>

          <article className="info-card">
            <h3>Maintenance alerts</h3>
            {alerts.length > 0 ? (
              <div className="alert-list">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={
                      alert.status === 'overdue'
                        ? 'alert-card alert-overdue'
                        : 'alert-card alert-upcoming'
                    }
                  >
                    <div className="alert-card-header">
                      <strong>{alert.serviceLabel}</strong>
                      <span className="alert-badge">{alert.status}</span>
                    </div>
                    <p>{alert.message}</p>
                    <p className="muted">
                      Last service: {formatServiceDate(alert.lastServiceRecord.serviceDate, dateFormat)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">
                No upcoming or overdue alerts for this vehicle. Add a service schedule to enable
                reminders.
              </p>
            )}
          </article>

          <article className="info-card">
            <h3>Fuel statistics</h3>
            <div className="detail-stat-grid">
              <div className="detail-stat">
                <span>Fuel records</span>
                <strong>{fuelStats.fuelRecordCount}</strong>
              </div>
              <div className="detail-stat">
                <span>Lifetime fuel spend</span>
                <strong>{formatMoney(fuelStats.lifetimeFuelSpend, currencySymbol)}</strong>
              </div>
              <div className="detail-stat">
                <span>Monthly fuel spend</span>
                <strong>{formatMoney(fuelStats.monthlyFuelSpend, currencySymbol)}</strong>
              </div>
              <div className="detail-stat">
                <span>Average MPG</span>
                <strong>{fuelStats.averageMpg ? fuelStats.averageMpg.toFixed(1) : 'N/A'}</strong>
              </div>
              <div className="detail-stat">
                <span>{costPerDistanceLabel}</span>
                <strong>
                  {fuelStats.costPerMile
                    ? formatCostPerDistanceValue(fuelStats.costPerMile, distanceUnit, currencySymbol)
                    : 'N/A'}
                </strong>
              </div>
              <div className="detail-stat">
                <span>Last fuel date</span>
                <strong>
                  {fuelStats.latestFuelRecord
                    ? formatServiceDate(fuelStats.latestFuelRecord.fillDate, dateFormat)
                    : 'No records yet'}
                </strong>
              </div>
            </div>
          </article>

          <article className="info-card">
            <h3>Document statistics</h3>
            <div className="detail-stat-grid">
              <div className="detail-stat">
                <span>Documents</span>
                <strong>{documentStats.documentCount}</strong>
              </div>
              <div className="detail-stat">
                <span>Expiring documents</span>
                <strong>{documentStats.expiringCount}</strong>
              </div>
              <div className="detail-stat">
                <span>Recently added</span>
                <strong>{documentStats.recentCount}</strong>
              </div>
              <div className="detail-stat">
                <span>Latest document</span>
                <strong>{documentStats.documents[0]?.title || 'No documents yet'}</strong>
              </div>
            </div>
          </article>

          <article className="info-card">
            <h3>Ownership cost</h3>
            <div className="detail-stat-grid">
              <div className="detail-stat">
                <span>Total ownership cost</span>
                <strong>{formatMoney(ownershipStats.ownershipTotal, currencySymbol)}</strong>
              </div>
              <div className="detail-stat">
                <span>Maintenance total</span>
                <strong>{formatMoney(ownershipStats.maintenanceTotal, currencySymbol)}</strong>
              </div>
              <div className="detail-stat">
                <span>Fuel total</span>
                <strong>{formatMoney(ownershipStats.fuelTotal, currencySymbol)}</strong>
              </div>
              <div className="detail-stat">
                <span>Expense total</span>
                <strong>{formatMoney(ownershipStats.expenseTotal, currencySymbol)}</strong>
              </div>
              <div className="detail-stat">
                <span>{costPerDistanceLabel}</span>
                <strong>
                  {ownershipStats.costPerMile
                    ? formatCostPerDistanceValue(
                        ownershipStats.costPerMile,
                        distanceUnit,
                        currencySymbol,
                      )
                    : 'N/A'}
                </strong>
              </div>
              <div className="detail-stat">
                <span>Expense records</span>
                <strong>{expenseStats.expenseRecordCount}</strong>
              </div>
              <div className="detail-stat">
                <span>Monthly expense spend</span>
                <strong>{formatMoney(expenseStats.monthlyExpenseSpend, currencySymbol)}</strong>
              </div>
              <div className="detail-stat">
                <span>Latest expense</span>
                <strong>
                  {expenseStats.latestExpense
                    ? formatServiceDate(expenseStats.latestExpense.date, dateFormat)
                    : 'No records yet'}
                </strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      <VehicleMaintenanceSection
        preferences={preferences}
        maintenanceRecords={vehicleMaintenanceRecords}
        onDeleteMaintenance={onDeleteMaintenance}
        onSaveMaintenance={onSaveMaintenance}
        selectedVehicleId={selectedVehicle.id}
      />

      <VehicleFuelSection
        preferences={preferences}
        fuelRecords={vehicleFuelRecords}
        onDeleteFuel={onDeleteFuel}
        onSaveFuel={onSaveFuel}
        selectedVehicleId={selectedVehicle.id}
      />

      <VehicleDocumentSection
        preferences={preferences}
        documentRecords={vehicleDocuments}
        onDeleteDocument={onDeleteDocument}
        onSaveDocument={onSaveDocument}
        selectedVehicleId={selectedVehicle.id}
      />

      <VehicleExpenseSection
        preferences={preferences}
        expenseRecords={vehicleExpenses}
        onDeleteExpense={onDeleteExpense}
        onSaveExpense={onSaveExpense}
        selectedVehicleId={selectedVehicle.id}
      />
    </div>
  )
}

function VehicleMaintenanceSection({
  preferences,
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
        preferences={preferences}
        records={maintenanceRecords}
        onDeleteRecord={onDeleteMaintenance}
        onEditRecord={(record) => setEditingMaintenanceId(record.id)}
      />
    </>
  )
}

function VehicleFuelSection({ preferences, fuelRecords, onDeleteFuel, onSaveFuel, selectedVehicleId }) {
  const [editingFuelId, setEditingFuelId] = useState(null)
  const editingRecord = fuelRecords.find((record) => record.id === editingFuelId) ?? null

  function handleSaveRecord(recordData, editingId) {
    onSaveFuel(selectedVehicleId, recordData, editingId)
    setEditingFuelId(null)
  }

  return (
    <>
      <FuelForm
        key={editingRecord?.id ?? `fuel-new-${selectedVehicleId}`}
        editingRecord={editingRecord}
        onCancelEdit={() => setEditingFuelId(null)}
        onSaveRecord={handleSaveRecord}
      />
      <FuelList
        preferences={preferences}
        records={fuelRecords}
        onDeleteRecord={onDeleteFuel}
        onEditRecord={(record) => setEditingFuelId(record.id)}
      />
    </>
  )
}

function VehicleDocumentSection({
  preferences,
  documentRecords,
  onDeleteDocument,
  onSaveDocument,
  selectedVehicleId,
}) {
  const [editingDocumentId, setEditingDocumentId] = useState(null)
  const editingRecord =
    documentRecords.find((record) => record.id === editingDocumentId) ?? null

  function handleSaveRecord(recordData, editingId) {
    onSaveDocument(selectedVehicleId, recordData, editingId)
    setEditingDocumentId(null)
  }

  return (
    <>
      <DocumentForm
        key={editingRecord?.id ?? `document-new-${selectedVehicleId}`}
        editingRecord={editingRecord}
        onCancelEdit={() => setEditingDocumentId(null)}
        onSaveRecord={handleSaveRecord}
      />
      <DocumentList
        preferences={preferences}
        documents={documentRecords}
        onDeleteRecord={onDeleteDocument}
        onEditRecord={(record) => setEditingDocumentId(record.id)}
      />
    </>
  )
}

function VehicleExpenseSection({
  preferences,
  expenseRecords,
  onDeleteExpense,
  onSaveExpense,
  selectedVehicleId,
}) {
  const [editingExpenseId, setEditingExpenseId] = useState(null)
  const editingRecord = expenseRecords.find((record) => record.id === editingExpenseId) ?? null

  function handleSaveRecord(recordData, editingId) {
    onSaveExpense(selectedVehicleId, recordData, editingId)
    setEditingExpenseId(null)
  }

  return (
    <>
      <ExpenseForm
        key={editingRecord?.id ?? `expense-new-${selectedVehicleId}`}
        editingRecord={editingRecord}
        onCancelEdit={() => setEditingExpenseId(null)}
        onSaveRecord={handleSaveRecord}
      />
      <ExpenseList
        preferences={preferences}
        expenses={expenseRecords}
        onDeleteRecord={onDeleteExpense}
        onEditRecord={(record) => setEditingExpenseId(record.id)}
      />
    </>
  )
}

export default VehicleDetailPage
