const STORAGE_KEY = 'auto-tracker.v0.0.2.maintenance'

const DEFAULT_MAINTENANCE = {
  serviceDate: '',
  mileage: '',
  serviceType: '',
  cost: '',
  shop: '',
  notes: '',
}

export function createEmptyMaintenance() {
  return { ...DEFAULT_MAINTENANCE }
}

export function createMaintenanceId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `maintenance-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getStoredMaintenance() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) {
      return []
    }

    const parsed = JSON.parse(storedValue)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((record) => record && typeof record === 'object')
      .map((record) => ({
        id: String(record.id ?? createMaintenanceId()),
        vehicleId: String(record.vehicleId ?? ''),
        ...DEFAULT_MAINTENANCE,
        ...record,
      }))
  } catch {
    return []
  }
}

export function saveMaintenance(records) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function validateMaintenance(record) {
  const errors = {}
  const mileageValue = record.mileage.trim()
  const costValue = record.cost.trim()

  if (!record.serviceDate.trim()) {
    errors.serviceDate = 'Service date is required.'
  }

  if (!record.serviceType.trim()) {
    errors.serviceType = 'Service type is required.'
  }

  if (!mileageValue) {
    errors.mileage = 'Mileage is required.'
  } else if (!/^\d+$/.test(mileageValue)) {
    errors.mileage = 'Mileage must be a non-negative whole number.'
  }

  if (!costValue) {
    errors.cost = 'Cost is required.'
  } else if (Number.isNaN(Number(costValue)) || Number(costValue) < 0) {
    errors.cost = 'Cost must be a non-negative number.'
  }

  return errors
}

export function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0)
}

export function formatServiceDate(value) {
  if (!value) {
    return 'Not set'
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate)
}

export function getLatestMaintenanceRecord(records) {
  if (records.length === 0) {
    return null
  }

  return [...records].sort((left, right) => {
    const leftTime = new Date(`${left.serviceDate}T00:00:00`).getTime()
    const rightTime = new Date(`${right.serviceDate}T00:00:00`).getTime()

    if (leftTime !== rightTime) {
      return rightTime - leftTime
    }

    return String(right.id).localeCompare(String(left.id))
  })[0]
}

export function getMaintenanceStats(records, vehicleMileage) {
  const totalCost = records.reduce((sum, record) => sum + (Number(record.cost) || 0), 0)
  const latestRecord = getLatestMaintenanceRecord(records)

  return {
    currentMileage: vehicleMileage || 'Not set',
    maintenanceCount: records.length,
    totalCost,
    lastServiceDate: latestRecord ? formatServiceDate(latestRecord.serviceDate) : 'No records yet',
  }
}
