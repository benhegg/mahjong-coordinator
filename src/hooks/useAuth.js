import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

/**
 * Custom hook for managing authentication state and user profile
 *
 * @returns {Object} Authentication state and utilities
 * @property {Object|null} user - Current Firebase user object
 * @property {Object|null} profile - User profile from Firestore
 * @property {boolean} loading - Whether auth state is being determined
 * @property {string|null} error - Error message if any
 * @property {Function} refreshProfile - Function to refetch user profile
 */
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        setProfile({ id: uid, ...userDoc.data() })
        return userDoc.data()
      }
      setProfile(null)
      return null
    } catch (err) {
      console.error('Error fetching user profile:', err)
      setError('Failed to load your profile. Please refresh the page.')
      return null
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user?.uid) {
      await fetchProfile(user.uid)
    }
  }, [user?.uid, fetchProfile])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        await fetchProfile(currentUser.uid)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [fetchProfile])

  return {
    user,
    profile,
    loading,
    error,
    refreshProfile,
    isAuthenticated: !!user,
    hasProfile: !!profile
  }
}

export default useAuth
