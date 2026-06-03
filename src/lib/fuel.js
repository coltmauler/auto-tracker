import { formatMoney } from './maintenance.js'

const STORAGE_KEY = 'auto-tracker.v0.0.4.fuel'

const DEFAULT_FUEL_RECORD = {
  fillDate: '',
  mileage: '',
  gallons: '',
  cost: '',
  station: '',
  notes: '',
}

export function createEmptyFuelRecord() {
  return { ...DEFAULT_FUEL_RECORD }
}

export function createFuelRecordId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `fuel-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getStoredFuelRecords() {
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
        id: String(record.id ?? createFuelRecordId()),
        vehicleId: String(record.vehicleId ?? ''),
        ...DEFAULT_FUEL_RECORD,
        ...record,
      }))
  } catch {
    return []
  }
}

export function saveFuelRecords(records) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function validateFuelRecord(record) {
  const errors = {}

  if (!record.fillDate.trim()) {
    errors.fillDate = 'Fill date is required.'
  }

  if (!record.mileage.trim()) {
    errors.mileage = 'Mileage is required.'
  } else if (!/^\d+$/.test(record.mileage.trim())) {
    errors.mileage = 'Mileage must be a non-negative whole number.'
  }

  if (!record.gallons.trim()) {
    errors.gallons = 'Gallons are required.'
  } else if (!isPositiveDecimal(record.gallons.trim())) {
    errors.gallons = 'Gallons must be a positive number.'
  }

  if (!record.cost.trim()) {
    errors.cost = 'Cost is required.'
  } else if (!isPositiveDecimal(record.cost.trim())) {
    errors.cost = 'Cost must be a positive number.'
  }

  return errors
}

export function getLatestFuelRecord(records) {
  if (records.length === 0) {
    return null
  }

  return [...records].sort((left, right) => {
    const leftDate = parseFuelDate(left.fillDate)
    const rightDate = parseFuelDate(right.fillDate)
    const leftTime = leftDate ? leftDate.getTime() : 0
    const rightTime = rightDate ? rightDate.getTime() : 0

    if (leftTime !== rightTime) {
      return rightTime - leftTime
    }

    const leftMileage = Number(left.mileage) || 0
    const rightMileage = Number(right.mileage) || 0

    if (leftMileage !== rightMileage) {
      return rightMileage - leftMileage
    }

    return String(right.id).localeCompare(String(left.id))
  })[0]
}

export function sortFuelRecordsDescending(records) {
  return [...records].sort((left, right) => {
    const leftDate = parseFuelDate(left.fillDate)
    const rightDate = parseFuelDate(right.fillDate)
    const leftTime = leftDate ? leftDate.getTime() : 0
    const rightTime = rightDate ? rightDate.getTime() : 0

    if (leftTime !== rightTime) {
      return rightTime - leftTime
    }

    const leftMileage = Number(left.mileage) || 0
    const rightMileage = Number(right.mileage) || 0

    if (leftMileage !== rightMileage) {
      return rightMileage - leftMileage
    }

    return String(right.id).localeCompare(String(left.id))
  })
}

export function getVehicleFuelStats(vehicle, fuelRecords, now = new Date()) {
  const vehicleRecords = fuelRecords.filter((record) => record.vehicleId === vehicle.id)
  const sortedRecords = sortFuelRecordsAscending(vehicleRecords)
  const latestFuelRecord = getLatestFuelRecord(vehicleRecords)
  const totalSpend = vehicleRecords.reduce((sum, record) => sum + (Number(record.cost) || 0), 0)
  const monthlySpend = vehicleRecords.reduce((sum, record) => {
    const parsedDate = parseFuelDate(record.fillDate)
    if (!parsedDate) {
      return sum
    }

    if (
      parsedDate.getFullYear() === now.getFullYear() &&
      parsedDate.getMonth() === now.getMonth()
    ) {
      return sum + (Number(record.cost) || 0)
    }

    return sum
  }, 0)

  const usageStats = calculateUsageStats(sortedRecords)

  return {
    fuelRecordCount: vehicleRecords.length,
    lifetimeFuelSpend: totalSpend,
    monthlyFuelSpend: monthlySpend,
    averageMpg: usageStats.averageMpg,
    costPerMile: usageStats.costPerMile,
    latestFuelRecord,
  }
}

export function getFleetFuelSummary(vehicles, fuelRecords, now = new Date()) {
  const totalFuelRecordCount = fuelRecords.length
  const lifetimeFuelSpend = fuelRecords.reduce((sum, record) => sum + (Number(record.cost) || 0), 0)
  const monthlyFuelSpend = fuelRecords.reduce((sum, record) => {
    const parsedDate = parseFuelDate(record.fillDate)
    if (!parsedDate) {
      return sum
    }

    if (
      parsedDate.getFullYear() === now.getFullYear() &&
      parsedDate.getMonth() === now.getMonth()
    ) {
      return sum + (Number(record.cost) || 0)
    }

    return sum
  }, 0)

  const latestFuelRecord = getLatestFuelRecord(fuelRecords)
  const latestFuelVehicle =
    latestFuelRecord && vehicles.find((vehicle) => vehicle.id === latestFuelRecord.vehicleId)

  const usageStats = calculateFleetUsageStats(vehicles, fuelRecords)

  return {
    totalFuelRecordCount,
    lifetimeFuelSpend,
    monthlyFuelSpend,
    averageMpg: usageStats.averageMpg,
    costPerMile: usageStats.costPerMile,
    latestFuelRecord,
    latestFuelVehicle,
  }
}

export function formatFuelNumber(value) {
  if (value == null) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatFuelMileage(value) {
  if (value == null) {
    return 'N/A'
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  }).format(value)
}

function calculateFleetUsageStats(vehicles, fuelRecords) {
  const vehicleUsage = vehicles
    .map((vehicle) => {
      const stats = calculateUsageStats(
        sortFuelRecordsAscending(fuelRecords.filter((record) => record.vehicleId === vehicle.id)),
      )

      return stats
    })
    .filter((stats) => stats.totalMiles > 0 && stats.totalGallons > 0)

  const totalMiles = vehicleUsage.reduce((sum, stats) => sum + stats.totalMiles, 0)
  const totalGallons = vehicleUsage.reduce((sum, stats) => sum + stats.totalGallons, 0)
  const totalSpend = fuelRecords.reduce((sum, record) => sum + (Number(record.cost) || 0), 0)

  return {
    averageMpg: totalMiles > 0 && totalGallons > 0 ? totalMiles / totalGallons : null,
    costPerMile: totalMiles > 0 ? totalSpend / totalMiles : null,
  }
}

function calculateUsageStats(sortedRecords) {
  if (sortedRecords.length < 2) {
    return {
      totalMiles: 0,
      totalGallons: 0,
      averageMpg: null,
      costPerMile: null,
    }
  }

  const firstMileage = Number(sortedRecords[0].mileage)
  const lastMileage = Number(sortedRecords[sortedRecords.length - 1].mileage)
  const totalMiles = Number.isFinite(firstMileage) && Number.isFinite(lastMileage)
    ? Math.max(lastMileage - firstMileage, 0)
    : 0

  const totalGallons = sortedRecords.slice(1).reduce((sum, record) => sum + (Number(record.gallons) || 0), 0)
  const totalSpend = sortedRecords.reduce((sum, record) => sum + (Number(record.cost) || 0), 0)

  return {
    totalMiles,
    totalGallons,
    averageMpg: totalMiles > 0 && totalGallons > 0 ? totalMiles / totalGallons : null,
    costPerMile: totalMiles > 0 ? totalSpend / totalMiles : null,
  }
}

function sortFuelRecordsAscending(records) {
  return [...records].sort((left, right) => {
    const leftMileage = Number(left.mileage) || 0
    const rightMileage = Number(right.mileage) || 0

    if (leftMileage !== rightMileage) {
      return leftMileage - rightMileage
    }

    const leftDate = parseFuelDate(left.fillDate)
    const rightDate = parseFuelDate(right.fillDate)
    const leftTime = leftDate ? leftDate.getTime() : 0
    const rightTime = rightDate ? rightDate.getTime() : 0

    if (leftTime !== rightTime) {
      return leftTime - rightTime
    }

    return String(left.id).localeCompare(String(right.id))
  })
}

function parseFuelDate(value) {
  if (!value) {
    return null
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate
}

function isPositiveDecimal(value) {
  return /^\d+(\.\d+)?$/.test(value) && Number(value) > 0
}

export { formatMoney }
