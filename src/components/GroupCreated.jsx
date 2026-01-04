import { useState, useCallback, useMemo, memo, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useGroup } from '../hooks/useGroups'
import { useToast } from './common/Toast'
import { formatGameDays } from '../utils/groupUtils'
import { formatTime } from '../utils/formatters'
import { Card, Button, LoadingState } from './common'

/**
 * GroupCreated - Success screen after creating a group
 * Shows group details and share options
 */
const GroupCreated = () => {
  const navigate = useNavigate()
  const { id: groupId } = useParams()
  const location = useLocation()
  const { group, loading } = useGroup(groupId)
  const toast = useToast()

  const [copying, setCopying] = useState(false)

  // Get invite code from navigation state or group data
  const inviteCode = location.state?.inviteCode || group?.invite_code

  // Generate invite link
  const inviteLink = useMemo(() => {
    if (!inviteCode) return ''
    return `${window.location.origin}/join/${inviteCode}`
  }, [inviteCode])

  // Copy link to clipboard
  const handleCopyLink = useCallback(async () => {
    if (!inviteLink) return

    setCopying(true)
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Invite link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    } finally {
      setCopying(false)
    }
  }, [inviteLink, toast])

  // Share via native share API
  const handleShare = useCallback(async (method) => {
    if (!group) return

    const shareData = {
      title: `Join ${group.group_name}`,
      text: `Join our mahjong group: ${group.group_name}`,
      url: inviteLink
    }

    if (method === 'native' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Failed to share')
        }
      }
    } else if (method === 'text') {
      // SMS link
      const body = encodeURIComponent(`Join our mahjong group "${group.group_name}"! ${inviteLink}`)
      window.open(`sms:?body=${body}`, '_blank')
    } else if (method === 'email') {
      // Email link
      const subject = encodeURIComponent(`Join ${group.group_name} on Mahjong Night`)
      const body = encodeURIComponent(
        `Hey!\n\nI'm inviting you to join our mahjong group "${group.group_name}" on Mahjong Night.\n\nClick here to join: ${inviteLink}\n\nSee you at the table!`
      )
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
    }
  }, [group, inviteLink, toast])

  // Format schedule for display
  const scheduleText = useMemo(() => {
    if (!group) return ''

    const days = formatGameDays(group.game_days || [group.day_of_week])
    const time = formatTime(group.time)
    const freq = group.frequency === 'biweekly' ? 'every other week' :
                 group.frequency === 'monthly' ? 'monthly' : 'every week'

    return `Games ${freq} on ${days} at ${time}`
  }, [group])

  if (loading) {
    return <LoadingState message="Loading your group..." />
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-4">
        <Card className="text-center max-w-md">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Group Not Found</h2>
          <p className="text-gray-600 mb-6">
            The group you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/welcome')}>
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <Card>
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-bounce-in">🀄</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Your group is ready!
            </h1>
            <p className="text-gray-600">
              Invite your friends to start playing
            </p>
          </div>

          {/* Group Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="font-bold text-lg text-gray-800 mb-2">
              {group.group_name}
            </h2>
            <p className="text-sm text-gray-600">
              {scheduleText}
            </p>
            {group.timezone && (
              <p className="text-xs text-gray-500 mt-1">
                {group.timezone.replace(/_/g, ' ')}
              </p>
            )}
          </div>

          {/* Invite Link */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Invite Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm truncate min-h-[44px]"
                onClick={(e) => e.target.select()}
              />
              <Button
                onClick={handleCopyLink}
                loading={copying}
                variant="primary"
              >
                {copying ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with your friends to invite them
            </p>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3 mb-6">
            {navigator.share && (
              <Button
                variant="outline"
                fullWidth
                onClick={() => handleShare('native')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </Button>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleShare('text')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Text
              </Button>
              <Button
                variant="outline"
                onClick={() => handleShare('email')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </Button>
            </div>
          </div>

          {/* Go to Group Button */}
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate(`/group/${groupId}`)}
          >
            Go to My Group
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default memo(GroupCreated)
