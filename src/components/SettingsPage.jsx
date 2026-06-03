import { formatBackupDate } from '../lib/backup.js'
import { normalizePreferences } from '../lib/preferences.js'

function SettingsPage({
  appVersion,
  backupExportedAt,
  backupImportedAt,
  clearDataConfirmation,
  onClearAllData,
  onImportBackup,
  onMarkClearConfirmation,
  onRequestExport,
  onUpdatePreferences,
  preferences,
}) {
  function handlePreferenceChange(event) {
    const { name, value } = event.target
    onUpdatePreferences((currentPreferences) =>
      normalizePreferences({
        ...currentPreferences,
        [name]: value,
      }),
    )
  }

  return (
    <div className="page-stack">
      <section className="page-panel">
        <div className="page-header">
          <div>
            <p className="section-label">Settings</p>
            <h2>App settings and local data management</h2>
            <p className="muted">
              Adjust display preferences, export or restore data, and keep everything in
              localStorage.
            </p>
          </div>
          <div className="version-card">
            <span>Version</span>
            <strong>{appVersion}</strong>
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
            <p className="section-label">App settings</p>
            <h2>User preferences</h2>
            <p className="muted">These settings only change how the app displays data.</p>
          </div>
        </div>

        <div className="form-grid settings-form-grid">
          <label className="field">
            <span>Distance unit</span>
            <select
              name="distanceUnit"
              value={preferences.distanceUnit}
              onChange={handlePreferenceChange}
            >
              <option value="miles">Miles</option>
              <option value="km">Kilometers</option>
            </select>
          </label>

          <label className="field">
            <span>Currency symbol</span>
            <input
              name="currencySymbol"
              value={preferences.currencySymbol}
              onChange={handlePreferenceChange}
              maxLength={4}
              placeholder="$"
            />
          </label>

          <label className="field">
            <span>Date format</span>
            <select
              name="dateFormat"
              value={preferences.dateFormat}
              onChange={handlePreferenceChange}
            >
              <option value="mdy">MM/DD/YYYY</option>
              <option value="dmy">DD/MM/YYYY</option>
              <option value="ymd">YYYY-MM-DD</option>
            </select>
          </label>

          <label className="field">
            <span>Default reminder window (days)</span>
            <input
              name="reminderWindowDays"
              type="number"
              min="1"
              step="1"
              value={preferences.reminderWindowDays}
              onChange={handlePreferenceChange}
              inputMode="numeric"
            />
          </label>
        </div>

        <p className="muted settings-help">
          Reminder windows are used for upcoming service and document alerts.
        </p>
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

      <section className="page-panel">
        <div className="page-header compact">
          <div>
            <p className="section-label">About</p>
            <h2>About this app</h2>
          </div>
        </div>

        <div className="about-grid">
          <article className="info-card">
            <h3>What Auto Tracker stores</h3>
            <p className="muted">
              Vehicles, maintenance history, service schedules, fuel logs, documents, expenses,
              reports, and your display preferences all stay in this browser.
            </p>
          </article>

          <article className="info-card">
            <h3>Current scope</h3>
            <p className="muted">
              This release stays local-only. There is no login, no Supabase, and no file upload
              storage yet.
            </p>
          </article>
        </div>
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
          preference, and backup timestamp from this browser.
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
