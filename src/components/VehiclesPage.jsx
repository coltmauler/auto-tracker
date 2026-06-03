import VehicleForm from './VehicleForm.jsx'
import VehicleList from './VehicleList.jsx'

function VehiclesPage({
  editingVehicle,
  onCancelEdit,
  onDeleteVehicle,
  onEditVehicle,
  onSaveVehicle,
  onViewVehicle,
  vehicles,
}) {
  return (
    <div className="page-stack">
      <VehicleForm
        key={editingVehicle?.id ?? 'new-vehicle'}
        editingVehicle={editingVehicle}
        onCancelEdit={onCancelEdit}
        onSaveVehicle={onSaveVehicle}
      />
      <VehicleList
        onDeleteVehicle={onDeleteVehicle}
        onEditVehicle={onEditVehicle}
        onViewVehicle={onViewVehicle}
        vehicles={vehicles}
      />
    </div>
  )
}

export default VehiclesPage
