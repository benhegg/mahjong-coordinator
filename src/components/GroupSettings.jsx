import { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGroup } from '../hooks/useGroups'
import { useGroupAdmin } from '../hooks/useGroupAdmin'
import { useToast } from './common/Toast'
import {
  getBrowserTimezone,
  formatTimezone,
  COMMON_TIMEZONES,
  FREQUENCY_OPTIONS,
  DAY_NAMES,
  formatGameDays
} from '../utils/groupUtils'
import { formatTime } from '../utils/formatters'
import { PageHeader, Card, ErrorMessage, Button, LoadingState, Spinner } from './common'

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
 * Member row component
 */
const MemberRow = memo(({ member, isCurrentUser, onRemove, removing }) => {
  const joinedDate = member.joinedAt?.toDate?.() || new Date()

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
          {member.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">
              {member.name || 'Unknown'}
              {isCurrentUser && ' (You)'}
            </span>
            {member.isAdmin && (
              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-semibold">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Joined {joinedDate.toLocaleDateString()}
          </p>
        </div>
      </div>
      {!member.isAdmin && !isCurrentUser && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(member.id)}
          disabled={removing}
          className="text-red-600 hover:bg-red-50"
        >
          {removing ? <Spinner size="w-4 h-4" /> : 'Remove'}
        </Button>
      )}
    </div>
  )
})

MemberRow.displayName = 'MemberRow'

/**
 * Confirmation Modal
 */
