import { formatMoney } from './maintenance.js'
import { formatFuelMileage, formatFuelNumber, getLatestFuelRecord } from './fuel.js'
import { formatExpenseDate } from './expenses.js'
import {
  formatDocumentDate,
  getDocumentStatus,
  sortDocumentsDescending,
} from './documents.js'

function parseDate(value) {
  if (!value) {
    return null
  }

  const parsedDate = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate
}

function getMonthKey(value) {
  const parsedDate = parseDate(value)
  if (!parsedDate) {
    return null
  }

  return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
}

function getMonthLabel(monthKey) {
  if (!monthKey) {
    return 'Unknown'
  }

  const [year, month] = monthKey.split('-')
  const parsedDate = new Date(Number(year), Number(month) - 1, 1)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

function sortMonthKeysDescending(keys) {
  return [...keys].sort((left, right) => right.localeCompare(left))
}

export function buildReportsData({
  documents,
  expenses,
  fuelRecords,
  maintenanceRecords,
  vehicles,
}) {
  const vehicleRows = vehicles.map((vehicle) =>
    buildVehicleSummary(vehicle, {
      documents,
      expenses,
      fuelRecords,
      maintenanceRecords,
    }),
  )

  return {
    vehicleCostSummary: vehicleRows,
    monthlySpending: buildMonthlySpendingReport(expenses, maintenanceRecords, fuelRecords),
    spendingByCategory: buildSpendingByCategoryReport(expenses),
    fuelEfficiency: buildFuelEfficiencyReport(vehicles, fuelRecords),
    maintenanceCosts: buildMaintenanceCostReport(vehicles, maintenanceRecords),
    comparison: buildComparisonReport(vehicleRows),
    documentRows: sortDocumentsDescending(documents),
  }
}

export function buildVehicleSummary(vehicle, { documents, expenses, fuelRecords, maintenanceRecords }) {
  const vehicleMaintenanceRecords = maintenanceRecords.filter((record) => record.vehicleId === vehicle.id)
  const vehicleFuelRecords = fuelRecords.filter((record) => record.vehicleId === vehicle.id)
  const vehicleExpenses = expenses.filter((record) => record.vehicleId === vehicle.id)
  const vehicleDocuments = documents.filter((record) => record.vehicleId === vehicle.id)

  const maintenanceCost = vehicleMaintenanceRecords.reduce(
    (sum, record) => sum + (Number(record.cost) || 0),
    0,
  )
  const fuelCost = vehicleFuelRecords.reduce((sum, record) => sum + (Number(record.cost) || 0), 0)
  const expenseCost = vehicleExpenses.reduce((sum, record) => sum + (Number(record.amount) || 0), 0)
  const ownershipCost = maintenanceCost + fuelCost + expenseCost
  const mileage = Number(vehicle.mileage) || 0
  const costPerMile = mileage > 0 ? ownershipCost / mileage : null
  const fuelStats = getFuelStats(vehicleFuelRecords)
  const latestFuelRecord = getLatestFuelRecord(vehicleFuelRecords)

  return {
    vehicle,
    vehicleLabel: `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim(),
    maintenanceCost,
    fuelCost,
    expenseCost,
    ownershipCost,
    costPerMile,
    maintenanceCount: vehicleMaintenanceRecords.length,
    fuelRecordCount: vehicleFuelRecords.length,
    expenseCount: vehicleExpenses.length,
    documentCount: vehicleDocuments.length,
    averageMpg: fuelStats.averageMpg,
    fuelMiles: fuelStats.miles,
    fuelGallons: fuelStats.gallons,
    latestFuelRecord,
  }
}

export function buildMonthlySpendingReport(expenses, maintenanceRecords, fuelRecords) {
  const bucketMap = new Map()

  function addEntry(dateValue, amountValue, type) {
    const monthKey = getMonthKey(dateValue)
    if (!monthKey) {
      return
    }

    const current = bucketMap.get(monthKey) ?? {
      monthKey,
      label: getMonthLabel(monthKey),
      total: 0,
      maintenance: 0,
      fuel: 0,
      expenses: 0,
    }

    current.total += amountValue
    current[type] += amountValue
    bucketMap.set(monthKey, current)
  }

  maintenanceRecords.forEach((record) => addEntry(record.serviceDate, Number(record.cost) || 0, 'maintenance'))
  fuelRecords.forEach((record) => addEntry(record.fillDate, Number(record.cost) || 0, 'fuel'))
  expenses.forEach((record) => addEntry(record.date, Number(record.amount) || 0, 'expenses'))

  return sortMonthKeysDescending([...bucketMap.keys()]).map((monthKey) => bucketMap.get(monthKey))
}

export function buildSpendingByCategoryReport(expenses) {
  const categoryMap = new Map()

  expenses.forEach((expense) => {
    const category = expense.category || 'Uncategorized'
    const amount = Number(expense.amount) || 0

    const current = categoryMap.get(category) ?? {
      category,
      total: 0,
      count: 0,
    }

    current.total += amount
    current.count += 1
    categoryMap.set(category, current)
  })

  return [...categoryMap.values()].sort((left, right) => right.total - left.total)
}

export function buildFuelEfficiencyReport(vehicles, fuelRecords) {
  return vehicles
    .map((vehicle) => {
      const vehicleFuelRecords = fuelRecords.filter((record) => record.vehicleId === vehicle.id)
      const fuelStats = getFuelStats(vehicleFuelRecords)

      return {
        vehicle,
        vehicleLabel: `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim(),
        averageMpg: fuelStats.averageMpg,
        costPerMile: fuelStats.costPerMile,
        fuelMiles: fuelStats.miles,
        fuelGallons: fuelStats.gallons,
        fuelRecordCount: vehicleFuelRecords.length,
        latestFillDate: getLatestFuelRecord(vehicleFuelRecords)?.fillDate ?? null,
      }
    })
    .filter((row) => row.fuelRecordCount > 0)
    .sort((left, right) => (right.averageMpg ?? 0) - (left.averageMpg ?? 0))
}

