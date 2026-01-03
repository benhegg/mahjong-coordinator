import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from './firebase'
import Login from './components/Login'
import ProfileSetup from './components/ProfileSetup'
import Welcome from './components/Welcome'
import MyGroups from './components/MyGroups'
import GroupPage from './components/GroupPage'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [groupCount, setGroupCount] = useState(0)
  const [firstGroupId, setFirstGroupId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null)
        setLoading(false)
        navigate('/')
        return
      }

      setUser(currentUser)

      try {
        // Check if user has a profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        const profileExists = userDoc.exists()
        setHasProfile(profileExists)

        if (!profileExists) {
          setLoading(false)
          navigate('/profile/setup')
          return
        }

        // Count user's groups
        const groupsQuery = query(
          collection(db, 'group_members'),
          where('user_id', '==', currentUser.uid)
        )
        const groupsSnapshot = await getDocs(groupsQuery)
        const count = groupsSnapshot.size
        setGroupCount(count)

        // Get first group ID if exists
        if (count > 0) {
          setFirstGroupId(groupsSnapshot.docs[0].data().group_id)
        }

        // Route based on group count
        if (count === 0) {
          navigate('/welcome')
        } else if (count === 1) {
          navigate(`/group/${groupsSnapshot.docs[0].data().group_id}`)
        } else {
          navigate('/my-groups')
        }
      } catch (error) {
        console.error('Error checking user status:', error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">✨</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/profile/setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-groups"
          element={
            <ProtectedRoute>
              <MyGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group/:id"
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-group"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
                <p>Create Group - Coming Soon</p>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
