import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { formatTime } from '../utils/inviteCode'

const GroupCreated = () => {
  const { groupId, inviteCode } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId))
        if (groupDoc.exists()) {
          setGroup({ id: groupDoc.id, ...groupDoc.data() })
        }
      } catch (error) {
        console.error('Error fetching group:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroup()
  }, [groupId])

  const handleCopyLink = async () => {
    const inviteLink = `${window.location.origin}/join/${inviteCode}`

    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleGoToGroup = () => {
    navigate(`/group/${groupId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Group not found</div>
      </div>
    )
  }

  const inviteLink = `${window.location.origin}/join/${inviteCode}`

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🀄</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Your group is ready!
            </h1>
          </div>

          {/* Group Info */}
          <div className="space-y-6">
            {/* Group Name */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {group.group_name}
              </h2>
              <p className="text-gray-600">
                Games every {group.frequency.toLowerCase()} on {group.day_of_week} at {formatTime(group.time)}
              </p>
            </div>

            {/* Invite Code Display */}
            <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2 text-center font-medium">
                Invite Code
              </p>
              <p className="text-2xl font-bold text-center text-gray-800 tracking-wider">
                {inviteCode}
              </p>
            </div>

            {/* Shareable Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shareable Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-200 font-medium text-sm"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleGoToGroup}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200"
              >
                Go to My Group
              </button>
            </div>

            {/* Instructions */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Share the link above with your friends to invite them to join your group!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GroupCreated
