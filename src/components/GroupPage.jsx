import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useParams } from 'react-router-dom'
import { auth } from '../firebase'
import { useGroup } from '../hooks/useGroups'
import { useToast } from './common/Toast'
import { formatMonthYear } from '../utils/formatters'
import { ErrorMessage, SkeletonGroupPage } from './common'
import { GroupHeader, GameCard } from './game'

/**
 * Generates upcoming games for the next N weeks
 * @param {Object} groupInfo - Group info with dayOfWeek
 * @param {number} weeksCount - Number of weeks to generate
 * @returns {Array} Array of game objects
 */
const generateUpcomingGames = (groupInfo, weeksCount = 8) => {
  const dayMap = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6
  }

  const dayOfWeek = groupInfo.dayOfWeek || groupInfo.day_of_week || 'Thursday'
  const targetDay = dayMap[dayOfWeek] ?? 4

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find next occurrence of target day
  let currentDate = new Date(today)
  while (currentDate.getDay() !== targetDay) {
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const games = []
  for (let i = 0; i < weeksCount; i++) {
    const gameDate = new Date(currentDate)

    // Mock data - in production this would come from Firestore
    const isFutureGame = i > 0
    const host = isFutureGame ? null : {
      id: 'user-2',
      name: 'Alice Chen',
      address: '2847 Oak Street, Apt 3B'
    }

    const responses = isFutureGame ? [] : [
      { userId: 'user-2', userName: 'Alice Chen', status: 'going' },
      { userId: 'user-1', userName: 'You', status: 'going' },
      { userId: 'user-3', userName: 'Bob Wu', status: 'going' },
      { userId: 'user-4', userName: 'Carol Lee', status: 'maybe' }
    ]

    games.push({
      id: `game-${i}`,
      date: gameDate,
      host,
      responses,
      userResponse: isFutureGame ? null : 'going'
    })

    currentDate.setDate(currentDate.getDate() + 7)
  }

  return games
}

/**
 * Groups games by month for display
 * @param {Array} games - Array of game objects
 * @returns {Object} Games grouped by month-year key
 */
const groupGamesByMonth = (games) => {
  return games.reduce((acc, game) => {
    const monthYear = formatMonthYear(game.date)
    if (!acc[monthYear]) {
      acc[monthYear] = []
    }
    acc[monthYear].push(game)
    return acc
  }, {})
}

/**
 * MonthSection - Displays games for a specific month
 */
const MonthSection = memo(({ month, games, groupInfo, currentUserId, onRespond, onVolunteerToHost }) => (
  <div>
    {/* Month Header */}
    <div className="sticky top-32 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 py-2 z-5">
      <h2 className="text-center text-sm font-bold text-gray-500 tracking-wider">
        ━━━ {month} ━━━
      </h2>
    </div>

    {/* Games for this month */}
    <div className="space-y-4 mt-4">
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          groupInfo={groupInfo}
          currentUserId={currentUserId}
          onRespond={onRespond}
          onVolunteerToHost={onVolunteerToHost}
        />
      ))}
    </div>
  </div>
))

MonthSection.displayName = 'MonthSection'

/**
 * GroupPage - Main group view with upcoming games
 */
const GroupPage = () => {
  const { id: groupId } = useParams()
  const toast = useToast()
  const { group: firestoreGroup, loading: groupLoading, error: groupError } = useGroup(groupId)

  // Use current user ID or fallback for mock data
  const currentUserId = auth.currentUser?.uid || 'user-1'

  // Combine Firestore group with mock fallback
  const groupInfo = useMemo(() => {
    if (firestoreGroup) {
      return {
        id: firestoreGroup.id,
        name: firestoreGroup.name || firestoreGroup.group_name || 'Mahjong Group',
        dayOfWeek: firestoreGroup.day_of_week || firestoreGroup.dayOfWeek || 'Thursday',
        time: firestoreGroup.time || '19:00',
        inviteCode: firestoreGroup.invite_code || firestoreGroup.inviteCode || groupId,
        adminId: firestoreGroup.admin_id || firestoreGroup.adminId,
        memberCount: firestoreGroup.member_count || firestoreGroup.memberCount || 0
      }
    }
    // Fallback mock data
    return {
      id: groupId,
      name: 'Thursday Night Mahjong',
      dayOfWeek: 'Thursday',
      time: '19:00',
      inviteCode: groupId,
      adminId: null,
      memberCount: 0
    }
  }, [firestoreGroup, groupId])

  // Check if current user is the group admin
  const isAdmin = useMemo(() => {
    return groupInfo.adminId === currentUserId
  }, [groupInfo.adminId, currentUserId])

  // Generate games based on group info
  const [games, setGames] = useState([])

  useEffect(() => {
    if (groupInfo) {
      setGames(generateUpcomingGames(groupInfo, 8))
    }
  }, [groupInfo])

  // Group games by month (memoized)
  const gamesByMonth = useMemo(() => groupGamesByMonth(games), [games])

  // Handle user response to a game
  const handleResponse = useCallback((gameId, status) => {
    setGames(prevGames => prevGames.map(game => {
      if (game.id === gameId) {
        // Remove existing user response
        const filteredResponses = game.responses.filter(r => r.userId !== currentUserId)

        // Add new response
        const newResponse = {
          userId: currentUserId,
          userName: 'You',
          status
        }

        return {
          ...game,
          responses: [...filteredResponses, newResponse],
          userResponse: status
        }
      }
      return game
    }))

    // Show feedback
    const messages = {
      going: "You're going!",
      maybe: 'Marked as maybe',
      'not-going': "Marked as can't go"
    }
    toast.success(messages[status] || 'Response updated')
  }, [currentUserId, toast])

  // Handle volunteer to host
  const handleVolunteerToHost = useCallback((gameId) => {
    toast.info('Host volunteering coming soon!')
    // TODO: Implement host modal and Firestore update
  }, [toast])

  // Show loading skeleton
  if (groupLoading) {
    return <SkeletonGroupPage />
  }

  // Show error state
  if (groupError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-center mb-4">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Group Not Found</h2>
          </div>
          <ErrorMessage message={groupError} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <GroupHeader groupInfo={groupInfo} memberCount={groupInfo.memberCount} isAdmin={isAdmin} />

      {/* Games List */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {Object.entries(gamesByMonth).map(([month, monthGames]) => (
          <MonthSection
            key={month}
            month={month}
            games={monthGames}
            groupInfo={groupInfo}
            currentUserId={currentUserId}
            onRespond={handleResponse}
            onVolunteerToHost={handleVolunteerToHost}
          />
        ))}

        {games.length === 0 && !groupLoading && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-gray-600">No upcoming games scheduled</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(GroupPage)
