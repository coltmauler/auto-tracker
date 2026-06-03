import { useState } from 'react'
import { createEmptyVehicle, validateVehicle } from '../lib/vehicles.js'

function VehicleForm({ editingVehicle, onCancelEdit, onSaveVehicle }) {
  const [form, setForm] = useState(() =>
    editingVehicle ? { ...createEmptyVehicle(), ...editingVehicle } : createEmptyVehicle(),
  )
  const [errors, setErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateVehicle(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const cleanedVehicle = {
      year: form.year.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      nickname: form.nickname.trim(),
      mileage: form.mileage.trim(),
      vin: form.vin.trim(),
      licensePlate: form.licensePlate.trim(),
      notes: form.notes.trim(),
      oilChangeMiles: form.oilChangeMiles.trim(),
      oilChangeMonths: form.oilChangeMonths.trim(),
      tireRotationMiles: form.tireRotationMiles.trim(),
      tireRotationMonths: form.tireRotationMonths.trim(),
    }

    onSaveVehicle(cleanedVehicle, editingVehicle?.id ?? null)

    if (!editingVehicle) {
      setForm(createEmptyVehicle())
    }
  }

  return (
    <section className="page-panel">
      <div className="page-header compact">
        <div>
          <p className="section-label">{editingVehicle ? 'Edit vehicle' : 'Add vehicle'}</p>
          <h2>{editingVehicle ? 'Update the existing record.' : 'Create a new vehicle record.'}</h2>
        </div>
      </div>

      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Year *</span>
            <input
              name="year"
              value={form.year}
              onChange={handleChange}
              inputMode="numeric"
              placeholder="2024"
            />
            {errors.year ? <small className="error">{errors.year}</small> : null}
          </label>

          <label className="field">
            <span>Make *</span>
            <input
              name="make"
              value={form.make}
              onChange={handleChange}
              placeholder="Toyota"
            />
            {errors.make ? <small className="error">{errors.make}</small> : null}
          </label>

          <label className="field">
            <span>Model *</span>
            <input
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="Camry"
            />
            {errors.model ? <small className="error">{errors.model}</small> : null}
          </label>

          <label className="field">
            <span>Mileage *</span>
            <input
              name="mileage"
              value={form.mileage}
              onChange={handleChange}
              inputMode="numeric"
              placeholder="42000"
            />
            {errors.mileage ? <small className="error">{errors.mileage}</small> : null}
          </label>

          <label className="field">
            <span>Nickname</span>
            <input
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="Daily driver"
            />
          </label>

          <label className="field">
            <span>VIN</span>
            <input name="vin" value={form.vin} onChange={handleChange} placeholder="1HGBH41JXMN109186" />
          </label>

          <label className="field">
            <span>License plate</span>
            <input
              name="licensePlate"
              value={form.licensePlate}
              onChange={handleChange}
              placeholder="ABC-1234"
            />
          </label>

          <label className="field field-wide">
            <span>Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Anything useful to remember"
            />
          </label>

          <div className="schedule-block field-wide">
            <div className="schedule-heading">
              <p className="section-label">Service schedule</p>
              <p className="muted">
                Optional reminders for oil changes and tire rotations.
              </p>
            </div>

            <div className="schedule-grid">
              <label className="field">
                <span>Oil change miles</span>
                <input
                  name="oilChangeMiles"
                  value={form.oilChangeMiles}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder="5000"
                />
                {errors.oilChangeMiles ? (
                  <small className="error">{errors.oilChangeMiles}</small>
                ) : null}
              </label>

              <label className="field">
                <span>Oil change months</span>
                <input
                  name="oilChangeMonths"
                  value={form.oilChangeMonths}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder="6"
                />
                {errors.oilChangeMonths ? (
                  <small className="error">{errors.oilChangeMonths}</small>
                ) : null}
              </label>

              <label className="field">
                <span>Tire rotation miles</span>
                <input
                  name="tireRotationMiles"
                  value={form.tireRotationMiles}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder="7500"
                />
                {errors.tireRotationMiles ? (
                  <small className="error">{errors.tireRotationMiles}</small>
                ) : null}
              </label>

              <label className="field">
                <span>Tire rotation months</span>
                <input
                  name="tireRotationMonths"
                  value={form.tireRotationMonths}
                  onChange={handleChange}
                  inputMode="numeric"
                  placeholder="12"
                />
                {errors.tireRotationMonths ? (
                  <small className="error">{errors.tireRotationMonths}</small>
                ) : null}
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          {editingVehicle ? (
            <button type="button" className="secondary-button" onClick={onCancelEdit}>
              Cancel
            </button>
          ) : null}
          <button type="submit" className="primary-button">
            {editingVehicle ? 'Save changes' : 'Add vehicle'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default VehicleForm
