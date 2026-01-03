/**
 * Formatting utilities for dates, times, and other display values
 */

/**
 * Converts 24-hour time string to 12-hour format with AM/PM
 * @param {string} time24 - Time in 24-hour format (e.g., "19:00")
 * @returns {string} Time in 12-hour format (e.g., "7:00 PM")
 */
export const formatTime = (time24) => {
  if (!time24 || typeof time24 !== 'string') return ''

  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)

  if (isNaN(hour)) return time24

  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

/**
 * Formats a date object to a short readable format
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date (e.g., "Thu, Jan 15")
 */
export const formatDate = (date) => {
  if (!date || !(date instanceof Date)) return ''

  const options = { weekday: 'short', month: 'short', day: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

/**
 * Formats a date to a full readable format
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date (e.g., "Thursday, January 15, 2025")
 */
export const formatDateFull = (date) => {
  if (!date || !(date instanceof Date)) return ''

  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

/**
 * Gets month and year header string
 * @param {Date} date - Date object
 * @returns {string} Month and year (e.g., "JANUARY 2025")
 */
export const formatMonthYear = (date) => {
  if (!date || !(date instanceof Date)) return ''

  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
}

/**
 * Checks if a date is within the next 7 days
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is this week
 */
export const isThisWeek = (date) => {
  if (!date || !(date instanceof Date)) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)

  return checkDate >= today && checkDate <= nextWeek
}

/**
 * Checks if a date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date || !(date instanceof Date)) return false

  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Truncates a string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export const truncate = (str, maxLength = 50) => {
  if (!str || typeof str !== 'string') return ''
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Gets initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?'

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Generates player count message for a game
 * @param {Array} responses - Array of player responses
 * @returns {Object} Message and alert strings
 */
export const getPlayerCounts = (responses = []) => {
  const going = responses.filter(r => r.status === 'going').length
  const maybe = responses.filter(r => r.status === 'maybe').length

  let message = `${going} going`
  if (maybe > 0) {
    message += ` / ${maybe} maybe`
  }

  let alert = null
  if (going >= 4 && going < 5) {
    alert = { type: 'success', text: 'Table 1 ready!' }
  } else if (going >= 5 && going <= 7) {
    const needed = 8 - going
    alert = { type: 'warning', text: `Need ${needed} more for Table 2!` }
  } else if (going >= 8) {
    alert = { type: 'success', text: 'Table 1 & 2 full!' }
  } else if (going < 4) {
    const needed = 4 - going
    alert = { type: 'info', text: `Need ${needed} more to play` }
  }

  return { message, alert, going, maybe }
}
