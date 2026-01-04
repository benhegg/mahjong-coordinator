import { useCallback } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  increment,
  orderBy
} from 'firebase/firestore'
import { db, auth } from '../firebase'
import { generateInviteCode, generateUpcomingGames } from '../utils/groupUtils'

/**
 * Custom hook for group admin operations
 *
 * @returns {Object} Admin operations
 */
export const useGroupAdmin = () => {
  /**
   * Updates group settings (name, schedule, etc.)
   */
  const updateGroupSettings = useCallback(async (groupId, updates) => {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'Please sign in to update settings.' }
    }

    try {
      // Verify admin status
      const groupDoc = await getDoc(doc(db, 'groups', groupId))
      if (!groupDoc.exists()) {
        return { success: false, error: 'Group not found.' }
      }

      if (groupDoc.data().admin_id !== user.uid) {
        return { success: false, error: 'Only the admin can update group settings.' }
      }

      // Update group
      await updateDoc(doc(db, 'groups', groupId), {
        ...updates,
        updated_at: serverTimestamp()
      })

      // If schedule changed, regenerate games
      if (updates.game_days || updates.time || updates.frequency) {
        const batch = writeBatch(db)

        // Delete future games
        const gamesQuery = query(
          collection(db, 'games'),
          where('group_id', '==', groupId)
        )
        const gamesSnapshot = await getDocs(gamesQuery)
        const now = new Date()

        gamesSnapshot.docs.forEach(gameDoc => {
          const gameDate = new Date(gameDoc.data().date)
          if (gameDate > now) {
            batch.delete(doc(db, 'games', gameDoc.id))
          }
        })

        // Generate new games
        const currentGroup = groupDoc.data()
        const newGames = generateUpcomingGames({
          id: groupId,
          game_days: updates.game_days || currentGroup.game_days,
          time: updates.time || currentGroup.time,
          frequency: updates.frequency || currentGroup.frequency
        }, 8)

        for (const game of newGames) {
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
      }

      return { success: true }
    } catch (err) {
      console.error('Error updating group settings:', err)
      return { success: false, error: 'Failed to update settings. Please try again.' }
    }
  }, [])

  /**
   * Regenerates the group's invite code
   */
  const regenerateInviteCode = useCallback(async (groupId) => {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'Please sign in.' }
    }

    try {
      // Verify admin status
      const groupDoc = await getDoc(doc(db, 'groups', groupId))
      if (!groupDoc.exists()) {
        return { success: false, error: 'Group not found.' }
      }

      if (groupDoc.data().admin_id !== user.uid) {
        return { success: false, error: 'Only the admin can regenerate the invite code.' }
      }

      const newCode = generateInviteCode()

      await updateDoc(doc(db, 'groups', groupId), {
        invite_code: newCode,
        updated_at: serverTimestamp()
      })

      return { success: true, inviteCode: newCode }
    } catch (err) {
      console.error('Error regenerating invite code:', err)
      return { success: false, error: 'Failed to regenerate invite code. Please try again.' }
    }
  }, [])

  /**
   * Removes a member from the group
   */
  const removeMember = useCallback(async (groupId, memberId) => {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'Please sign in.' }
    }

    try {
      // Verify admin status
      const groupDoc = await getDoc(doc(db, 'groups', groupId))
      if (!groupDoc.exists()) {
        return { success: false, error: 'Group not found.' }
      }

      if (groupDoc.data().admin_id !== user.uid) {
        return { success: false, error: 'Only the admin can remove members.' }
      }

      if (memberId === user.uid) {
        return { success: false, error: 'You cannot remove yourself. Use "Leave Group" instead.' }
      }

      const batch = writeBatch(db)

      // Remove membership
      const membershipId = `${memberId}_${groupId}`
      batch.delete(doc(db, 'group_members', membershipId))

      // Decrement member count
      batch.update(doc(db, 'groups', groupId), {
        member_count: increment(-1),
        updated_at: serverTimestamp()
      })

      await batch.commit()

      return { success: true }
    } catch (err) {
      console.error('Error removing member:', err)
      return { success: false, error: 'Failed to remove member. Please try again.' }
    }
  }, [])

  /**
   * Deletes a group and all associated data
   */
  const deleteGroup = useCallback(async (groupId) => {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'Please sign in.' }
    }

    try {
      // Verify admin status
      const groupDoc = await getDoc(doc(db, 'groups', groupId))
      if (!groupDoc.exists()) {
        return { success: false, error: 'Group not found.' }
      }

      if (groupDoc.data().admin_id !== user.uid) {
        return { success: false, error: 'Only the admin can delete the group.' }
      }

      const batch = writeBatch(db)

      // Delete all memberships
      const membersQuery = query(
        collection(db, 'group_members'),
        where('group_id', '==', groupId)
      )
      const membersSnapshot = await getDocs(membersQuery)
      membersSnapshot.docs.forEach(memberDoc => {
        batch.delete(doc(db, 'group_members', memberDoc.id))
      })

      // Delete all games
      const gamesQuery = query(
        collection(db, 'games'),
        where('group_id', '==', groupId)
      )
      const gamesSnapshot = await getDocs(gamesQuery)
      gamesSnapshot.docs.forEach(gameDoc => {
        batch.delete(doc(db, 'games', gameDoc.id))
      })

      // Delete all game responses
      const responsesQuery = query(
        collection(db, 'game_responses'),
        where('group_id', '==', groupId)
      )
      const responsesSnapshot = await getDocs(responsesQuery)
      responsesSnapshot.docs.forEach(responseDoc => {
        batch.delete(doc(db, 'game_responses', responseDoc.id))
      })

      // Delete the group
      batch.delete(doc(db, 'groups', groupId))

      await batch.commit()

      return { success: true }
    } catch (err) {
      console.error('Error deleting group:', err)
      return { success: false, error: 'Failed to delete group. Please try again.' }
    }
  }, [])

  /**
   * Transfers admin role to another member
   */
  const transferAdmin = useCallback(async (groupId, newAdminId) => {
    const user = auth.currentUser
    if (!user) {
      return { success: false, error: 'Please sign in.' }
    }

    try {
      // Verify current admin status
      const groupDoc = await getDoc(doc(db, 'groups', groupId))
      if (!groupDoc.exists()) {
        return { success: false, error: 'Group not found.' }
      }

      if (groupDoc.data().admin_id !== user.uid) {
        return { success: false, error: 'Only the current admin can transfer admin role.' }
      }

      // Verify new admin is a member
      const membershipId = `${newAdminId}_${groupId}`
      const memberDoc = await getDoc(doc(db, 'group_members', membershipId))
      if (!memberDoc.exists()) {
        return { success: false, error: 'That user is not a member of this group.' }
      }

      const batch = writeBatch(db)

      // Update group admin
      batch.update(doc(db, 'groups', groupId), {
        admin_id: newAdminId,
        updated_at: serverTimestamp()
      })

      // Update old admin membership
      const oldMembershipId = `${user.uid}_${groupId}`
      batch.update(doc(db, 'group_members', oldMembershipId), {
        is_admin: false
      })

      // Update new admin membership
      batch.update(doc(db, 'group_members', membershipId), {
        is_admin: true
      })

      await batch.commit()

      return { success: true }
    } catch (err) {
      console.error('Error transferring admin:', err)
      return { success: false, error: 'Failed to transfer admin role. Please try again.' }
    }
  }, [])

  return {
    updateGroupSettings,
    regenerateInviteCode,
    removeMember,
    deleteGroup,
    transferAdmin
  }
}

export default useGroupAdmin
