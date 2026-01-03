import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase'
import PageHeader from './common/PageHeader'
import Card from './common/Card'

const MyGroups = () => {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const user = auth.currentUser
        if (!user) return

        // Query groups where user is a member
        const groupsQuery = query(
          collection(db, 'group_members'),
          where('user_id', '==', user.uid)
        )

        const snapshot = await getDocs(groupsQuery)
        const groupIds = snapshot.docs.map(doc => doc.data().group_id)

        // Fetch group details (would be better with a join, but Firestore doesn't support that)
        const groupDetails = []
        for (const groupId of groupIds) {
          const groupDoc = await getDocs(query(collection(db, 'groups'), where('id', '==', groupId)))
          if (!groupDoc.empty) {
            groupDetails.push({ id: groupId, ...groupDoc.docs[0].data() })
          }
        }

        setGroups(groupDetails)
      } catch (error) {
        console.error('Error fetching groups:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">✨</div>
          <p className="text-gray-600">Loading your groups...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <PageHeader
            emoji="🀄"
            title="My Groups"
            subtitle="Choose a group to view games"
          />
        </Card>

        {groups.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">You're not in any groups yet</p>
              <button
                onClick={() => navigate('/welcome')}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200"
              >
                Join or Create a Group
              </button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {group.name || group.group_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {group.day_of_week}s at {formatTime(group.time)}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/group/${group.id}`)}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200"
                  >
                    View Games
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyGroups
