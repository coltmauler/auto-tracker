const BACKUP_META_STORAGE_KEY = 'auto-tracker.backup-meta'

export function getStoredBackupMeta() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedValue = window.localStorage.getItem(BACKUP_META_STORAGE_KEY)
    if (!storedValue) {
      return null
    }

    const parsed = JSON.parse(storedValue)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function saveBackupMeta(meta) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(BACKUP_META_STORAGE_KEY, JSON.stringify(meta))
}

export function buildAppBackup({
  documents,
  expenses,
  fuelRecords,
  maintenanceRecords,
  vehicles,
}) {
  return {
    appName: 'Auto Tracker',
    version: '0.0.8',
    exportedAt: new Date().toISOString(),
    data: {
      vehicles,
      maintenanceRecords,
      fuelRecords,
      documents,
      expenses,
    },
  }
}

export function parseAppBackup(jsonText) {
  const parsed = JSON.parse(jsonText)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file.')
  }

  const data = parsed.data ?? parsed
  const vehicles = normalizeArray(data.vehicles)
  const maintenanceRecords = normalizeArray(data.maintenanceRecords)
  const fuelRecords = normalizeArray(data.fuelRecords)
  const documents = normalizeArray(data.documents)
  const expenses = normalizeArray(data.expenses)

  return {
    vehicles,
    maintenanceRecords,
    fuelRecords,
    documents,
    expenses,
    exportedAt: parsed.exportedAt ?? null,
  }
}

export function formatBackupDate(value) {
  if (!value) {
    return 'Not backed up yet'
  }

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not backed up yet'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate)
}

export function createBackupFileName() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `auto-tracker-backup-${stamp}.json`
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}
