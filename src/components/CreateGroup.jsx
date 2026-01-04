import { useState, useCallback, useMemo, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserGroups } from '../hooks/useGroups'
import { useToast } from './common/Toast'
import {
  getBrowserTimezone,
  formatTimezone,
  COMMON_TIMEZONES,
  FREQUENCY_OPTIONS,
  DAY_NAMES
} from '../utils/groupUtils'
import { PageHeader, Card, ErrorMessage, Button, Spinner } from './common'

/**
 * Day selection checkbox component
 */
const DayCheckbox = memo(({ day, checked, onChange, disabled }) => (
  <label
    className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all min-h-[44px] ${
      checked
        ? 'border-pink-500 bg-pink-50 text-pink-700 font-semibold'
        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={() => onChange(day)}
      disabled={disabled}
      className="sr-only"
    />
    <span className="text-sm">{day.slice(0, 3)}</span>
  </label>
))

DayCheckbox.displayName = 'DayCheckbox'

/**
 * CreateGroup - Form for creating a new mahjong group
 */
const CreateGroup = () => {
  const navigate = useNavigate()
  const { createGroup } = useUserGroups()
  const toast = useToast()

  // Form state
  const [name, setName] = useState('')
  const [gameDays, setGameDays] = useState([])
  const [time, setTime] = useState('19:00')
  const [timezone, setTimezone] = useState(getBrowserTimezone())
  const [frequency, setFrequency] = useState('weekly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Detected timezone display
  const detectedTimezone = useMemo(() => getBrowserTimezone(), [])

  // Handle day selection
  const handleDayToggle = useCallback((day) => {
    setGameDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day)
      }
      return [...prev, day].sort((a, b) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b))
    })
    if (error) setError('')
  }, [error])

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    // Validation
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Please enter a group name')
      return
    }

    if (trimmedName.length < 3) {
      setError('Group name must be at least 3 characters')
      return
    }

    if (gameDays.length === 0) {
      setError('Please select at least one game day')
      return
    }

    if (!time) {
      setError('Please select a game time')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await createGroup({
        name: trimmedName,
        gameDays,
        time,
        timezone,
        frequency
      })

      if (result.success) {
        toast.success('Group created successfully!')
        navigate(`/group/${result.groupId}/created`, {
          state: { inviteCode: result.inviteCode }
        })
      } else {
        setError(result.error || 'Failed to create group')
      }
    } catch (err) {
      console.error('Error creating group:', err)
      setError('Failed to create group. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [name, gameDays, time, timezone, frequency, createGroup, navigate, toast])

  const handleNameChange = useCallback((e) => {
    setName(e.target.value)
    if (error) setError('')
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <Card>
          <PageHeader
            emoji="🀄"
            title="Create a Group"
            subtitle="Set up your mahjong game schedule"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <ErrorMessage message={error} onDismiss={() => setError('')} />
            )}

            {/* Group Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Group Name <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={handleNameChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition-colors min-h-[44px]"
                placeholder="Thursday Night Mahjong"
                maxLength={50}
                disabled={loading}
              />
            </div>

            {/* Game Days */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Game Days <span className="text-pink-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select one or more days when your group plays
              </p>
              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map(day => (
                  <DayCheckbox
                    key={day}
                    day={day}
                    checked={gameDays.includes(day)}
                    onChange={handleDayToggle}
                    disabled={loading}
                  />
                ))}
              </div>
              {gameDays.length > 0 && (
                <p className="text-xs text-pink-600 mt-2">
                  Selected: {gameDays.join(', ')}
                </p>
              )}
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-semibold text-gray-700 mb-2">
                Game Time <span className="text-pink-500">*</span>
              </label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition-colors min-h-[44px]"
                disabled={loading}
              />
            </div>

            {/* Timezone */}
            <div>
              <label htmlFor="timezone" className="block text-sm font-semibold text-gray-700 mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition-colors min-h-[44px] bg-white"
                disabled={loading}
              >
                {/* Show detected timezone first if not in common list */}
                {!COMMON_TIMEZONES.includes(detectedTimezone) && (
                  <option value={detectedTimezone}>
                    {formatTimezone(detectedTimezone)} (detected)
                  </option>
                )}
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>
                    {formatTimezone(tz)}
                    {tz === detectedTimezone ? ' (detected)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label htmlFor="frequency" className="block text-sm font-semibold text-gray-700 mb-2">
                Frequency
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition-colors min-h-[44px] bg-white"
                disabled={loading}
              >
                {FREQUENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
            >
              {loading ? 'Creating Group...' : 'Create Group'}
            </Button>

            {/* Cancel */}
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default memo(CreateGroup)
