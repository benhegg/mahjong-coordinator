import { useState, useCallback, memo } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../firebase'
import { PageHeader, Card, ErrorMessage, Button } from './common'

/**
 * Error messages for common Firebase auth errors
 */
const AUTH_ERROR_MESSAGES = {
  'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again when ready.',
  'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups for this site and try again.',
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/account-exists-with-different-credential': 'An account already exists with a different sign-in method.'
}

/**
 * Gets user-friendly error message from Firebase error
 * @param {Error} error - Firebase auth error
 * @returns {string} User-friendly error message
 */
const getAuthErrorMessage = (error) => {
  return AUTH_ERROR_MESSAGES[error.code] || error.message || 'Failed to sign in. Please try again.'
}

/**
 * Login - Google OAuth sign-in page
 */
const Login = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = useCallback(async () => {
    setError('')
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      // Add scopes if needed
      provider.addScope('email')
      provider.addScope('profile')

      await signInWithPopup(auth, provider)
      // Auth state change in App.jsx will handle routing
    } catch (err) {
      console.error('Error signing in:', err)
      const message = getAuthErrorMessage(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDismissError = useCallback(() => {
    setError('')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <PageHeader
            emoji="🀄"
            title="Mahjong Night"
            subtitle="Coordinate games with your group"
          />

          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} onDismiss={handleDismissError} />
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            loading={loading}
            fullWidth
            size="lg"
          >
            {loading ? (
              'Signing in...'
            ) : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </Card>
      </div>
    </div>
  )
}

export default memo(Login)
