import {
  formatDateValue,
  formatDistanceValue,
  formatMoneyValue,
} from './preferences.js'

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
    errors.serviceDate = 'Choose the service date.'
  }

  if (!record.serviceType.trim()) {
    errors.serviceType = 'Enter a service type.'
  }

  if (!mileageValue) {
    errors.mileage = 'Enter the mileage at service.'
  } else if (!/^\d+$/.test(mileageValue)) {
    errors.mileage = 'Mileage must be a whole number of miles.'
  }

  if (!costValue) {
    errors.cost = 'Enter the service cost.'
  } else if (Number.isNaN(Number(costValue)) || Number(costValue) < 0) {
    errors.cost = 'Cost must be zero or a positive number.'
  }

  return errors
}

export function formatMoney(value, currencySymbol = '$') {
  return formatMoneyValue(value, currencySymbol)
}

export function formatServiceDate(value, dateFormat = 'mdy') {
  return formatDateValue(value, dateFormat)
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

export function getMaintenanceStats(records, vehicleMileage, preferences = null) {
  const totalCost = records.reduce((sum, record) => sum + (Number(record.cost) || 0), 0)
  const latestRecord = getLatestMaintenanceRecord(records)
  const distanceUnit = preferences?.distanceUnit ?? 'miles'
  const dateFormat = preferences?.dateFormat ?? 'mdy'

  return {
    currentMileage:
      vehicleMileage != null && vehicleMileage !== ''
        ? formatDistanceValue(vehicleMileage, distanceUnit)
        : 'Not set',
    maintenanceCount: records.length,
    totalCost,
    lastServiceDate: latestRecord
      ? formatServiceDate(latestRecord.serviceDate, dateFormat)
      : 'No records yet',
  }
}
