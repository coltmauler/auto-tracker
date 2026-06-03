import { useState } from 'react'
import { EXPENSE_CATEGORIES, createEmptyExpense, validateExpense } from '../lib/expenses.js'

function ExpenseForm({ editingRecord, onCancelEdit, onSaveRecord }) {
  const [form, setForm] = useState(() =>
    editingRecord ? { ...createEmptyExpense(), ...editingRecord } : createEmptyExpense(),
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

    const nextErrors = validateExpense(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const cleanedRecord = {
      date: form.date.trim(),
      category: form.category.trim(),
      amount: form.amount.trim(),
      vendor: form.vendor.trim(),
      notes: form.notes.trim(),
    }

    onSaveRecord(cleanedRecord, editingRecord?.id ?? null)

    if (!editingRecord) {
      setForm(createEmptyExpense())
      setErrors({})
    }
  }

  return (
    <section className="page-panel">
      <div className="page-header compact">
        <div>
          <p className="section-label">{editingRecord ? 'Edit expense' : 'Add expense'}</p>
          <h2>{editingRecord ? 'Update the expense entry.' : 'Log an expense.'}</h2>
        </div>
      </div>

      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Date *</span>
            <input type="date" name="date" value={form.date} onChange={handleChange} />
            {errors.date ? <small className="error">{errors.date}</small> : null}
          </label>

          <label className="field">
            <span>Category *</span>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category ? <small className="error">{errors.category}</small> : null}
          </label>

          <label className="field">
            <span>Amount *</span>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              inputMode="decimal"
              placeholder="125.00"
            />
            {errors.amount ? <small className="error">{errors.amount}</small> : null}
          </label>

          <label className="field">
            <span>Vendor</span>
            <input name="vendor" value={form.vendor} onChange={handleChange} placeholder="Shop name" />
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
            {editingRecord ? 'Save changes' : 'Add expense'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ExpenseForm
