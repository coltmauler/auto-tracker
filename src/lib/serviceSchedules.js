import { getLatestMaintenanceRecord } from './maintenance.js'

const UPCOMING_MILES_BUFFER = 500
const UPCOMING_DAYS_BUFFER = 30
const DAY_MS = 24 * 60 * 60 * 1000

const SERVICE_DEFINITIONS = [
  {
    key: 'oilChange',
    label: 'Oil change',
    fields: {
      miles: 'oilChangeMiles',
      months: 'oilChangeMonths',
    },
    keywords: ['oil change', 'oil'],
  },
  {
    key: 'tireRotation',
    label: 'Tire rotation',
    fields: {
      miles: 'tireRotationMiles',
      months: 'tireRotationMonths',
    },
    keywords: ['tire rotation', 'rotate tires', 'rotation'],
  },
]

export function getVehicleServiceSchedules(vehicle) {
  return SERVICE_DEFINITIONS.map((definition) => ({
    key: definition.key,
    label: definition.label,
    miles: parsePositiveNumber(vehicle[definition.fields.miles]),
    months: parsePositiveNumber(vehicle[definition.fields.months]),
  })).filter((schedule) => schedule.miles || schedule.months)
}

export function getVehicleServiceAlerts(vehicle, maintenanceRecords, now = new Date()) {
  const vehicleRecords = maintenanceRecords.filter((record) => record.vehicleId === vehicle.id)

  return SERVICE_DEFINITIONS.flatMap((definition) => {
    const schedule = {
      miles: parsePositiveNumber(vehicle[definition.fields.miles]),
      months: parsePositiveNumber(vehicle[definition.fields.months]),
    }

    if (!schedule.miles && !schedule.months) {
      return []
    }

    const matchingRecords = vehicleRecords.filter((record) =>
      matchesServiceType(record.serviceType, definition.keywords),
    )
    const lastServiceRecord = getLatestMaintenanceRecord(matchingRecords)

    if (!lastServiceRecord) {
      return []
    }

    const alert = buildServiceAlert({
      definition,
      lastServiceRecord,
      now,
      schedule,
      vehicleMileage: parsePositiveNumber(vehicle.mileage),
      vehicleId: vehicle.id,
      vehicleLabel: `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim(),
    })

    return alert ? [alert] : []
  })
}

export function getFleetAlertSummary(vehicles, maintenanceRecords, now = new Date()) {
  const alerts = vehicles.flatMap((vehicle) => getVehicleServiceAlerts(vehicle, maintenanceRecords, now))
  const overdueAlerts = alerts.filter((alert) => alert.status === 'overdue')
  const upcomingAlerts = alerts.filter((alert) => alert.status === 'upcoming')

  return {
    alerts,
    overdueAlerts,
    upcomingAlerts,
    nextAlert: getMostUrgentAlert(alerts),
  }
}

function buildServiceAlert({
  definition,
  lastServiceRecord,
  now,
  schedule,
  vehicleMileage,
  vehicleId,
  vehicleLabel,
}) {
  const lastMileage = parsePositiveNumber(lastServiceRecord.mileage)
  const lastServiceDate = parseServiceDate(lastServiceRecord.serviceDate)

  const milesRemaining =
    schedule.miles != null && lastMileage != null && vehicleMileage != null
      ? lastMileage + schedule.miles - vehicleMileage
      : null

  const dueDate =
    schedule.months != null && lastServiceDate
      ? addMonths(lastServiceDate, schedule.months)
      : null

  const daysRemaining = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / DAY_MS) : null

  const isOverdue =
    (milesRemaining != null && milesRemaining <= 0) ||
    (daysRemaining != null && daysRemaining <= 0)

  const isUpcoming =
    !isOverdue &&
    ((milesRemaining != null && milesRemaining <= UPCOMING_MILES_BUFFER) ||
      (daysRemaining != null && daysRemaining <= UPCOMING_DAYS_BUFFER))

  if (!isOverdue && !isUpcoming) {
    return null
  }

  return {
    id: `${vehicleId}-${definition.key}`,
    vehicleId,
    vehicleLabel,
    serviceKey: definition.key,
    serviceLabel: definition.label,
    status: isOverdue ? 'overdue' : 'upcoming',
    milesRemaining,
    daysRemaining,
    dueDate,
    lastServiceRecord,
    message: composeAlertMessage({
      milesRemaining,
      daysRemaining,
      status: isOverdue ? 'overdue' : 'upcoming',
    }),
  }
}

function composeAlertMessage({ milesRemaining, daysRemaining, status }) {
  const parts = []

  if (milesRemaining != null) {
    if (status === 'overdue') {
      parts.push(`${formatQuantity(Math.abs(milesRemaining))} miles overdue`)
    } else {
      parts.push(`${formatQuantity(milesRemaining)} miles left`)
    }
  }

  if (daysRemaining != null) {
    if (status === 'overdue') {
      parts.push(`${Math.abs(daysRemaining)} days overdue`)
    } else {
      parts.push(`${daysRemaining} days left`)
    }
  }

  if (parts.length === 0) {
    return status === 'overdue' ? 'Service is overdue.' : 'Service is coming soon.'
  }

  if (parts.length === 1) {
    return parts[0]
  }

  return parts.join(' or ')
}

function getMostUrgentAlert(alerts) {
  if (alerts.length === 0) {
    return null
  }

  return [...alerts].sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === 'overdue' ? -1 : 1
    }

    const leftScore = getAlertScore(left)
    const rightScore = getAlertScore(right)

    return leftScore - rightScore
  })[0]
}

function getAlertScore(alert) {
  if (alert.status === 'overdue') {
    return Math.min(
      alert.milesRemaining != null ? Math.abs(alert.milesRemaining) : Number.POSITIVE_INFINITY,
      alert.daysRemaining != null ? Math.abs(alert.daysRemaining) : Number.POSITIVE_INFINITY,
    )
  }

  return Math.min(
    alert.milesRemaining != null ? alert.milesRemaining : Number.POSITIVE_INFINITY,
    alert.daysRemaining != null ? alert.daysRemaining : Number.POSITIVE_INFINITY,
  )
}

function matchesServiceType(serviceType, keywords) {
  const value = String(serviceType || '').toLowerCase()
  return keywords.some((keyword) => value.includes(keyword))
}

function parsePositiveNumber(value) {
  const trimmedValue = String(value ?? '').trim()

  if (!trimmedValue) {
    return null
  }

  if (!/^\d+$/.test(trimmedValue) || Number(trimmedValue) <= 0) {
    return null
  }

  return Number(trimmedValue)
}

function parseServiceDate(value) {
  if (!value) {
    return null
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate
}

function addMonths(date, months) {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + months)
  return nextDate
}

function formatQuantity(value) {
  return new Intl.NumberFormat('en-US').format(value)
}
