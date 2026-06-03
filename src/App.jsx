import { useEffect, useMemo, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import Navigation from './components/Navigation.jsx'
import ReportsPage from './components/ReportsPage.jsx'
import SettingsPage from './components/SettingsPage.jsx'
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
import {
  createEmptyExpense,
  createExpenseId,
  getFleetExpenseSummary,
  getStoredExpenses,
  saveExpenses,
} from './lib/expenses.js'
import {
  createDocumentId,
  createEmptyDocument,
  getFleetDocumentSummary,
  getStoredDocuments,
  saveDocuments,
} from './lib/documents.js'
import {
  buildAppBackup,
  createBackupFileName,
  getStoredBackupMeta,
  parseAppBackup,
  saveBackupMeta,
} from './lib/backup.js'
import { buildReportsData } from './lib/reports.js'
import { getFleetAlertSummary } from './lib/serviceSchedules.js'
import './App.css'

const PAGES = {
  dashboard: 'dashboard',
  reports: 'reports',
  settings: 'settings',
  vehicles: 'vehicles',
  vehicleDetail: 'vehicleDetail',
}

function App() {
  const [page, setPage] = useState(PAGES.dashboard)
  const [vehicles, setVehicles] = useState(getStoredVehicles)
  const [maintenanceRecords, setMaintenanceRecords] = useState(getStoredMaintenance)
  const [fuelRecords, setFuelRecords] = useState(getStoredFuelRecords)
  const [expenses, setExpenses] = useState(getStoredExpenses)
  const [documents, setDocuments] = useState(getStoredDocuments)
  const [editingVehicleId, setEditingVehicleId] = useState(null)
  const [selectedVehicleId, setSelectedVehicleId] = useState(null)
  const [backupMeta, setBackupMeta] = useState(getStoredBackupMeta)
  const [clearDataConfirmation, setClearDataConfirmation] = useState(false)

  useEffect(() => {
    saveVehicles(vehicles)
  }, [vehicles])

  useEffect(() => {
    saveMaintenance(maintenanceRecords)
  }, [maintenanceRecords])

  useEffect(() => {
    saveFuelRecords(fuelRecords)
  }, [fuelRecords])

  useEffect(() => {
    saveExpenses(expenses)
  }, [expenses])

  useEffect(() => {
    saveDocuments(documents)
  }, [documents])

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
  const expenseSummary = useMemo(
    () => getFleetExpenseSummary(vehicles, expenses),
    [expenses, vehicles],
  )
  const documentSummary = useMemo(
    () => getFleetDocumentSummary(vehicles, documents),
    [documents, vehicles],
  )
  const reportData = useMemo(
    () =>
      buildReportsData({
        documents,
        expenses,
        fuelRecords,
        maintenanceRecords,
        vehicles,
      }),
    [documents, expenses, fuelRecords, maintenanceRecords, vehicles],
  )

  const totalMaintenanceCost = maintenanceRecords.reduce(
    (sum, record) => sum + (Number(record.cost) || 0),
    0,
  )

  const backupExportedAt = backupMeta?.exportedAt ?? null
  const backupImportedAt = backupMeta?.importedAt ?? null

  function handleNavigate(nextPage) {
    setPage(nextPage)
    setSelectedVehicleId(null)
    setEditingVehicleId(null)
  }

  function handleExportAllData() {
    if (typeof window === 'undefined') {
      return
    }

    const exportedAt = new Date().toISOString()
    const backup = buildAppBackup({
      documents,
      expenses,
      fuelRecords,
      maintenanceRecords,
      vehicles,
    })

    const blob = new Blob([JSON.stringify({ ...backup, exportedAt }, null, 2)], {
      type: 'application/json',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = createBackupFileName()
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    const nextMeta = {
      exportedAt,
      importedAt: backupMeta?.importedAt ?? null,
    }
    setBackupMeta(nextMeta)
    saveBackupMeta(nextMeta)
  }

  async function handleImportAllData(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const imported = parseAppBackup(text)

      setVehicles(imported.vehicles)
      setMaintenanceRecords(imported.maintenanceRecords)
      setFuelRecords(imported.fuelRecords)
      setDocuments(imported.documents)
      setExpenses(imported.expenses)
      setSelectedVehicleId(null)
      setEditingVehicleId(null)

      const importedAt = new Date().toISOString()
      const nextMeta = {
        exportedAt: imported.exportedAt ?? backupMeta?.exportedAt ?? null,
        importedAt,
      }
      setBackupMeta(nextMeta)
      saveBackupMeta(nextMeta)
      setPage(PAGES.dashboard)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to import backup file.')
    }
  }

  function handleClearAllData() {
    if (!clearDataConfirmation) {
      return
    }

    if (typeof window !== 'undefined') {
      const keysToRemove = []
      for (let index = 0; index < window.localStorage.length; index += 1) {
        const key = window.localStorage.key(index)
        if (key && key.startsWith('auto-tracker')) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => window.localStorage.removeItem(key))
    }

    setVehicles([])
    setMaintenanceRecords([])
    setFuelRecords([])
    setExpenses([])
    setDocuments([])
    setEditingVehicleId(null)
    setSelectedVehicleId(null)
    setBackupMeta(null)
    setClearDataConfirmation(false)
    setPage(PAGES.dashboard)
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
    setExpenses((currentRecords) =>
      currentRecords.filter((record) => record.vehicleId !== vehicleId),
    )
    setDocuments((currentRecords) =>
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

  function handleSaveExpense(vehicleId, expenseData, editingId) {
    setExpenses((currentRecords) => {
      if (editingId) {
        return currentRecords.map((record) =>
          record.id === editingId ? { ...record, ...expenseData } : record,
        )
      }

      return [
        {
          id: createExpenseId(),
          vehicleId,
          ...createEmptyExpense(),
          ...expenseData,
        },
        ...currentRecords,
      ]
    })
  }

  function handleDeleteExpense(recordId) {
    setExpenses((currentRecords) =>
      currentRecords.filter((record) => record.id !== recordId),
    )
  }

  function handleSaveDocument(vehicleId, documentData, editingId) {
    setDocuments((currentRecords) => {
      if (editingId) {
        return currentRecords.map((record) =>
          record.id === editingId ? { ...record, ...documentData } : record,
        )
      }

      return [
        {
          id: createDocumentId(),
          vehicleId,
          ...createEmptyDocument(),
          ...documentData,
        },
        ...currentRecords,
      ]
    })
  }

  function handleDeleteDocument(recordId) {
    setDocuments((currentRecords) =>
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
            latestExpense={expenseSummary.latestExpense}
            latestExpenseVehicle={expenseSummary.latestExpenseVehicle}
            expiringDocumentCount={documentSummary.expiringDocumentCount}
            latestDocument={documentSummary.latestDocument}
            latestDocumentVehicle={documentSummary.latestDocumentVehicle}
            lifetimeExpenseSpend={expenseSummary.lifetimeExpenseSpend}
            monthlyExpenseSpend={expenseSummary.monthlyExpenseSpend}
            recentDocumentCount={documentSummary.recentDocumentCount}
            totalExpenseCount={expenseSummary.totalExpenseCount}
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
            totalDocumentCount={documentSummary.totalDocumentCount}
            totalMaintenanceCost={totalMaintenanceCost}
            vehicleCount={vehicles.length}
          />
        ) : null}

        {page === PAGES.reports ? <ReportsPage reports={reportData} /> : null}

        {page === PAGES.settings ? (
          <SettingsPage
            backupExportedAt={backupExportedAt}
            backupImportedAt={backupImportedAt}
            clearDataConfirmation={clearDataConfirmation}
            onClearAllData={handleClearAllData}
            onImportBackup={handleImportAllData}
            onMarkClearConfirmation={setClearDataConfirmation}
            onRequestExport={handleExportAllData}
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
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
              documents={documents}
              fuelRecords={fuelRecords}
              maintenanceRecords={maintenanceRecords}
              onBack={handleBackFromDetail}
              onDeleteDocument={handleDeleteDocument}
              onDeleteFuel={handleDeleteFuel}
              onDeleteMaintenance={handleDeleteMaintenance}
              onSaveExpense={handleSaveExpense}
              onSaveDocument={handleSaveDocument}
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
