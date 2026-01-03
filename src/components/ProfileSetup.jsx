import { useState, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { requestNotificationPermission } from '../utils/notifications'
import { useToast } from './common/Toast'
import { PageHeader, Card, ErrorMessage, Button } from './common'

/**
 * ProfileSetup - Initial profile creation form for new users
 * Collects name and optional address, requests notification permissions
 */
const ProfileSetup = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const user = auth.currentUser

  const [name, setName] = useState(user?.displayName || '')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNameChange = useCallback((e) => {
    setName(e.target.value)
    if (error) setError('')
  }, [error])

  const handleAddressChange = useCallback((e) => {
    setAddress(e.target.value)
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Name is required')
      return
    }

    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Request notification permission (don't block if denied)
      let notificationToken = null
      try {
        notificationToken = await requestNotificationPermission()
      } catch (notifError) {
        console.warn('Notification permission not granted:', notifError)
      }

      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: trimmedName,
        address: address.trim() || null,
        notification_token: notificationToken || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      toast.success('Profile created successfully!')

      // Check for pending invite in localStorage
      const pendingInvite = localStorage.getItem('pendingInvite')

      if (pendingInvite) {
        localStorage.removeItem('pendingInvite')
        navigate(`/join/${pendingInvite}`, { replace: true })
      } else {
        navigate('/welcome', { replace: true })
      }
    } catch (err) {
      console.error('Error saving profile:', err)

      // Provide specific error messages
      if (err.code === 'permission-denied') {
        setError('Permission denied. Please try signing out and back in.')
      } else if (err.code === 'unavailable') {
        setError('Service temporarily unavailable. Please try again.')
      } else {
        setError('Failed to save profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [name, address, user, navigate, toast])

  const handleDismissError = useCallback(() => {
    setError('')
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <PageHeader
            emoji="👤"
            title="Set Up Your Profile"
            subtitle="Tell us a bit about yourself"
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <ErrorMessage message={error} onDismiss={handleDismissError} />
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name <span className="text-pink-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={handleNameChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition-colors min-h-[44px]"
                placeholder="Your name"
                required
                autoComplete="name"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                Address <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={handleAddressChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none transition-colors min-h-[44px]"
                placeholder="123 Main St, Apt 4B"
                autoComplete="street-address"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-2">
                Only needed if you plan to host games at your place
              </p>
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
            >
              {loading ? 'Saving...' : 'Continue'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default memo(ProfileSetup)
