import { useState, useEffect } from 'react'

const GroupPage = () => {
  // Mock current user
  const currentUserId = 'user-1'

  // Mock group data
  const groupInfo = {
    id: 'group-123',
    name: 'Thursday Night Mahjong',
    dayOfWeek: 'Thursday',
    time: '19:00',
    frequency: 'weekly',
    inviteCode: 'ABC123'
  }

  const [games, setGames] = useState([])
  const [expandedGameId, setExpandedGameId] = useState(null)
  const [showToast, setShowToast] = useState(false)

  // Generate upcoming games (next 8 weeks)
  useEffect(() => {
    const generateGames = () => {
      const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }
      const targetDay = dayMap[groupInfo.dayOfWeek]
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Find next occurrence of target day
      let currentDate = new Date(today)
      while (currentDate.getDay() !== targetDay) {
        currentDate.setDate(currentDate.getDate() + 1)
      }

      const upcomingGames = []
      for (let i = 0; i < 8; i++) {
        const gameDate = new Date(currentDate)

        // Mock data for demonstration
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

        upcomingGames.push({
          id: `game-${i}`,
          date: gameDate,
          host,
          responses,
          userResponse: isFutureGame ? null : 'going'
        })

        currentDate.setDate(currentDate.getDate() + 7)
      }

      setGames(upcomingGames)
    }

    generateGames()
  }, [])

  // Group games by month
  const gamesByMonth = games.reduce((acc, game) => {
    const monthYear = game.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
    if (!acc[monthYear]) {
      acc[monthYear] = []
    }
    acc[monthYear].push(game)
    return acc
  }, {})

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const isThisWeek = (date) => {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    return date >= today && date <= nextWeek
  }

  const handleShareInvite = () => {
    const inviteLink = `${window.location.origin}/join/${groupInfo.inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleResponse = (gameId, status) => {
    setGames(games.map(game => {
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
  }

  const getPlayerCounts = (responses) => {
    const going = responses.filter(r => r.status === 'going').length
    const maybe = responses.filter(r => r.status === 'maybe').length

    let message = `👥 ${going} going`
    if (maybe > 0) {
      message += ` • ${maybe} maybe`
    }

    let alert = null
    if (going >= 5 && going <= 7) {
      const needed = 8 - going
      alert = `⚠️ Need ${needed} more for Table 2!`
    } else if (going >= 8) {
      alert = '✓ Table 1 & 2 full'
    }

    return { message, alert }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      {/* Top Navigation */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🀄</span>
              <h1 className="text-xl font-bold text-gray-800">{groupInfo.name}</h1>
            </div>
            <button
              onClick={() => alert('Settings coming soon!')}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {groupInfo.dayOfWeek}s at {formatTime(groupInfo.time)}
          </p>
          <button
            onClick={handleShareInvite}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Invite
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✓ Invite link copied to clipboard!
        </div>
      )}

      {/* Games List */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {Object.entries(gamesByMonth).map(([month, monthGames]) => (
          <div key={month}>
            {/* Month Header */}
            <div className="sticky top-32 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 py-2 z-5">
              <h2 className="text-center text-sm font-bold text-gray-500 tracking-wider">
                ━━━ {month} ━━━
              </h2>
            </div>

            {/* Games for this month */}
            <div className="space-y-4 mt-4">
              {monthGames.map((game) => (
                <div key={game.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  {/* Game Card Content */}
                  <div className="p-5">
                    {/* Date and Time */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          {formatDate(game.date)} • {formatTime(groupInfo.time)}
                        </h3>
                      </div>
                      {isThisWeek(game.date) && (
                        <span className="bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full">
                          This week
                        </span>
                      )}
                    </div>

                    {/* STATE 1: Needs Host */}
                    {!game.host && (
                      <div className="space-y-3">
                        <p className="text-gray-600 flex items-center gap-2">
                          <span className="text-xl">🏠</span>
                          <span className="font-semibold">Need a Host!</span>
                        </p>
                        <button
                          onClick={() => alert('Host modal coming in next session!')}
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200"
                        >
                          Volunteer to Host
                        </button>
                      </div>
                    )}

                    {/* STATE 2: Has Host */}
                    {game.host && (
                      <div className="space-y-4">
                        {/* Host Info */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                              {game.host.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 flex items-center gap-1">
                                <span className="text-sm">🏠</span>
                                {game.host.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {game.host.address.split(',')[0]}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Player Count */}
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            {getPlayerCounts(game.responses).message}
                          </p>
                          {getPlayerCounts(game.responses).alert && (
                            <p className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                              {getPlayerCounts(game.responses).alert}
                            </p>
                          )}
                        </div>

                        {/* Response Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleResponse(game.id, 'going')}
                            className={`py-3 px-4 rounded-lg font-semibold transition duration-200 ${
                              game.userResponse === 'going'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {game.userResponse === 'going' ? '✓ Going' : "I'm going"}
                          </button>
                          <button
                            onClick={() => handleResponse(game.id, 'maybe')}
                            className={`py-3 px-4 rounded-lg font-semibold transition duration-200 ${
                              game.userResponse === 'maybe'
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {game.userResponse === 'maybe' ? '~ Maybe' : 'Maybe'}
                          </button>
                          <button
                            onClick={() => handleResponse(game.id, 'not-going')}
                            className={`py-3 px-4 rounded-lg font-semibold transition duration-200 ${
                              game.userResponse === 'not-going'
                                ? 'bg-gray-400 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {game.userResponse === 'not-going' ? "✗ Can't go" : "Can't go"}
                          </button>
                        </div>

                        {/* View Details Toggle */}
                        <button
                          onClick={() => setExpandedGameId(expandedGameId === game.id ? null : game.id)}
                          className="w-full text-sm text-gray-600 hover:text-gray-800 font-semibold py-2 flex items-center justify-center gap-1"
                        >
                          View Details
                          <svg
                            className={`w-4 h-4 transition-transform ${expandedGameId === game.id ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Expanded Player List */}
                        {expandedGameId === game.id && (
                          <div className="border-t pt-4 space-y-2">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Players:</p>
                            {game.responses.map((response) => (
                              <div key={response.userId} className="flex items-center justify-between">
                                <span className="text-sm text-gray-800">{response.userName}</span>
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded ${
                                    response.status === 'going'
                                      ? 'bg-green-100 text-green-700'
                                      : response.status === 'maybe'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {response.status === 'going' ? 'Going' : response.status === 'maybe' ? 'Maybe' : "Can't go"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GroupPage
