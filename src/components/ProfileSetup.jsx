import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { requestNotificationPermission } from '../utils/notifications'
import PageHeader from './common/PageHeader'
import Card from './common/Card'

const ProfileSetup = () => {
  const navigate = useNavigate()
  const user = auth.currentUser

  const [name, setName] = useState(user?.displayName || '')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Request notification permission (don't block if denied)
      const notificationToken = await requestNotificationPermission()

      // Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: name.trim(),
        address: address.trim() || null,
        notification_token: notificationToken || null,
        created_at: new Date().toISOString()
      })

      // Check for pending invite in localStorage
      const pendingInvite = localStorage.getItem('pendingInvite')

      if (pendingInvite) {
        // Auto-join group and redirect
        localStorage.removeItem('pendingInvite')
        // TODO: Join group logic will be added when we connect Firestore
        navigate(`/group/${pendingInvite}`)
      } else {
        // No invite - go to welcome page
        navigate('/welcome')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="Your name"
                required
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
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none"
                placeholder="123 Main St, Apt 4B"
              />
              <p className="text-xs text-gray-500 mt-1">
                Only needed if you plan to host games
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default ProfileSetup
