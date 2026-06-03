import { formatDocumentDate, getDocumentStatus, sortDocumentsDescending } from '../lib/documents.js'

function DocumentList({ documents, onDeleteRecord, onEditRecord }) {
  const sortedDocuments = sortDocumentsDescending(documents)

  if (sortedDocuments.length === 0) {
    return (
      <section className="page-panel">
        <div className="empty-state">
          <h3>No documents yet</h3>
          <p>Add the first document above.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page-panel">
      <div className="page-header compact">
        <div>
          <p className="section-label">Documents</p>
          <h2>Vehicle documents</h2>
        </div>
      </div>

      <div className="document-list">
        {sortedDocuments.map((document) => (
          <article key={document.id} className="document-card">
            <div className="vehicle-card-header">
              <div>
                <p className="vehicle-title">{document.title}</p>
                <p className="vehicle-subtitle">
                  {document.documentType} - {formatDocumentDate(document.issueDate)} -{' '}
                  {formatDocumentDate(document.expirationDate)}
                </p>
              </div>
              <div className="vehicle-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => onEditRecord(document)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => onDeleteRecord(document.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="document-meta-row">
              <span className="document-badge">{getDocumentStatus(document)}</span>
              <span className="muted">{document.fileName || 'No file name'}</span>
            </div>

            <dl className="vehicle-details maintenance-details document-details">
              <div>
                <dt>Issue date</dt>
                <dd>{formatDocumentDate(document.issueDate)}</dd>
              </div>
              <div>
                <dt>Expiration date</dt>
                <dd>{formatDocumentDate(document.expirationDate)}</dd>
              </div>
              <div className="vehicle-notes">
                <dt>Notes</dt>
                <dd>{document.notes || 'No notes yet'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DocumentList
