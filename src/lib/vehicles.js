const STORAGE_KEY = 'auto-tracker.v0.0.1.vehicles'

const DEFAULT_VEHICLE = {
  year: '',
  make: '',
  model: '',
  nickname: '',
  mileage: '',
  vin: '',
  licensePlate: '',
  notes: '',
}

export function createEmptyVehicle() {
  return { ...DEFAULT_VEHICLE }
}

export function createVehicleId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `vehicle-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getStoredVehicles() {
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
      .filter((vehicle) => vehicle && typeof vehicle === 'object')
      .map((vehicle) => ({
        id: String(vehicle.id ?? createVehicleId()),
        ...DEFAULT_VEHICLE,
        ...vehicle,
      }))
  } catch {
    return []
  }
}

export function saveVehicles(vehicles) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles))
}

export function validateVehicle(vehicle) {
  const errors = {}
  const yearValue = vehicle.year.trim()
  const mileageValue = vehicle.mileage.trim()
  const currentYear = new Date().getFullYear()

  if (!yearValue) {
    errors.year = 'Year is required.'
  } else if (!/^\d{4}$/.test(yearValue)) {
    errors.year = 'Year must be a 4-digit number.'
  } else {
    const numericYear = Number(yearValue)
    if (numericYear < 1886 || numericYear > currentYear + 1) {
      errors.year = `Year must be between 1886 and ${currentYear + 1}.`
    }
  }

  if (!vehicle.make.trim()) {
    errors.make = 'Make is required.'
  }

  if (!vehicle.model.trim()) {
    errors.model = 'Model is required.'
  }

  if (!mileageValue) {
    errors.mileage = 'Mileage is required.'
  } else if (!/^\d+$/.test(mileageValue)) {
    errors.mileage = 'Mileage must be a non-negative whole number.'
  }

  return errors
}
