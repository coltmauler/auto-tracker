const STORAGE_KEY = 'auto-tracker.v0.0.9.preferences'

export const DEFAULT_PREFERENCES = {
  distanceUnit: 'miles',
  currencySymbol: '$',
  dateFormat: 'mdy',
  reminderWindowDays: '30',
}

const MILES_TO_KM = 1.60934

export function getStoredPreferences() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_PREFERENCES }
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) {
      return { ...DEFAULT_PREFERENCES }
    }

    const parsed = JSON.parse(storedValue)
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_PREFERENCES }
    }

    return normalizePreferences(parsed)
  } catch {
    return { ...DEFAULT_PREFERENCES }
  }
}

export function savePreferences(preferences) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizePreferences(preferences)))
}

export function normalizePreferences(preferences = {}) {
  return {
    distanceUnit: preferences.distanceUnit === 'km' ? 'km' : 'miles',
    currencySymbol:
      typeof preferences.currencySymbol === 'string' && preferences.currencySymbol.trim()
        ? preferences.currencySymbol.trim().slice(0, 4)
        : DEFAULT_PREFERENCES.currencySymbol,
    dateFormat: ['mdy', 'dmy', 'ymd'].includes(preferences.dateFormat)
      ? preferences.dateFormat
      : DEFAULT_PREFERENCES.dateFormat,
    reminderWindowDays: normalizePositiveInteger(
      preferences.reminderWindowDays,
      DEFAULT_PREFERENCES.reminderWindowDays,
    ),
  }
}

export function formatMoneyValue(value, currencySymbol = DEFAULT_PREFERENCES.currencySymbol) {
  const numberValue = Number(value) || 0
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberValue)

  return `${currencySymbol}${formattedNumber}`
}

export function formatDateValue(value, dateFormat = DEFAULT_PREFERENCES.dateFormat) {
  if (!value) {
    return 'Not set'
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  const year = parsedDate.getFullYear()
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
  const day = String(parsedDate.getDate()).padStart(2, '0')

  if (dateFormat === 'dmy') {
    return `${day}/${month}/${year}`
  }

  if (dateFormat === 'ymd') {
    return `${year}-${month}-${day}`
  }

  return `${month}/${day}/${year}`
}

export function convertMiles(value, distanceUnit = DEFAULT_PREFERENCES.distanceUnit) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return null
  }

  if (distanceUnit === 'km') {
    return numberValue * MILES_TO_KM
  }

  return numberValue
}

export function formatDistanceValue(value, distanceUnit = DEFAULT_PREFERENCES.distanceUnit) {
  if (value == null || String(value).trim() === '') {
    return 'N/A'
  }

  const convertedValue = convertMiles(value, distanceUnit)
  if (convertedValue == null) {
    return 'N/A'
  }

  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: distanceUnit === 'km' ? 1 : 0,
  }).format(convertedValue)} ${distanceUnit}`
}

export function formatCostPerDistanceValue(
  value,
  distanceUnit = DEFAULT_PREFERENCES.distanceUnit,
  currencySymbol = DEFAULT_PREFERENCES.currencySymbol,
) {
  if (value == null || String(value).trim() === '') {
    return 'N/A'
  }

  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) {
    return 'N/A'
  }

  const adjustedValue = distanceUnit === 'km' ? numberValue / MILES_TO_KM : numberValue
  return formatMoneyValue(adjustedValue, currencySymbol)
}

export function getDistanceUnitLabel(distanceUnit = DEFAULT_PREFERENCES.distanceUnit) {
  return distanceUnit === 'km' ? 'km' : 'miles'
}

export function getCostPerDistanceLabel(distanceUnit = DEFAULT_PREFERENCES.distanceUnit) {
  return distanceUnit === 'km' ? 'Cost per km' : 'Cost per mile'
}

export function getReminderWindowDays(preferences) {
  return normalizePositiveInteger(preferences?.reminderWindowDays, DEFAULT_PREFERENCES.reminderWindowDays)
}

function normalizePositiveInteger(value, fallback) {
  const parsedValue = Number.parseInt(String(value ?? '').trim(), 10)
  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return String(parsedValue)
  }

  return fallback
}