export function buildMaintenanceCostReport(vehicles, maintenanceRecords) {
  return vehicles
    .map((vehicle) => {
      const vehicleMaintenanceRecords = maintenanceRecords.filter(
        (record) => record.vehicleId === vehicle.id,
      )
      const totalMaintenanceCost = vehicleMaintenanceRecords.reduce(
        (sum, record) => sum + (Number(record.cost) || 0),
        0,
      )

      return {
        vehicle,
        vehicleLabel: `${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim(),
        maintenanceCount: vehicleMaintenanceRecords.length,
        totalMaintenanceCost,
        lastServiceDate: vehicleMaintenanceRecords.length
          ? vehicleMaintenanceRecords.slice().sort((left, right) => {
              const leftTime = parseDate(left.serviceDate)?.getTime() ?? 0
              const rightTime = parseDate(right.serviceDate)?.getTime() ?? 0

              return rightTime - leftTime
            })[0]?.serviceDate ?? null
          : null,
      }
    })
    .filter((row) => row.maintenanceCount > 0)
    .sort((left, right) => right.totalMaintenanceCost - left.totalMaintenanceCost)
}

export function buildComparisonReport(vehicleRows) {
  return [...vehicleRows]
    .sort((left, right) => right.ownershipCost - left.ownershipCost)
    .map((row, index) => ({
      rank: index + 1,
      ...row,
    }))
}

export function formatReportMoney(value) {
  return formatMoney(value)
}

export function formatReportMileage(value) {
  return formatFuelMileage(value)
}

export function formatReportMpg(value) {
  return formatFuelNumber(value)
}

export function formatReportDate(value) {
  return value ? formatExpenseDate(value) : 'Not set'
}

export function formatReportDocumentDate(value) {
  return formatDocumentDate(value)
}

export function getReportDocumentStatus(document) {
  return getDocumentStatus(document)
}

function getFuelStats(fuelRecords) {
  if (fuelRecords.length < 2) {
    const totalGallons = fuelRecords.reduce((sum, record) => sum + (Number(record.gallons) || 0), 0)
    const totalCost = fuelRecords.reduce((sum, record) => sum + (Number(record.cost) || 0), 0)

    return {
      miles: 0,
      gallons: totalGallons,
      averageMpg: null,
      costPerMile: null,
      fuelCost: totalCost,
    }
  }

  const sorted = [...fuelRecords].sort((left, right) => {
    const leftMileage = Number(left.mileage) || 0
    const rightMileage = Number(right.mileage) || 0
    if (leftMileage !== rightMileage) {
      return leftMileage - rightMileage
    }

    const leftDate = parseDate(left.fillDate)?.getTime() ?? 0
    const rightDate = parseDate(right.fillDate)?.getTime() ?? 0
    return leftDate - rightDate
  })

  const firstMileage = Number(sorted[0].mileage) || 0
  const lastMileage = Number(sorted[sorted.length - 1].mileage) || 0
  const miles = Math.max(lastMileage - firstMileage, 0)
  const gallons = sorted.slice(1).reduce((sum, record) => sum + (Number(record.gallons) || 0), 0)
  const fuelCost = sorted.reduce((sum, record) => sum + (Number(record.cost) || 0), 0)

  return {
    miles,
    gallons,
    averageMpg: miles > 0 && gallons > 0 ? miles / gallons : null,
    costPerMile: miles > 0 ? fuelCost / miles : null,
    fuelCost,
  }
}
