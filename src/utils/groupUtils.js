/**
 * Group management utilities - invite codes, game generation, timezone handling
 */

/**
 * Generates a random 6-character alphanumeric invite code (uppercase)
 * @returns {string} Invite code
 */
export const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars: I, O, 0, 1
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Day name to day number mapping
 */
export const DAY_MAP = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
}

/**
 * Day number to day name mapping
 */
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Gets the browser's timezone
 * @returns {string} Timezone string (e.g., "America/New_York")
 */
export const getBrowserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'America/New_York' // Fallback
  }
}

/**
 * Formats timezone for display
 * @param {string} timezone - IANA timezone string
 * @returns {string} Formatted timezone (e.g., "Eastern Time (ET)")
 */
export const formatTimezone = (timezone) => {
  try {
    const date = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    })
    const parts = formatter.formatToParts(date)
    const tzPart = parts.find(p => p.type === 'timeZoneName')
    return tzPart ? `${timezone.replace(/_/g, ' ')} (${tzPart.value})` : timezone
  } catch {
    return timezone
  }
}

/**
 * Common US timezones for dropdown
 */
export const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu'
]

/**
 * Frequency options for groups
 */
export const FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' }
]

/**
 * Generates upcoming games for a group based on schedule
 * @param {Object} groupInfo - Group info with game_days, time, frequency
 * @param {number} weeksCount - Number of weeks to generate (default 8)
 * @returns {Array} Array of game objects with date, group_id, etc.
 */
export const generateUpcomingGames = (groupInfo, weeksCount = 8) => {
  const gameDays = groupInfo.game_days || [groupInfo.day_of_week || 'Thursday']
  const frequency = groupInfo.frequency || 'weekly'

  // Convert day names to numbers
  const targetDays = gameDays.map(day => DAY_MAP[day] ?? 4).sort((a, b) => a - b)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const games = []
  let currentDate = new Date(today)
  let weekCount = 0
  let lastWeekNumber = -1

  // Generate games for the specified number of weeks
  while (weekCount < weeksCount) {
    const currentWeek = getWeekNumber(currentDate)

    // Check if we've moved to a new week
    if (currentWeek !== lastWeekNumber) {
      lastWeekNumber = currentWeek

      // For biweekly, only generate on even weeks from start
      if (frequency === 'biweekly' && weekCount % 2 !== 0) {
        weekCount++
        currentDate.setDate(currentDate.getDate() + 7)
        continue
      }

      // For monthly, only generate on first occurrence
      if (frequency === 'monthly' && weekCount > 0) {
        // Skip to next month
        const nextMonth = new Date(currentDate)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        nextMonth.setDate(1)
        currentDate = nextMonth
        weekCount++
        continue
      }

      weekCount++
    }

    // Generate games for each target day in this week
    for (const targetDay of targetDays) {
      // Find the next occurrence of this day
      const gameDate = new Date(currentDate)
      const daysUntilTarget = (targetDay - gameDate.getDay() + 7) % 7

      // If target day is today or later this week
      if (daysUntilTarget > 0 || (daysUntilTarget === 0 && gameDate >= today)) {
        gameDate.setDate(gameDate.getDate() + daysUntilTarget)
      } else {
        // Move to next week for this day
        gameDate.setDate(gameDate.getDate() + daysUntilTarget + 7)
      }

      // Only add if this date is in the future
      if (gameDate >= today) {
        const gameId = `${groupInfo.id}_${gameDate.toISOString().split('T')[0]}`

        // Check if we already have this game
        if (!games.find(g => g.id === gameId)) {
          games.push({
            id: gameId,
            group_id: groupInfo.id,
            date: gameDate,
            time: groupInfo.time,
            host: null,
            responses: [],
            created_at: new Date().toISOString()
          })
        }
      }
    }

    // Move to next week
    currentDate.setDate(currentDate.getDate() + 7)
  }

  // Sort by date and limit to reasonable number
  return games
    .sort((a, b) => a.date - b.date)
    .slice(0, weeksCount * targetDays.length)
}

/**
 * Gets week number of the year
 * @param {Date} date - Date object
 * @returns {number} Week number
 */
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}

/**
 * Formats game days for display
 * @param {string[]} gameDays - Array of day names
 * @returns {string} Formatted string (e.g., "Tuesdays and Thursdays")
 */
export const formatGameDays = (gameDays) => {
  if (!gameDays || gameDays.length === 0) return ''

  const pluralized = gameDays.map(day => `${day}s`)

  if (pluralized.length === 1) {
    return pluralized[0]
  } else if (pluralized.length === 2) {
    return `${pluralized[0]} and ${pluralized[1]}`
  } else {
    const last = pluralized.pop()
    return `${pluralized.join(', ')}, and ${last}`
  }
}

/**
 * Formats schedule for display
 * @param {Object} group - Group object
 * @returns {string} Formatted schedule string
 */
export const formatSchedule = (group) => {
  const days = formatGameDays(group.game_days || [group.day_of_week])
  const time = formatTime12(group.time)
  const freq = group.frequency === 'biweekly' ? 'every other week' :
               group.frequency === 'monthly' ? 'monthly' : 'weekly'

  return `${days} at ${time} (${freq})`
}

/**
 * Formats 24h time to 12h format
 */
const formatTime12 = (time24) => {
  if (!time24) return ''
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}
