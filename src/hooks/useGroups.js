import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  documentId,
  serverTimestamp
} from 'firebase/firestore'
import { db, auth } from '../firebase'

/**
 * Custom hook for managing user's group memberships
 * Includes batched queries for better performance
 *
 * @returns {Object} Groups data and operations
 */
export const useUserGroups = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const unsubscribeRef = useRef(null)

  useEffect(() => {
    const user = auth.currentUser
    if (!user) {
      setGroups([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Subscribe to user's group memberships
    const membershipsQuery = query(
      collection(db, 'group_members'),
      where('user_id', '==', user.uid)
    )

    unsubscribeRef.current = onSnapshot(
      membershipsQuery,
      async (snapshot) => {
        try {
          const groupIds = snapshot.docs.map(doc => doc.data().group_id)

          if (groupIds.length === 0) {
            setGroups([])
            setLoading(false)
            return
          }

          // Batch fetch group details (max 10 per query)
          const allGroups = []
          const batches = []
          for (let i = 0; i < groupIds.length; i += 10) {
            batches.push(groupIds.slice(i, i + 10))
          }

          for (const batch of batches) {
            const groupsQuery = query(
              collection(db, 'groups'),
              where(documentId(), 'in', batch)
            )
            const groupsSnapshot = await getDocs(groupsQuery)
            allGroups.push(
              ...groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            )
          }

          // Also try fetching by 'id' field for backwards compatibility
          const missingIds = groupIds.filter(
            id => !allGroups.find(g => g.id === id)
          )

          if (missingIds.length > 0) {
            for (const batch of [missingIds.slice(0, 10)]) {
              const groupsQuery = query(
                collection(db, 'groups'),
                where('id', 'in', batch)
              )
              const groupsSnapshot = await getDocs(groupsQuery)
              allGroups.push(
                ...groupsSnapshot.docs.map(doc => ({
                  id: doc.data().id || doc.id,
                  ...doc.data()
                }))
              )
            }
          }

          setGroups(allGroups)
        } catch (err) {
          console.error('Error fetching groups:', err)
          setError('Failed to load your groups. Please try again.')
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        console.error('Error subscribing to memberships:', err)
        setError('Failed to load your groups. Please try again.')
        setLoading(false)
      }
    )

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  const joinGroup = useCallback(async (groupId) => {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'Please sign in to join a group.' }
    }

    try {
      const membershipId = `${user.uid}_${groupId}`
      await setDoc(doc(db, 'group_members', membershipId), {
        user_id: user.uid,
        group_id: groupId,
        joined_at: serverTimestamp()
      })
      return { success: true }
    } catch (err) {
      console.error('Error joining group:', err)
      return { success: false, error: 'Failed to join group. Please try again.' }
    }
  }, [])

  const leaveGroup = useCallback(async (groupId) => {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'Please sign in to leave a group.' }
    }

    try {
      const membershipId = `${user.uid}_${groupId}`
      await deleteDoc(doc(db, 'group_members', membershipId))
      return { success: true }
    } catch (err) {
      console.error('Error leaving group:', err)
      return { success: false, error: 'Failed to leave group. Please try again.' }
    }
  }, [])

  return {
    groups,
    loading,
    error,
    joinGroup,
    leaveGroup,
    groupCount: groups.length
  }
}

/**
 * Custom hook for fetching a single group by ID or invite code
 *
 * @param {string} groupIdOrCode - Group ID or invite code
 * @returns {Object} Group data and state
 */
export const useGroup = (groupIdOrCode) => {
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const unsubscribeRef = useRef(null)

  useEffect(() => {
    if (!groupIdOrCode) {
      setGroup(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // First try to find by document ID
    const groupRef = doc(db, 'groups', groupIdOrCode)

    unsubscribeRef.current = onSnapshot(
      groupRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          setGroup({ id: docSnap.id, ...docSnap.data() })
          setLoading(false)
        } else {
          // Try to find by invite code or 'id' field
          try {
            const byIdQuery = query(
              collection(db, 'groups'),
              where('id', '==', groupIdOrCode)
            )
            const byIdSnapshot = await getDocs(byIdQuery)

            if (!byIdSnapshot.empty) {
              const doc = byIdSnapshot.docs[0]
              setGroup({ id: doc.id, ...doc.data() })
            } else {
              // Try by invite code
              const byCodeQuery = query(
                collection(db, 'groups'),
                where('invite_code', '==', groupIdOrCode)
              )
              const byCodeSnapshot = await getDocs(byCodeQuery)

              if (!byCodeSnapshot.empty) {
                const doc = byCodeSnapshot.docs[0]
                setGroup({ id: doc.id, ...doc.data() })
              } else {
                setGroup(null)
                setError('Group not found. Please check the invite link.')
              }
            }
          } catch (err) {
            console.error('Error fetching group:', err)
            setError('Failed to load group. Please try again.')
          }
          setLoading(false)
        }
      },
      (err) => {
        console.error('Error subscribing to group:', err)
        setError('Failed to load group. Please try again.')
        setLoading(false)
      }
    )

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [groupIdOrCode])

  return { group, loading, error }
}

export default useUserGroups
