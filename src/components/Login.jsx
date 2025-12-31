import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { requestNotificationPermission } from '../utils/notifications'

const Login = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        // Show notification prompt after successful login
        setShowNotificationPrompt(true)
      } else {
        setUser(null)
        setShowNotificationPrompt(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      // User is now set by onAuthStateChanged listener
      console.log('User signed in:', result.user.displayName)
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
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          notificationsEnabled: true,
          updatedAt: new Date().toISOString()
        }, { merge: true })

        setNotificationsEnabled(true)
        console.log('Notifications enabled, token stored:', token)

        // Redirect to create group after a short delay
        setRedirecting(true)
        setTimeout(() => {
          navigate('/create-group')
        }, 1500)
      } else {
        setError('Unable to get notification permission. You can enable this later in settings.')
      }
    } catch (err) {
      console.error('Error enabling notifications:', err)
      setError('Failed to enable notifications. You can try again later.')
    } finally {
      setNotificationLoading(false)
    }
  }

  const handleSkipNotifications = () => {
    setShowNotificationPrompt(false)
    setRedirecting(true)
    // Redirect to create group after a short delay
    setTimeout(() => {
      navigate('/create-group')
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🀄</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Mahjong Night
            </h1>
            <p className="text-gray-600">
              {!user && 'Coordinate games with your group'}
              {user && !showNotificationPrompt && 'Welcome back!'}
              {user && showNotificationPrompt && 'One more thing...'}
            </p>
          </div>

          {/* Login Screen */}
          {!user && (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  'Signing in...'
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
          {user && showNotificationPrompt && !notificationsEnabled && !redirecting && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-4">🔔</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Enable Notifications
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                  Get notified when games need players
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleEnableNotifications}
                  disabled={notificationLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {notificationLoading ? 'Enabling...' : 'Enable Notifications'}
                </button>
                <button
                  onClick={handleSkipNotifications}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}

          {/* Redirecting state */}
          {user && redirecting && (
            <div className="text-center space-y-6">
              <div className="text-5xl mb-4">✨</div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Redirecting...
                </h2>
                <p className="text-gray-600 text-sm">
                  Setting up your group
                </p>
              </div>
            </div>
          )}

          {/* Success Screen */}
          {user && (!showNotificationPrompt || notificationsEnabled) && !redirecting && (
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-20 h-20 rounded-full border-4 border-pink-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white text-3xl font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome, {user.displayName?.split(' ')[0] || 'there'}!
                </h2>
                <p className="text-gray-600 text-sm mb-1">
                  {user.email}
                </p>
                {notificationsEnabled && (
                  <p className="text-green-600 text-sm flex items-center justify-center gap-1 mt-2">
                    <span>🔔</span> Notifications enabled
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  You're all set! Ready to coordinate your mahjong games.
                </p>
              </div>

              <button
                onClick={() => auth.signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Secure authentication powered by Firebase
        </p>
      </div>
    </div>
  )
}

export default Login
