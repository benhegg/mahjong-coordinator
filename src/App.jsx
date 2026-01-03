import { useState, useEffect, useCallback, memo } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from './firebase'
import { ToastProvider } from './components/common/Toast'
import { LoadingState } from './components/common'
import Login from './components/Login'
import ProfileSetup from './components/ProfileSetup'
import Welcome from './components/Welcome'
import MyGroups from './components/MyGroups'
import GroupPage from './components/GroupPage'

/**
 * Protected route wrapper with smart routing based on user state
 * Handles auth state, profile check, and group-based routing
 */
const ProtectedRoute = memo(({ children }) => {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return

      if (!currentUser) {
        setUser(null)
        setLoading(false)
        navigate('/', { replace: true })
        return
      }

      setUser(currentUser)

      try {
        // Check if user has a profile
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))

        if (!isMounted) return

        if (!userDoc.exists()) {
          setLoading(false)
          navigate('/profile/setup', { replace: true })
          return
        }

        // Count user's groups with proper error handling
        const groupsQuery = query(
          collection(db, 'group_members'),
          where('user_id', '==', currentUser.uid)
        )
        const groupsSnapshot = await getDocs(groupsQuery)

        if (!isMounted) return

        const count = groupsSnapshot.size

        // Route based on group count
        if (count === 0) {
          navigate('/welcome', { replace: true })
        } else if (count === 1) {
          const firstGroupId = groupsSnapshot.docs[0].data().group_id
          navigate(`/group/${firstGroupId}`, { replace: true })
        } else {
          navigate('/my-groups', { replace: true })
        }
      } catch (err) {
        console.error('Error checking user status:', err)
        if (isMounted) {
          setError('Failed to load your data. Please refresh the page.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [navigate])

  if (loading) {
    return <LoadingState message="Loading your account..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 min-h-[44px]"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
})

ProtectedRoute.displayName = 'ProtectedRoute'

/**
 * Coming Soon placeholder component
 */
const ComingSoon = memo(({ title }) => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-4">
    <div className="text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h1 className="text-xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-600">Coming Soon</p>
    </div>
  </div>
))

ComingSoon.displayName = 'ComingSoon'

/**
 * Main App component with routing
 */
function App() {
  return (
    <ToastProvider>
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
            path="/join/:code"
            element={
              <ProtectedRoute>
                <Welcome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-group"
            element={
              <ProtectedRoute>
                <ComingSoon title="Create Group" />
              </ProtectedRoute>
            }
          />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
