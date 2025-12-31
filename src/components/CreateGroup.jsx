import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { generateInviteCode } from '../utils/inviteCode'

const CreateGroup = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    groupName: '',
    dayOfWeek: 'Thursday',
    time: '19:00',
    frequency: 'Weekly'
  })

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const frequencies = ['Weekly', 'Bi-weekly', 'Monthly']

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate user is logged in
    if (!auth.currentUser) {
      setError('You must be logged in to create a group')
      setLoading(false)
      return
    }

    try {
      // Generate unique invite code
      const inviteCode = generateInviteCode()

      // Create group in Firestore
      const groupData = {
        group_name: formData.groupName,
        day_of_week: formData.dayOfWeek,
        time: formData.time,
        frequency: formData.frequency,
        created_by: auth.currentUser.uid,
        invite_code: inviteCode,
        created_at: new Date().toISOString(),
        members: [auth.currentUser.uid] // Creator is automatically a member
      }

      const docRef = await addDoc(collection(db, 'groups'), groupData)

      // Redirect to success page with group ID and invite code
      navigate(`/group-created/${docRef.id}/${inviteCode}`)
    } catch (err) {
      console.error('Error creating group:', err)
      setError('Failed to create group. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🀄</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create Your Group
            </h1>
            <p className="text-gray-600">
              Set up your mahjong game schedule
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Name */}
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                id="groupName"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                placeholder="Thursday Night Mahjong"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Day of Week */}
            <div>
              <label htmlFor="dayOfWeek" className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                id="dayOfWeek"
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                required
              >
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            {/* Time */}
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            {/* Frequency */}
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                required
              >
                {frequencies.map(freq => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Group...' : 'Create Group'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateGroup
