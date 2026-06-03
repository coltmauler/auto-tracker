import { formatMoney } from './maintenance.js'

const STORAGE_KEY = 'auto-tracker.v0.0.6.expenses'
const EXPENSE_RECENT_WINDOW_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

const DEFAULT_EXPENSE = {
  date: '',
  category: '',
  amount: '',
  vendor: '',
  notes: '',
}

export const EXPENSE_CATEGORIES = [
  'Repairs',
  'Insurance',
  'Registration',
  'Parking',
  'Tolls',
  'Supplies',
  'Cleaning',
  'Other',
]

export function createEmptyExpense() {
  return { ...DEFAULT_EXPENSE }
}

export function createExpenseId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getStoredExpenses() {
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
      .filter((expense) => expense && typeof expense === 'object')
      .map((expense) => ({
        id: String(expense.id ?? createExpenseId()),
        vehicleId: String(expense.vehicleId ?? ''),
        ...DEFAULT_EXPENSE,
        ...expense,
      }))
  } catch {
    return []
  }
}

export function saveExpenses(expenses) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

export function validateExpense(expense) {
  const errors = {}
  const amountValue = expense.amount.trim()

  if (!expense.date.trim()) {
    errors.date = 'Choose the expense date.'
  }

  if (!expense.category.trim()) {
    errors.category = 'Choose a category.'
  }

  if (!amountValue) {
    errors.amount = 'Enter the expense amount.'
  } else if (!isPositiveDecimal(amountValue)) {
    errors.amount = 'Amount must be a positive number.'
  }

  return errors
}

export function formatExpenseDate(value, dateFormat = 'mdy') {
  if (!value) {
    return 'Not set'
  }

  const parsedDate = parseDate(value)
  if (!parsedDate) {
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

export function sortExpensesDescending(expenses) {
  return [...expenses].sort((left, right) => {
    const leftTime = parseDate(left.date)?.getTime() ?? 0
    const rightTime = parseDate(right.date)?.getTime() ?? 0

    if (leftTime !== rightTime) {
      return rightTime - leftTime
    }

    return String(right.id).localeCompare(String(left.id))
  })
}

export function getLatestExpense(expenses) {
  if (expenses.length === 0) {
    return null
  }

  return sortExpensesDescending(expenses)[0]
}

export function getFleetExpenseSummary(vehicles, expenses, now = new Date()) {
  const totalExpenseCount = expenses.length
  const lifetimeExpenseSpend = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
  const monthlyExpenseSpend = expenses.reduce((sum, expense) => {
    const parsedDate = parseDate(expense.date)
    if (!parsedDate) {
      return sum
    }

    if (parsedDate.getFullYear() === now.getFullYear() && parsedDate.getMonth() === now.getMonth()) {
      return sum + (Number(expense.amount) || 0)
    }

    return sum
  }, 0)

  const latestExpense = getLatestExpense(expenses)
  const latestExpenseVehicle =
    latestExpense && vehicles.find((vehicle) => vehicle.id === latestExpense.vehicleId)

  return {
    totalExpenseCount,
    lifetimeExpenseSpend,
    monthlyExpenseSpend,
    latestExpense,
    latestExpenseVehicle,
  }
}

export function getVehicleExpenseStats(vehicle, expenses) {
  const vehicleExpenses = expenses.filter((expense) => expense.vehicleId === vehicle.id)
  const totalExpenseSpend = vehicleExpenses.reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0,
  )
  const monthlyExpenseSpend = vehicleExpenses.reduce((sum, expense) => {
    const parsedDate = parseDate(expense.date)
    if (!parsedDate) {
      return sum
    }

    const now = new Date()
    if (parsedDate.getFullYear() === now.getFullYear() && parsedDate.getMonth() === now.getMonth()) {
      return sum + (Number(expense.amount) || 0)
    }

    return sum
  }, 0)
  const latestExpense = getLatestExpense(vehicleExpenses)
  const vehicleMileage = Number(vehicle.mileage) || 0
  const costPerMile = vehicleMileage > 0 ? totalExpenseSpend / vehicleMileage : null

  return {
    expenseRecordCount: vehicleExpenses.length,
    totalExpenseSpend,
    monthlyExpenseSpend,
    costPerMile,
    latestExpense,
  }
}

export function getVehicleOwnershipStats({
  fuelStats,
  maintenanceRecords,
  expenses,
  vehicle,
}) {
  const maintenanceTotal = maintenanceRecords.reduce(
    (sum, record) => sum + (Number(record.cost) || 0),
    0,
  )
  const fuelTotal = fuelStats.lifetimeFuelSpend || 0
  const expenseTotal = expenses.reduce((sum, record) => sum + (Number(record.amount) || 0), 0)
  const ownershipTotal = maintenanceTotal + fuelTotal + expenseTotal
  const currentMileage = Number(vehicle.mileage) || 0
  const costPerMile = currentMileage > 0 ? ownershipTotal / currentMileage : null

  return {
    maintenanceTotal,
    fuelTotal,
    expenseTotal,
    ownershipTotal,
    costPerMile,
  }
}

export function getVehicleExpenseAlerts(expenses, now = new Date()) {
  return expenses.filter((expense) => isRecent(expense.date, now))
}

function isRecent(value, now) {
  const parsedDate = parseDate(value)
  if (!parsedDate) {
    return false
  }

  const daysAgo = Math.floor((now.getTime() - parsedDate.getTime()) / DAY_MS)
  return daysAgo >= 0 && daysAgo <= EXPENSE_RECENT_WINDOW_DAYS
}

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

function isPositiveDecimal(value) {
  return /^\d+(\.\d+)?$/.test(value) && Number(value) > 0
}

export { formatMoney }
