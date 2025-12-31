import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { requestNotificationPermission } from '../utils/notifications'
import NotificationPrompt from './common/NotificationPrompt'
import PageHeader from './common/PageHeader'
import Card from './common/Card'
import ErrorMessage from './common/ErrorMessage'

const Login = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)

        // Check if user exists in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (!userDoc.exists()) {
          // New user - create user document
          console.log('New user detected')
          setIsNewUser(true)
          await setDoc(userDocRef, {
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          })
          // Show notification prompt for new users
          setShowNotificationPrompt(true)
        } else {
          // Returning user - update last login and redirect immediately
          console.log('Returning user - redirecting to dashboard')
          setIsNewUser(false)
          await setDoc(userDocRef, {
            lastLoginAt: new Date().toISOString()
          }, { merge: true })

          navigate('/dashboard', { replace: true })
        }
      } else {
        setUser(null)
        setShowNotificationPrompt(false)
        setIsNewUser(false)
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      // onAuthStateChanged will handle the rest
    } catch (err) {
      console.error('Error signing in with Google:', err)
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.')
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up blocked. Please allow pop-ups and try again.')
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEnableNotifications = async () => {
    setNotificationLoading(true)
    setError('')

    try {
      const token = await requestNotificationPermission()

      if (token && user) {
        // Store the FCM token in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          fcmToken: token,
          notificationsEnabled: true,
          updatedAt: new Date().toISOString()
        }, { merge: true })
        console.log('Notifications enabled, token stored')
      } else {
        console.log('Notification permission denied or unavailable')
      }
    } catch (err) {
      console.error('Error enabling notifications:', err)
    } finally {
      setNotificationLoading(false)
      setShowNotificationPrompt(false)

      // Redirect based on user type
      if (isNewUser) {
        navigate('/welcome', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }

  const handleSkipNotifications = async () => {
    setShowNotificationPrompt(false)

    // Redirect based on user type
    if (isNewUser) {
      navigate('/welcome', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card>
          <PageHeader
            title="Mahjong Night"
            subtitle={!user ? 'Coordinate games with your group' : 'One more thing...'}
          />

          {/* Login Screen */}
          {!user && (
            <div className="space-y-6">
              <ErrorMessage message={error} onDismiss={() => setError('')} />

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By signing in, you agree to coordinate amazing mahjong games
              </p>
            </div>
          )}

          {/* Notification Permission Prompt */}
          {user && showNotificationPrompt && (
            <NotificationPrompt
              onEnable={handleEnableNotifications}
              onSkip={handleSkipNotifications}
              loading={notificationLoading}
              error={error}
            />
          )}
        </Card>
      </div>
    </div>
  )
}

export default Login