const ConfirmModal = memo(({ title, message, confirmText, onConfirm, onCancel, danger, requireType }) => {
  const [typed, setTyped] = useState('')
  const canConfirm = !requireType || typed === requireType

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>

        {requireType && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type "{requireType}" to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none min-h-[44px]"
              placeholder={requireType}
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={!canConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  )
})

ConfirmModal.displayName = 'ConfirmModal'

/**
 * GroupSettings - Admin settings page for managing a group
 */
const GroupSettings = () => {
  const navigate = useNavigate()
  const { id: groupId } = useParams()
  const { group, members, loading, isAdmin } = useGroup(groupId)
  const { updateGroupSettings, regenerateInviteCode, removeMember, deleteGroup } = useGroupAdmin()
  const toast = useToast()

  // Form state
  const [name, setName] = useState('')
  const [gameDays, setGameDays] = useState([])
  const [time, setTime] = useState('')
  const [timezone, setTimezone] = useState('')
  const [frequency, setFrequency] = useState('')

  // UI state
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [removingMember, setRemovingMember] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  // Modal state
  const [showRegenerateModal, setShowRegenerateModal] = useState(false)
  const [showRemoveModal, setShowRemoveModal] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Initialize form with group data
  useEffect(() => {
    if (group) {
      setName(group.group_name || '')
      setGameDays(group.game_days || [group.day_of_week] || [])
      setTime(group.time || '19:00')
      setTimezone(group.timezone || getBrowserTimezone())
      setFrequency(group.frequency || 'weekly')
    }
  }, [group])

  // Redirect if not admin
  useEffect(() => {
    if (!loading && group && !isAdmin) {
      toast.error('Only admins can access settings')
      navigate(`/group/${groupId}`, { replace: true })
    }
  }, [loading, group, isAdmin, navigate, groupId, toast])

  // Invite link
  const inviteLink = useMemo(() => {
    if (!group?.invite_code) return ''
    return `${window.location.origin}/join/${group.invite_code}`
  }, [group?.invite_code])

  // Handle day selection
  const handleDayToggle = useCallback((day) => {
    setGameDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day)
      }
      return [...prev, day].sort((a, b) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b))
    })
  }, [])

  // Save settings
  const handleSaveSettings = useCallback(async () => {
    if (!name.trim()) {
      setError('Group name is required')
      return
    }

    if (gameDays.length === 0) {
      setError('Select at least one game day')
      return
    }

    setSaving(true)
    setError('')

    const result = await updateGroupSettings(groupId, {
      group_name: name.trim(),
      game_days: gameDays,
      time,
      timezone,
      frequency
    })

    if (result.success) {
      toast.success('Settings saved!')
    } else {
      setError(result.error)
    }

    setSaving(false)
  }, [name, gameDays, time, timezone, frequency, groupId, updateGroupSettings, toast])

  // Copy invite link
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Link copied!')
    } catch {
      toast.error('Failed to copy')
    }
  }, [inviteLink, toast])

  // Regenerate invite code
  const handleRegenerateCode = useCallback(async () => {
    setRegenerating(true)
    setShowRegenerateModal(false)

    const result = await regenerateInviteCode(groupId)

    if (result.success) {
      toast.success('New invite link generated!')
    } else {
      toast.error(result.error)
    }

    setRegenerating(false)
  }, [groupId, regenerateInviteCode, toast])

  // Remove member
  const handleRemoveMember = useCallback(async (memberId) => {
    setRemovingMember(memberId)
    setShowRemoveModal(null)

    const result = await removeMember(groupId, memberId)

    if (result.success) {
      toast.success('Member removed')
    } else {
      toast.error(result.error)
    }

    setRemovingMember(null)
  }, [groupId, removeMember, toast])

  // Delete group
  const handleDeleteGroup = useCallback(async () => {
    setDeleting(true)
    setShowDeleteModal(false)

    const result = await deleteGroup(groupId)

    if (result.success) {
      toast.success('Group deleted')
      navigate('/welcome', { replace: true })
    } else {
      toast.error(result.error)
      setDeleting(false)
    }
  }, [groupId, deleteGroup, toast, navigate])

  // Get member to remove for modal
  const memberToRemove = useMemo(() => {
    return members.find(m => m.id === showRemoveModal)
  }, [members, showRemoveModal])

  if (loading) {
    return <LoadingState message="Loading settings..." />
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-4">
        <Card className="text-center max-w-md">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Group Not Found</h2>
          <Button onClick={() => navigate('/my-groups')}>Go Back</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/group/${groupId}`)}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-1 min-h-[44px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-semibold">
              Admin
            </span>
          </div>
          <PageHeader
            emoji="⚙️"
            title="Group Settings"
            subtitle={group.group_name}
          />
        </Card>

        {/* Group Info */}
        <Card>
          <h3 className="font-bold text-lg text-gray-800 mb-4">Group Info</h3>

          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} onDismiss={() => setError('')} />
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none min-h-[44px]"
                disabled={saving}
              />
            </div>

            {/* Game Days */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Game Days
              </label>
              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map(day => (
                  <DayCheckbox
                    key={day}
                    day={day}
                    checked={gameDays.includes(day)}
                    onChange={handleDayToggle}
                    disabled={saving}
                  />
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Game Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none min-h-[44px]"
                disabled={saving}
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none min-h-[44px] bg-white"
                disabled={saving}
              >
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{formatTimezone(tz)}</option>
                ))}
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none min-h-[44px] bg-white"
                disabled={saving}
              >
                {FREQUENCY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <Button onClick={handleSaveSettings} loading={saving} fullWidth>
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Invite Management */}
        <Card>
          <h3 className="font-bold text-lg text-gray-800 mb-4">Invite Link</h3>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-sm truncate min-h-[44px]"
              onClick={(e) => e.target.select()}
            />
            <Button onClick={handleCopyLink}>Copy</Button>
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowRegenerateModal(true)}
            loading={regenerating}
          >
            Regenerate Link
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Old links will stop working after regenerating
          </p>
        </Card>

        {/* Member Management */}
        <Card>
          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Members ({members.length})
          </h3>

          <div className="divide-y divide-gray-100">
            {members.map(member => (
              <MemberRow
                key={member.id}
                member={member}
                isCurrentUser={member.id === group.admin_id}
                onRemove={(id) => setShowRemoveModal(id)}
                removing={removingMember === member.id}
              />
            ))}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-2 border-red-200">
          <h3 className="font-bold text-lg text-red-600 mb-4">Danger Zone</h3>
          <p className="text-sm text-gray-600 mb-4">
            Deleting your group will remove all games and members. This cannot be undone.
          </p>
          <Button
            variant="danger"
            fullWidth
            onClick={() => setShowDeleteModal(true)}
            loading={deleting}
          >
            Delete Group
          </Button>
        </Card>
      </div>

      {/* Modals */}
      {showRegenerateModal && (
        <ConfirmModal
          title="Regenerate Invite Link?"
          message="The old invite link will stop working immediately. Anyone with the old link won't be able to join."
          confirmText="Regenerate"
          onConfirm={handleRegenerateCode}
          onCancel={() => setShowRegenerateModal(false)}
        />
      )}

      {showRemoveModal && memberToRemove && (
        <ConfirmModal
          title="Remove Member?"
          message={`Remove ${memberToRemove.name} from the group? They can rejoin with an invite link.`}
          confirmText="Remove"
          onConfirm={() => handleRemoveMember(showRemoveModal)}
          onCancel={() => setShowRemoveModal(null)}
          danger
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          title="Delete Group?"
          message="This will delete all games and remove all members. This action cannot be undone."
          confirmText="Delete Group"
          onConfirm={handleDeleteGroup}
          onCancel={() => setShowDeleteModal(false)}
          danger
          requireType="DELETE"
        />
      )}
    </div>
  )
}

export default memo(GroupSettings)
