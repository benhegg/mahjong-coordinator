import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from './common/PageHeader'
import Card from './common/Card'

const Welcome = () => {
  const navigate = useNavigate()
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleJoinGroup = async () => {
    if (!inviteLink.trim()) {
      setError('Please enter an invite link')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Extract invite code from URL or use as-is if it's just a code
      let inviteCode = inviteLink.trim()

      // If it's a full URL, extract the code
      if (inviteCode.includes('/')) {
        const parts = inviteCode.split('/')
        inviteCode = parts[parts.length - 1]
      }

      if (!inviteCode || inviteCode.length < 6) {
        setError('Invalid invite code')
        setLoading(false)
        return
      }

      // TODO: Look up group by invite code in Firestore and join
      // For now, navigate to a mock group
      navigate(`/group/${inviteCode}`)
    } catch (err) {
      console.error('Error joining group:', err)
      setError('Failed to join group. Please check the invite link.')
    } finally {
      setLoading(false)
    }
  }

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
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🎯</span>
              <span>Join a Group</span>
            </button>

            <button
              onClick={() => navigate('/create-group')}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-3"
            >
              <span className="text-2xl">➕</span>
              <span>Create New Group</span>
            </button>
          </div>
        </Card>

        {/* Join Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Join a Group</h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
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
                    onChange={(e) => setInviteLink(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                    placeholder="Paste invite link or enter code"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowJoinModal(false)
                      setInviteLink('')
                      setError('')
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinGroup}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default Welcome
