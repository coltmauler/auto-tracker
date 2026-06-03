import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import Navigation from './components/Navigation.jsx'
import VehiclesPage from './components/VehiclesPage.jsx'
import {
  createEmptyVehicle,
  createVehicleId,
  getStoredVehicles,
  saveVehicles,
} from './lib/vehicles.js'
import './App.css'

const PAGES = {
  dashboard: 'dashboard',
  vehicles: 'vehicles',
}

function App() {
  const [page, setPage] = useState(PAGES.dashboard)
  const [vehicles, setVehicles] = useState(getStoredVehicles)
  const [editingVehicleId, setEditingVehicleId] = useState(null)

  useEffect(() => {
    saveVehicles(vehicles)
  }, [vehicles])

  const editingVehicle = vehicles.find(({ id }) => id === editingVehicleId) ?? null

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
    setPage(PAGES.vehicles)
  }

  function handleDeleteVehicle(vehicleId) {
    setVehicles((currentVehicles) =>
      currentVehicles.filter((vehicle) => vehicle.id !== vehicleId),
    )
    setEditingVehicleId((currentEditingId) =>
      currentEditingId === vehicleId ? null : currentEditingId,
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Auto Tracker</p>
          <h1>Vehicle tracking, kept local.</h1>
        </div>
        <Navigation
          activePage={page}
          onNavigate={setPage}
          vehicleCount={vehicles.length}
        />
      </header>

      <main className="main-content">
        {page === PAGES.dashboard ? (
          <Dashboard vehicleCount={vehicles.length} vehicles={vehicles} />
        ) : (
          <VehiclesPage
            editingVehicle={editingVehicle}
            onCancelEdit={() => setEditingVehicleId(null)}
            onDeleteVehicle={handleDeleteVehicle}
            onEditVehicle={handleEditVehicle}
            onSaveVehicle={handleSaveVehicle}
            vehicles={vehicles}
          />
        )}
      </main>
    </div>
  )
}

export default App
