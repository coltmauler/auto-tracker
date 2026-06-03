import { useEffect, useMemo, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import Navigation from './components/Navigation.jsx'
import VehicleDetailPage from './components/VehicleDetailPage.jsx'
import VehiclesPage from './components/VehiclesPage.jsx'
import {
  createEmptyVehicle,
  createVehicleId,
  getStoredVehicles,
  saveVehicles,
} from './lib/vehicles.js'
import {
  createEmptyMaintenance,
  createMaintenanceId,
  getLatestMaintenanceRecord,
  getStoredMaintenance,
  saveMaintenance,
} from './lib/maintenance.js'
import {
  createEmptyFuelRecord,
  createFuelRecordId,
  getFleetFuelSummary,
  getStoredFuelRecords,
  saveFuelRecords,
} from './lib/fuel.js'
import { getFleetAlertSummary } from './lib/serviceSchedules.js'
import './App.css'

const PAGES = {
  dashboard: 'dashboard',
  vehicles: 'vehicles',
  vehicleDetail: 'vehicleDetail',
}

function App() {
  const [page, setPage] = useState(PAGES.dashboard)
  const [vehicles, setVehicles] = useState(getStoredVehicles)
  const [maintenanceRecords, setMaintenanceRecords] = useState(getStoredMaintenance)
  const [fuelRecords, setFuelRecords] = useState(getStoredFuelRecords)
  const [editingVehicleId, setEditingVehicleId] = useState(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)

  useEffect(() => {
    saveVehicles(vehicles)
  }, [vehicles])

  useEffect(() => {
    saveMaintenance(maintenanceRecords)
  }, [maintenanceRecords])

  useEffect(() => {
    saveFuelRecords(fuelRecords)
  }, [fuelRecords])

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles],
  )
  const editingVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === editingVehicleId) ?? null,
    [editingVehicleId, vehicles],
  )
  const latestMaintenanceRecord = useMemo(
    () => getLatestMaintenanceRecord(maintenanceRecords),
    [maintenanceRecords],
  )
  const latestMaintenanceVehicle =
    latestMaintenanceRecord &&
    vehicles.find((vehicle) => vehicle.id === latestMaintenanceRecord.vehicleId)
  const alertSummary = useMemo(
    () => getFleetAlertSummary(vehicles, maintenanceRecords),
    [maintenanceRecords, vehicles],
  )
  const fuelSummary = useMemo(
    () => getFleetFuelSummary(vehicles, fuelRecords),
    [fuelRecords, vehicles],
  )

  const totalMaintenanceCost = maintenanceRecords.reduce(
    (sum, record) => sum + (Number(record.cost) || 0),
    0,
  )

  function handleNavigate(nextPage) {
    setPage(nextPage)
    setSelectedVehicleId(null)
    setEditingVehicleId(null)
  }

  function handleSaveVehicle(vehicleData, editingId) {
    setVehicles((currentVehicles) => {
      if (editingId) {
        return currentVehicles.map((vehicle) =>
          vehicle.id === editingId ? { ...vehicle, ...vehicleData } : vehicle,
        )
      }

      return [
        {
          id: createVehicleId(),
          ...createEmptyVehicle(),
          ...vehicleData,
        },
        ...currentVehicles,
      ]
    })

    setEditingVehicleId(null)
    setPage(PAGES.vehicles)
  }

  function handleEditVehicle(vehicle) {
    setEditingVehicleId(vehicle.id)
    setSelectedVehicleId(null)
    setPage(PAGES.vehicles)
  }

  function handleDeleteVehicle(vehicleId) {
    const wasSelected = selectedVehicleId === vehicleId
    const wasEditing = editingVehicleId === vehicleId

    setVehicles((currentVehicles) =>
      currentVehicles.filter((vehicle) => vehicle.id !== vehicleId),
    )
    setMaintenanceRecords((currentRecords) =>
      currentRecords.filter((record) => record.vehicleId !== vehicleId),
    )
    setFuelRecords((currentRecords) =>
      currentRecords.filter((record) => record.vehicleId !== vehicleId),
    )

    if (wasEditing) {
      setEditingVehicleId(null)
    }

    if (wasSelected) {
      setSelectedVehicleId(null)
      setPage(PAGES.vehicles)
    }
  }

  function handleViewVehicle(vehicleId) {
    setSelectedVehicleId(vehicleId)
    setEditingVehicleId(null)
    setPage(PAGES.vehicleDetail)
  }

  function handleBackFromDetail() {
    setSelectedVehicleId(null)
    setPage(PAGES.vehicles)
  }

  function handleSaveMaintenance(vehicleId, maintenanceData, editingId) {
    setMaintenanceRecords((currentRecords) => {
      if (editingId) {
        return currentRecords.map((record) =>
          record.id === editingId ? { ...record, ...maintenanceData } : record,
        )
      }

      return [
        {
          id: createMaintenanceId(),
          vehicleId,
          ...createEmptyMaintenance(),
          ...maintenanceData,
        },
        ...currentRecords,
      ]
    })
  }

  function handleDeleteMaintenance(recordId) {
    setMaintenanceRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== recordId),
    )
  }

  function handleSaveFuel(vehicleId, fuelData, editingId) {
    setFuelRecords((currentRecords) => {
      if (editingId) {
        return currentRecords.map((record) =>
          record.id === editingId ? { ...record, ...fuelData } : record,
        )
      }

      return [
        {
          id: createFuelRecordId(),
          vehicleId,
          ...createEmptyFuelRecord(),
          ...fuelData,
        },
        ...currentRecords,
      ]
    })
  }

  function handleDeleteFuel(recordId) {
    setFuelRecords((currentRecords) =>
      currentRecords.filter((record) => record.id !== recordId),
    )
  }

  const activeNavigationPage =
    page === PAGES.vehicleDetail ? PAGES.vehicles : page

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Auto Tracker</p>
          <h1>Vehicle and maintenance tracking, kept local.</h1>
        </div>
        <Navigation
          activePage={activeNavigationPage}
          onNavigate={handleNavigate}
          vehicleCount={vehicles.length}
        />
      </header>

      <main className="main-content">
        {page === PAGES.dashboard ? (
          <Dashboard
            latestMaintenanceRecord={latestMaintenanceRecord}
            latestMaintenanceVehicle={latestMaintenanceVehicle}
            latestFuelRecord={fuelSummary.latestFuelRecord}
            latestFuelVehicle={fuelSummary.latestFuelVehicle}
            maintenanceRecordCount={maintenanceRecords.length}
            nextAlert={alertSummary.nextAlert}
            overdueAlertCount={alertSummary.overdueAlerts.length}
            fuelAverageMpg={fuelSummary.averageMpg}
            fuelCostPerMile={fuelSummary.costPerMile}
            fuelLifetimeSpend={fuelSummary.lifetimeFuelSpend}
            fuelMonthlySpend={fuelSummary.monthlyFuelSpend}
            fuelRecordCount={fuelSummary.totalFuelRecordCount}
            upcomingAlertCount={alertSummary.upcomingAlerts.length}
            totalMaintenanceCost={totalMaintenanceCost}
            vehicleCount={vehicles.length}
          />
        ) : null}

        {page === PAGES.vehicles ? (
          <VehiclesPage
            editingVehicle={editingVehicle}
            onCancelEdit={() => setEditingVehicleId(null)}
            onDeleteVehicle={handleDeleteVehicle}
            onEditVehicle={handleEditVehicle}
            onSaveVehicle={handleSaveVehicle}
            onViewVehicle={handleViewVehicle}
            vehicles={vehicles}
          />
        ) : null}

        {page === PAGES.vehicleDetail ? (
          selectedVehicle ? (
          <VehicleDetailPage
              key={selectedVehicle.id}
              fuelRecords={fuelRecords}
              maintenanceRecords={maintenanceRecords}
              onBack={handleBackFromDetail}
              onDeleteFuel={handleDeleteFuel}
              onDeleteMaintenance={handleDeleteMaintenance}
              onSaveFuel={handleSaveFuel}
              onSaveMaintenance={handleSaveMaintenance}
              selectedVehicle={selectedVehicle}
            />
          ) : (
            <section className="page-panel">
              <div className="empty-state">
                <h3>Vehicle not found</h3>
                <p>This vehicle was removed or is no longer available.</p>
                <button type="button" className="primary-button" onClick={handleBackFromDetail}>
                  Back to vehicles
                </button>
              </div>
            </section>
          )
        ) : null}
      </main>
    </div>
  )
}

export default App
