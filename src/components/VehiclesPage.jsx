import VehicleForm from './VehicleForm.jsx'
import VehicleList from './VehicleList.jsx'

function VehiclesPage({
  editingVehicle,
  onCancelEdit,
  onDeleteVehicle,
  onEditVehicle,
  onSaveVehicle,
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
        vehicles={vehicles}
      />
    </div>
  )
}

export default VehiclesPage
