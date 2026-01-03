import { useState, useCallback, memo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUserGroups } from '../hooks/useGroups'
import { useToast } from './common/Toast'
import { PageHeader, Card, ErrorMessage, Button } from './common'

/**
 * Welcome - Entry point for users without groups
 * Allows joining via invite code or creating a new group
 */
const Welcome = () => {
  const navigate = useNavigate()
  const { code: inviteCodeFromUrl } = useParams()
  const { joinGroup } = useUserGroups()
  const toast = useToast()

  const [showJoinModal, setShowJoinModal] = useState(!!inviteCodeFromUrl)
  const [inviteLink, setInviteLink] = useState(inviteCodeFromUrl || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleOpenJoinModal = useCallback(() => {
    setShowJoinModal(true)
    setError('')
  }, [])

  const handleCloseJoinModal = useCallback(() => {
    setShowJoinModal(false)
    setInviteLink('')
    setError('')
  }, [])

  const handleInviteLinkChange = useCallback((e) => {
    setInviteLink(e.target.value)
    if (error) setError('')
  }, [error])

  const handleJoinGroup = useCallback(async () => {
    const trimmedLink = inviteLink.trim()

    if (!trimmedLink) {
      setError('Please enter an invite link or code')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Extract invite code from URL or use as-is if it's just a code
      let inviteCode = trimmedLink

      // If it's a full URL, extract the code from the path
      if (inviteCode.includes('/')) {
        const parts = inviteCode.split('/')
        inviteCode = parts[parts.length - 1]
      }

      // Remove any query parameters
      inviteCode = inviteCode.split('?')[0]

      if (!inviteCode || inviteCode.length < 4) {
        setError('Invalid invite code. Please check the link and try again.')
        setLoading(false)
        return
      }

      // Try to join the group
      const result = await joinGroup(inviteCode)

      if (result.success) {
        toast.success('Successfully joined the group!')
        navigate(`/group/${inviteCode}`, { replace: true })
      } else {
        setError(result.error || 'Failed to join group. Please check the invite link.')
      }
    } catch (err) {
      console.error('Error joining group:', err)
      setError('Failed to join group. Please check the invite link and try again.')
    } finally {
      setLoading(false)
    }
  }, [inviteLink, joinGroup, navigate, toast])

  const handleCreateGroup = useCallback(() => {
    navigate('/create-group')
  }, [navigate])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      handleJoinGroup()
    }
  }, [handleJoinGroup, loading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <PageHeader
            emoji="🀄"
            title="Welcome!"
            subtitle="What would you like to do?"
          />

          <div className="space-y-4">
            <Button
              onClick={handleOpenJoinModal}
              fullWidth
              size="lg"
            >
              <span className="text-2xl">🎯</span>
              <span>Join a Group</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleCreateGroup}
              fullWidth
              size="lg"
            >
              <span className="text-2xl">➕</span>
              <span>Create New Group</span>
            </Button>
          </div>
        </Card>

        {/* Join Modal */}
        {showJoinModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseJoinModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-modal-title"
          >
            <div onClick={(e) => e.stopPropagation()}>
              <Card className="w-full max-w-md">
                <h2 id="join-modal-title" className="text-xl font-bold text-gray-800 mb-4">
                  Join a Group
                </h2>

                {error && (
                  <div className="mb-4">
                    <ErrorMessage message={error} onDismiss={() => setError('')} />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="inviteLink" className="block text-sm font-semibold text-gray-700 mb-2">
                      Invite Link or Code
                    </label>
                    <input
                      type="text"
                      id="inviteLink"
                      value={inviteLink}
                      onChange={handleInviteLinkChange}
                      onKeyDown={handleKeyDown}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition-colors min-h-[44px]"
                      placeholder="Paste invite link or enter code"
                      autoFocus
                      autoComplete="off"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Ask your group organizer for the invite link
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={handleCloseJoinModal}
                      disabled={loading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleJoinGroup}
                      loading={loading}
                      className="flex-1"
                    >
                      {loading ? 'Joining...' : 'Join'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(Welcome)
