import { useState, useEffect, useCallback, useRef } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  documentId,
  serverTimestamp,
  increment,
  writeBatch,
  orderBy
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import { generateInviteCode, generateUpcomingGames } from '../utils/groupUtils'

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
          const memberships = snapshot.docs.map(d => ({
            ...d.data(),
            membershipId: d.id
          }))
          const groupIds = memberships.map(m => m.group_id)

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
              ...groupsSnapshot.docs.map(docSnap => {
                const membership = memberships.find(m => m.group_id === docSnap.id)
                return {
                  id: docSnap.id,
                  ...docSnap.data(),
                  isAdmin: membership?.is_admin || docSnap.data().admin_id === user.uid,
                  joinedAt: membership?.joined_at
                }
              })
            )
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

  /**
   * Creates a new group with the current user as admin
   */
  const createGroup = useCallback(async (groupData) => {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'Please sign in to create a group.' }
    }

    try {
      const inviteCode = generateInviteCode()
      const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const batch = writeBatch(db)

      // Create the group document
      const groupRef = doc(db, 'groups', groupId)
      batch.set(groupRef, {
        group_name: groupData.name,
        game_days: groupData.gameDays,
        time: groupData.time,
        timezone: groupData.timezone,
        frequency: groupData.frequency,
        admin_id: user.uid,
        invite_code: inviteCode,
        member_count: 1,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })

      // Add creator as member with admin flag
      const membershipId = `${user.uid}_${groupId}`
      const memberRef = doc(db, 'group_members', membershipId)
      batch.set(memberRef, {
        user_id: user.uid,
        group_id: groupId,
        is_admin: true,
        joined_at: serverTimestamp()
      })

      // Generate and create upcoming games
      const games = generateUpcomingGames({
        id: groupId,
        game_days: groupData.gameDays,
        time: groupData.time,
        frequency: groupData.frequency
      }, 8)

      for (const game of games) {
        const gameRef = doc(db, 'games', game.id)
        batch.set(gameRef, {
          group_id: groupId,
          date: game.date.toISOString(),
          time: game.time,
          host_id: null,
          host_name: null,
          host_address: null,
          created_at: serverTimestamp()
        })
      }

      await batch.commit()

      return {
        success: true,
        groupId,
        inviteCode
      }
    } catch (err) {
      console.error('Error creating group:', err)
      return { success: false, error: 'Failed to create group. Please try again.' }
    }
  }, [])

  /**
   * Joins a group by invite code
   */
  const joinGroup = useCallback(async (inviteCodeOrId) => {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'Please sign in to join a group.' }
    }

    try {
      // Try to find group by invite code first
      let groupId = inviteCodeOrId
      let groupDoc = await getDoc(doc(db, 'groups', inviteCodeOrId))

      if (!groupDoc.exists()) {
        // Try by invite code
        const byCodeQuery = query(
          collection(db, 'groups'),
          where('invite_code', '==', inviteCodeOrId.toUpperCase())
        )
        const byCodeSnapshot = await getDocs(byCodeQuery)

        if (!byCodeSnapshot.empty) {
          groupDoc = byCodeSnapshot.docs[0]
          groupId = groupDoc.id
        } else {
          return { success: false, error: 'Invalid invite code. Please check and try again.' }
        }
      }

      // Check if already a member
      const membershipId = `${user.uid}_${groupId}`
      const existingMember = await getDoc(doc(db, 'group_members', membershipId))
      if (existingMember.exists()) {
        return { success: true, groupId, alreadyMember: true }
      }

      const batch = writeBatch(db)

      // Add membership
      batch.set(doc(db, 'group_members', membershipId), {
        user_id: user.uid,
        group_id: groupId,
        is_admin: false,
        joined_at: serverTimestamp()
      })

      // Increment member count
      batch.update(doc(db, 'groups', groupId), {
        member_count: increment(1),
        updated_at: serverTimestamp()
      })

      await batch.commit()

      return { success: true, groupId }
    } catch (err) {
      console.error('Error joining group:', err)
      return { success: false, error: 'Failed to join group. Please try again.' }
    }
  }, [])

  /**
   * Leaves a group, transferring admin if necessary
   */
  const leaveGroup = useCallback(async (groupId) => {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'Please sign in to leave a group.' }
    }

    try {
      const groupDoc = await getDoc(doc(db, 'groups', groupId))
      if (!groupDoc.exists()) {
        return { success: false, error: 'Group not found.' }
      }

      const groupData = groupDoc.data()
      const isAdmin = groupData.admin_id === user.uid

      const batch = writeBatch(db)

      // If admin, transfer to oldest member
      let newAdminName = null
      if (isAdmin) {
        const membersQuery = query(
          collection(db, 'group_members'),
          where('group_id', '==', groupId),
          orderBy('joined_at', 'asc')
        )
        const membersSnapshot = await getDocs(membersQuery)
        const otherMembers = membersSnapshot.docs.filter(
          d => d.data().user_id !== user.uid
        )

        if (otherMembers.length > 0) {
          // Transfer admin to oldest member
          const newAdmin = otherMembers[0]
          const newAdminId = newAdmin.data().user_id

          // Get new admin's name for toast
          const newAdminDoc = await getDoc(doc(db, 'users', newAdminId))
          if (newAdminDoc.exists()) {
            newAdminName = newAdminDoc.data().name
          }

          batch.update(doc(db, 'groups', groupId), {
            admin_id: newAdminId,
            updated_at: serverTimestamp()
          })

          batch.update(doc(db, 'group_members', newAdmin.id), {
            is_admin: true
          })
        } else {
          // Last member - delete group
          batch.delete(doc(db, 'groups', groupId))

          // Delete all games
          const gamesQuery = query(
            collection(db, 'games'),
            where('group_id', '==', groupId)
          )
          const gamesSnapshot = await getDocs(gamesQuery)
          gamesSnapshot.docs.forEach(gameDoc => {
            batch.delete(doc(db, 'games', gameDoc.id))
          })
        }
      }

      // Remove membership
      const membershipId = `${user.uid}_${groupId}`
      batch.delete(doc(db, 'group_members', membershipId))

      // Decrement member count (only if group not deleted)
      if (!isAdmin || (groupData.member_count > 1)) {
        batch.update(doc(db, 'groups', groupId), {
          member_count: increment(-1),
          updated_at: serverTimestamp()
        })
      }

      await batch.commit()

      return { success: true, wasAdmin: isAdmin, newAdminName }
    } catch (err) {
      console.error('Error leaving group:', err)
      return { success: false, error: 'Failed to leave group. Please try again.' }
    }
  }, [])

  return {
    groups,
    loading,
    error,
    createGroup,
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
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const unsubscribeRef = useRef(null)

  useEffect(() => {
    if (!groupIdOrCode) {
      setGroup(null)
      setLoading(false)
      return
    }

    const user = auth.currentUser
    setLoading(true)
    setError(null)

    // First try to find by document ID
    const groupRef = doc(db, 'groups', groupIdOrCode)

    unsubscribeRef.current = onSnapshot(
      groupRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const groupData = { id: docSnap.id, ...docSnap.data() }
          setGroup(groupData)
          setIsAdmin(user && groupData.admin_id === user.uid)

          // Check if current user is a member
          if (user) {
            const membershipId = `${user.uid}_${docSnap.id}`
            const memberDoc = await getDoc(doc(db, 'group_members', membershipId))
            setIsMember(memberDoc.exists())
          }

          // Fetch members
          try {
            const membersQuery = query(
              collection(db, 'group_members'),
              where('group_id', '==', docSnap.id)
            )
            const membersSnapshot = await getDocs(membersQuery)
            const memberData = membersSnapshot.docs.map(d => ({
              ...d.data(),
              membershipId: d.id
            }))
            const memberIds = memberData.map(d => d.user_id)

            // Fetch user details for members
            if (memberIds.length > 0) {
              const memberDetails = []
              for (let i = 0; i < memberIds.length; i += 10) {
                const batch = memberIds.slice(i, i + 10)
                const usersQuery = query(
                  collection(db, 'users'),
                  where(documentId(), 'in', batch)
                )
                const usersSnapshot = await getDocs(usersQuery)
                usersSnapshot.docs.forEach(userDoc => {
                  const memberInfo = memberData.find(
                    m => m.user_id === userDoc.id
                  )
                  memberDetails.push({
                    id: userDoc.id,
                    ...userDoc.data(),
                    isAdmin: memberInfo?.is_admin || groupData.admin_id === userDoc.id,
                    joinedAt: memberInfo?.joined_at
                  })
                })
              }
              // Sort by admin first, then by join date
              memberDetails.sort((a, b) => {
                if (a.isAdmin && !b.isAdmin) return -1
                if (!a.isAdmin && b.isAdmin) return 1
                return 0
              })
              setMembers(memberDetails)
            }
          } catch (err) {
            console.error('Error fetching members:', err)
          }

          setLoading(false)
        } else {
          // Try to find by invite code
          try {
            const byCodeQuery = query(
              collection(db, 'groups'),
              where('invite_code', '==', groupIdOrCode.toUpperCase())
            )
            const byCodeSnapshot = await getDocs(byCodeQuery)

            if (!byCodeSnapshot.empty) {
              const groupDoc = byCodeSnapshot.docs[0]
              const groupData = { id: groupDoc.id, ...groupDoc.data() }
              setGroup(groupData)
              setIsAdmin(user && groupData.admin_id === user.uid)
            } else {
              setGroup(null)
              setError('Group not found. Please check the invite link.')
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

  return { group, members, loading, error, isAdmin, isMember }
}

export default useUserGroups
