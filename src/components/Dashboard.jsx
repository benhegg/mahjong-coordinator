import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../firebase'

const Dashboard = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUser(auth.currentUser)

    const fetchUserGroups = async () => {
      if (!auth.currentUser) return

      try {
        // Fetch groups where user is a member
        const groupsQuery = query(
          collection(db, 'groups'),
          where('members', 'array-contains', auth.currentUser.uid)
        )
        const querySnapshot = await getDocs(groupsQuery)
        const userGroups = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setGroups(userGroups)
      } catch (error) {
        console.error('Error fetching groups:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserGroups()
  }, [])

  const handleSignOut = async () => {
    await auth.signOut()
    navigate('/')
  }

  const handleCreateGroup = () => {
    navigate('/create-group')
  }

  const handleJoinGroup = () => {
    navigate('/join')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-full border-4 border-pink-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Welcome back, {user?.displayName?.split(' ')[0] || 'there'}!
                </h1>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 transition px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Groups Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span>🀄</span>
              My Groups
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleJoinGroup}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-200 font-medium text-sm"
              >
                Join Group
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 font-medium text-sm"
              >
                + Create Group
              </button>
            </div>
          </div>

          {/* Groups List */}
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎴</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No groups yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create a group or join one with an invite code
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCreateGroup}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200"
                >
                  Create Your First Group
                </button>
                <button
                  onClick={handleJoinGroup}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-pink-400 hover:bg-pink-50 transition duration-200"
                >
                  Join a Group
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {groups.map(group => (
                <div
                  key={group.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 hover:bg-pink-50 transition cursor-pointer"
                  onClick={() => navigate(`/group/${group.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {group.group_name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {group.frequency} on {group.day_of_week} at{' '}
                        {new Date(`2000-01-01T${group.time}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                    <div className="text-gray-400">→</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
