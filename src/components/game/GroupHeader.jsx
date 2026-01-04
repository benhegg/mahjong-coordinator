import { memo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatTime } from '../../utils/formatters'
import { useToast } from '../common/Toast'

/**
 * GroupHeader - Sticky header with group info and share button
 *
 * @param {Object} groupInfo - Group information object
 * @param {number} memberCount - Number of members in the group
 * @param {boolean} isAdmin - Whether current user is the group admin
 */
const GroupHeader = memo(({ groupInfo, memberCount = 0, isAdmin = false }) => {
  const navigate = useNavigate()
  const toast = useToast()
  const [sharing, setSharing] = useState(false)

  const handleShareInvite = useCallback(async () => {
    const inviteCode = groupInfo.inviteCode || groupInfo.invite_code || groupInfo.id
    const inviteLink = `${window.location.origin}/join/${inviteCode}`

    setSharing(true)

    try {
      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: `Join ${groupInfo.name}`,
          text: `Join our mahjong group: ${groupInfo.name}`,
          url: inviteLink
        })
        toast.success('Shared successfully!')
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(inviteLink)
        toast.success('Invite link copied to clipboard!')
      }
    } catch (err) {
      // Share cancelled or clipboard failed
      if (err.name !== 'AbortError') {
        // Try clipboard as fallback
        try {
          await navigator.clipboard.writeText(inviteLink)
          toast.success('Invite link copied to clipboard!')
        } catch {
          toast.error('Could not copy link. Please try again.')
        }
      }
    } finally {
      setSharing(false)
    }
  }, [groupInfo, toast])

  const handleSettingsClick = useCallback(() => {
    navigate(`/group/${groupInfo.id}/settings`)
  }, [navigate, groupInfo.id])

  return (
    <div className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">🀄</span>
            <h1 className="text-xl font-bold text-gray-800 truncate">
              {groupInfo.name || groupInfo.group_name}
            </h1>
          </div>
          {isAdmin && (
            <button
              onClick={handleSettingsClick}
              className="text-gray-600 hover:text-gray-800 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
              aria-label="Group settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
          <span>{groupInfo.dayOfWeek || groupInfo.day_of_week}s at {formatTime(groupInfo.time)}</span>
          {memberCount > 0 && (
            <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-700 font-medium">
              👥 {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          )}
        </div>
        <button
          onClick={handleShareInvite}
          disabled={sharing}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 flex items-center justify-center gap-2 min-h-[44px] disabled:opacity-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {sharing ? 'Sharing...' : 'Share Invite'}
        </button>
      </div>
    </div>
  )
})

GroupHeader.displayName = 'GroupHeader'

export default GroupHeader
