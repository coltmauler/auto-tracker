import { useState } from 'react'
import { createEmptyFuelRecord, validateFuelRecord } from '../lib/fuel.js'

function FuelForm({ editingRecord, onCancelEdit, onSaveRecord }) {
  const [form, setForm] = useState(() =>
    editingRecord ? { ...createEmptyFuelRecord(), ...editingRecord } : createEmptyFuelRecord(),
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

    const nextErrors = validateFuelRecord(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const cleanedRecord = {
      fillDate: form.fillDate.trim(),
      mileage: form.mileage.trim(),
      gallons: form.gallons.trim(),
      cost: form.cost.trim(),
      station: form.station.trim(),
      notes: form.notes.trim(),
    }

    onSaveRecord(cleanedRecord, editingRecord?.id ?? null)

    if (!editingRecord) {
      setForm(createEmptyFuelRecord())
      setErrors({})
    }
  }

  return (
    <section className="page-panel">
      <div className="page-header compact">
        <div>
          <p className="section-label">{editingRecord ? 'Edit fuel record' : 'Add fuel record'}</p>
          <h2>{editingRecord ? 'Update the fuel entry.' : 'Log a fill-up.'}</h2>
        </div>
      </div>

      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Fill date *</span>
            <input type="date" name="fillDate" value={form.fillDate} onChange={handleChange} />
            {errors.fillDate ? <small className="error">{errors.fillDate}</small> : null}
          </label>

          <label className="field">
            <span>Mileage *</span>
            <input
              name="mileage"
              value={form.mileage}
              onChange={handleChange}
              inputMode="numeric"
              placeholder="45210"
            />
            {errors.mileage ? <small className="error">{errors.mileage}</small> : null}
          </label>

          <label className="field">
            <span>Gallons *</span>
            <input
              name="gallons"
              value={form.gallons}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="12.4"
            />
            {errors.gallons ? <small className="error">{errors.gallons}</small> : null}
          </label>

          <label className="field">
            <span>Cost *</span>
            <input
              name="cost"
              value={form.cost}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="42.50"
            />
            {errors.cost ? <small className="error">{errors.cost}</small> : null}
          </label>

          <label className="field">
            <span>Station</span>
            <input
              name="station"
              value={form.station}
              onChange={handleChange}
              placeholder="Shell"
            />
          </label>

          <label className="field field-wide">
            <span>Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="4"
              placeholder="Optional notes"
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

export default FuelForm
