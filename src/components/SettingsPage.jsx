import { formatBackupDate } from '../lib/backup.js'

function SettingsPage({
  backupExportedAt,
  backupImportedAt,
  clearDataConfirmation,
  onClearAllData,
  onImportBackup,
  onMarkClearConfirmation,
  onRequestExport,
}) {
  return (
    <div className="page-stack">
      <section className="page-panel">
        <div className="page-header">
          <div>
            <p className="section-label">Settings</p>
            <h2>Backup and local data management</h2>
            <p className="muted">Export or restore all app data without leaving localStorage.</p>
          </div>
        </div>

        <div className="settings-meta-grid">
          <article className="info-card">
            <h3>Last backup/export</h3>
            <p className="big-number">{formatBackupDate(backupExportedAt)}</p>
          </article>

          <article className="info-card">
            <h3>Last import</h3>
            <p className="big-number">{formatBackupDate(backupImportedAt)}</p>
          </article>
        </div>
      </section>

      <section className="page-panel">
        <div className="page-header compact">
          <div>
            <p className="section-label">Backup</p>
            <h2>Export or import JSON</h2>
          </div>
        </div>

        <div className="settings-actions">
          <button type="button" className="primary-button" onClick={onRequestExport}>
            Export all data
          </button>

          <label className="secondary-button settings-file-button">
            Import data
            <input
              type="file"
              accept="application/json"
              onChange={onImportBackup}
              className="settings-file-input"
            />
          </label>
        </div>

        <p className="muted settings-help">
          Export includes vehicles, maintenance records, fuel records, documents, expenses, and
          vehicle schedule fields.
        </p>
      </section>

      <section className="page-panel danger-panel">
        <div className="page-header compact">
          <div>
            <p className="section-label">Danger zone</p>
            <h2>Clear all local app data</h2>
          </div>
        </div>

        <p className="muted">
          This removes every stored vehicle, maintenance record, fuel record, document, expense,
          and backup timestamp from this browser.
        </p>

        <div className="settings-actions">
          <button
            type="button"
            className="danger-button"
            onClick={() => onMarkClearConfirmation(!clearDataConfirmation)}
          >
            {clearDataConfirmation ? 'Cancel clear' : 'Enable clear confirmation'}
          </button>

          <button
            type="button"
            className="primary-button"
            disabled={!clearDataConfirmation}
            onClick={onClearAllData}
          >
            Clear all data
          </button>
        </div>

        {clearDataConfirmation ? (
          <p className="error settings-help">
            Confirmation enabled. Click "Clear all data" to remove every local record.
          </p>
        ) : null}
      </section>
    </div>
  )
}

export default SettingsPage
