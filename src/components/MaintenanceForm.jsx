import { useState } from 'react'
import { createEmptyMaintenance, validateMaintenance } from '../lib/maintenance.js'

function MaintenanceForm({ editingRecord, onCancelEdit, onSaveRecord }) {
  const [form, setForm] = useState(() =>
    editingRecord
      ? { ...createEmptyMaintenance(), ...editingRecord }
      : createEmptyMaintenance(),
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

    const nextErrors = validateMaintenance(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const cleanedRecord = {
      serviceDate: form.serviceDate.trim(),
      mileage: form.mileage.trim(),
      serviceType: form.serviceType.trim(),
      cost: form.cost.trim(),
      shop: form.shop.trim(),
      notes: form.notes.trim(),
    }

    onSaveRecord(cleanedRecord, editingRecord?.id ?? null)

    if (!editingRecord) {
      setForm(createEmptyMaintenance())
      setErrors({})
    }
  }

  return (
    <section className="page-panel">
      <div className="page-header compact">
        <div>
          <p className="section-label">
            {editingRecord ? 'Edit maintenance record' : 'Add maintenance record'}
          </p>
          <h2>
            {editingRecord ? 'Update the existing maintenance entry.' : 'Log a service event.'}
          </h2>
        </div>
      </div>

      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Service date *</span>
            <input
              name="serviceDate"
              type="date"
              value={form.serviceDate}
              onChange={handleChange}
            />
            {errors.serviceDate ? <small className="error">{errors.serviceDate}</small> : null}
          </label>

          <label className="field">
            <span>Mileage *</span>
            <input
              name="mileage"
              value={form.mileage}
              onChange={handleChange}
              inputMode="numeric"
              placeholder="42500"
            />
            {errors.mileage ? <small className="error">{errors.mileage}</small> : null}
          </label>

          <label className="field">
            <span>Service type *</span>
            <input
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              placeholder="Oil change"
            />
            {errors.serviceType ? <small className="error">{errors.serviceType}</small> : null}
          </label>

          <label className="field">
            <span>Cost *</span>
            <input
              name="cost"
              value={form.cost}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="89.99"
            />
            {errors.cost ? <small className="error">{errors.cost}</small> : null}
          </label>

          <label className="field">
            <span>Shop</span>
            <input name="shop" value={form.shop} onChange={handleChange} placeholder="Quick Lube" />
          </label>

          <label className="field field-wide">
            <span>Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Any extra detail"
            />
          </label>
        </div>

        <div className="form-actions">
          {editingRecord ? (
            <button type="button" className="secondary-button" onClick={onCancelEdit}>
              Cancel
            </button>
          ) : null}
          <button type="submit" className="primary-button">
            {editingRecord ? 'Save changes' : 'Add record'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default MaintenanceForm
