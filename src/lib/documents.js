import { formatDateValue } from './preferences.js'

const STORAGE_KEY = 'auto-tracker.v0.0.5.documents'
const RECENT_WINDOW_DAYS = 30
const DAY_MS = 24 * 60 * 60 * 1000

const DEFAULT_DOCUMENT = {
  documentType: '',
  title: '',
  issueDate: '',
  expirationDate: '',
  fileName: '',
  notes: '',
}

export function createEmptyDocument() {
  return { ...DEFAULT_DOCUMENT }
}

export function createDocumentId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `document-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function getStoredDocuments() {
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
      .filter((document) => document && typeof document === 'object')
      .map((document) => ({
        id: String(document.id ?? createDocumentId()),
        vehicleId: String(document.vehicleId ?? ''),
        ...DEFAULT_DOCUMENT,
        ...document,
      }))
  } catch {
    return []
  }
}

export function saveDocuments(documents) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
}

export function validateDocument(document) {
  const errors = {}

  if (!document.documentType.trim()) {
    errors.documentType = 'Enter the document type.'
  }

  if (!document.title.trim()) {
    errors.title = 'Enter a document title.'
  }

  if (!document.fileName.trim()) {
    errors.fileName = 'Enter a file name or reference.'
  }

  const issueDate = parseDate(document.issueDate)
  const expirationDate = parseDate(document.expirationDate)

  if (document.issueDate.trim() && !issueDate) {
    errors.issueDate = 'Choose a valid issue date.'
  }

  if (document.expirationDate.trim() && !expirationDate) {
    errors.expirationDate = 'Choose a valid expiration date.'
  }

  if (issueDate && expirationDate && expirationDate < issueDate) {
    errors.expirationDate = 'Expiration date must be after the issue date.'
  }

  return errors
}

export function formatDocumentDate(value, dateFormat = 'mdy') {
  return formatDateValue(value, dateFormat)
}

export function getVehicleDocumentSummary(vehicle, documents, now = new Date(), reminderWindowDays = 30) {
  const vehicleDocuments = documents.filter((document) => document.vehicleId === vehicle.id)
  const expiringDocuments = vehicleDocuments.filter((document) =>
    isExpiring(document.expirationDate, now, reminderWindowDays),
  )
  const recentDocuments = vehicleDocuments.filter((document) =>
    isRecent(document.issueDate, now),
  )

  return {
    documents: sortDocumentsDescending(vehicleDocuments),
    documentCount: vehicleDocuments.length,
    expiringCount: expiringDocuments.length,
    recentCount: recentDocuments.length,
  }
}

export function getFleetDocumentSummary(vehicles, documents, now = new Date(), reminderWindowDays = 30) {
  const totalDocumentCount = documents.length
  const expiringDocuments = documents.filter((document) =>
    isExpiring(document.expirationDate, now, reminderWindowDays),
  )
  const recentDocuments = documents.filter((document) => isRecent(document.issueDate, now))
  const latestDocument = getLatestDocument(documents)
  const latestDocumentVehicle =
    latestDocument && vehicles.find((vehicle) => vehicle.id === latestDocument.vehicleId)

  return {
    totalDocumentCount,
    expiringDocumentCount: expiringDocuments.length,
    recentDocumentCount: recentDocuments.length,
    expiringDocuments: sortDocumentsByExpiration(expiringDocuments),
    recentDocuments: sortDocumentsDescending(recentDocuments),
    latestDocument,
    latestDocumentVehicle,
  }
}

export function getDocumentStatus(document, now = new Date(), reminderWindowDays = 30) {
  if (!document.expirationDate.trim()) {
    return 'No expiration'
  }

  const expirationDate = parseDate(document.expirationDate)
  if (!expirationDate) {
    return 'Invalid expiration'
  }

  const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / DAY_MS)

  if (daysRemaining < 0) {
    return 'Expired'
  }

  if (daysRemaining <= reminderWindowDays) {
    return 'Expiring soon'
  }

  return 'Active'
}

function getLatestDocument(documents) {
  if (documents.length === 0) {
    return null
  }

  return sortDocumentsDescending(documents)[0]
}

export function sortDocumentsDescending(documents) {
  return [...documents].sort((left, right) => {
    const leftIssueTime = parseDate(left.issueDate)?.getTime() ?? 0
    const rightIssueTime = parseDate(right.issueDate)?.getTime() ?? 0

    if (leftIssueTime !== rightIssueTime) {
      return rightIssueTime - leftIssueTime
    }

    const leftExpirationTime = parseDate(left.expirationDate)?.getTime() ?? 0
    const rightExpirationTime = parseDate(right.expirationDate)?.getTime() ?? 0

    if (leftExpirationTime !== rightExpirationTime) {
      return rightExpirationTime - leftExpirationTime
    }

    return String(right.id).localeCompare(String(left.id))
  })
}

function sortDocumentsByExpiration(documents) {
  return [...documents].sort((left, right) => {
    const leftExpirationTime = parseDate(left.expirationDate)?.getTime() ?? Number.POSITIVE_INFINITY
    const rightExpirationTime =
      parseDate(right.expirationDate)?.getTime() ?? Number.POSITIVE_INFINITY

    if (leftExpirationTime !== rightExpirationTime) {
      return leftExpirationTime - rightExpirationTime
    }

    return String(left.id).localeCompare(String(right.id))
  })
}

function isExpiring(value, now, reminderWindowDays) {
  const parsedDate = parseDate(value)
  if (!parsedDate) {
    return false
  }

  const daysRemaining = Math.ceil((parsedDate.getTime() - now.getTime()) / DAY_MS)
  return daysRemaining <= reminderWindowDays
}

function isRecent(value, now) {
  const parsedDate = parseDate(value)
  if (!parsedDate) {
    return false
  }

  const daysAgo = Math.floor((now.getTime() - parsedDate.getTime()) / DAY_MS)
  return daysAgo >= 0 && daysAgo <= RECENT_WINDOW_DAYS
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
