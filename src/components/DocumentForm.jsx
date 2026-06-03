import { useState } from 'react'
import { createEmptyDocument, validateDocument } from '../lib/documents.js'

function DocumentForm({ editingRecord, onCancelEdit, onSaveRecord }) {
  const [form, setForm] = useState(() =>
    editingRecord ? { ...createEmptyDocument(), ...editingRecord } : createEmptyDocument(),
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

    const nextErrors = validateDocument(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const cleanedRecord = {
      documentType: form.documentType.trim(),
      title: form.title.trim(),
      issueDate: form.issueDate.trim(),
      expirationDate: form.expirationDate.trim(),
      fileName: form.fileName.trim(),
      notes: form.notes.trim(),
    }

    onSaveRecord(cleanedRecord, editingRecord?.id ?? null)

    if (!editingRecord) {
      setForm(createEmptyDocument())
      setErrors({})
    }
  }

  return (
    <section className="page-panel">
      <div className="page-header compact">
        <div>
          <p className="section-label">{editingRecord ? 'Edit document' : 'Add document'}</p>
          <h2>{editingRecord ? 'Update the document entry.' : 'Add a vehicle document record.'}</h2>
          <p className="muted">File uploads are not enabled yet. Store the file name or reference only.</p>
        </div>
      </div>

      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Document type *</span>
            <input
              name="documentType"
              value={form.documentType}
              onChange={handleChange}
              placeholder="Registration"
            />
            {errors.documentType ? <small className="error">{errors.documentType}</small> : null}
          </label>

          <label className="field">
            <span>Title *</span>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="2026 registration"
            />
            {errors.title ? <small className="error">{errors.title}</small> : null}
          </label>

          <label className="field">
            <span>Issue date</span>
            <input type="date" name="issueDate" value={form.issueDate} onChange={handleChange} />
            {errors.issueDate ? <small className="error">{errors.issueDate}</small> : null}
          </label>

          <label className="field">
            <span>Expiration date</span>
            <input
              type="date"
              name="expirationDate"
              value={form.expirationDate}
              onChange={handleChange}
            />
            {errors.expirationDate ? <small className="error">{errors.expirationDate}</small> : null}
          </label>

          <label className="field">
            <span>File name / reference *</span>
            <input
              name="fileName"
              value={form.fileName}
              onChange={handleChange}
              placeholder="registration.pdf"
            />
            {errors.fileName ? <small className="error">{errors.fileName}</small> : null}
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
            {editingRecord ? 'Save changes' : 'Add document'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default DocumentForm
