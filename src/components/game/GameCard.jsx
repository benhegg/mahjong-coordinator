import { memo, useState, useCallback } from 'react'
import { formatDate, formatTime, isThisWeek, getPlayerCounts } from '../../utils/formatters'
import HostInfo from './HostInfo'
import ResponseButtons from './ResponseButtons'
import PlayerList from './PlayerList'

/**
 * GameCard - Displays a single game with host info, responses, and actions
 *
 * @param {Object} game - Game data object
 * @param {Object} groupInfo - Group info with time
 * @param {string} currentUserId - Current user's ID
 * @param {Function} onRespond - Callback when user responds (gameId, status)
 * @param {Function} onVolunteerToHost - Callback when user volunteers to host
 */
const GameCard = memo(({
  game,
  groupInfo,
  currentUserId,
  onRespond,
  onVolunteerToHost
}) => {
  const [expanded, setExpanded] = useState(false)
  const playerCounts = getPlayerCounts(game.responses)

  const toggleExpanded = useCallback(() => {
    setExpanded(prev => !prev)
  }, [])

  const handleRespond = useCallback((status) => {
    onRespond(game.id, status)
  }, [game.id, onRespond])

  const handleVolunteer = useCallback(() => {
    onVolunteerToHost(game.id)
  }, [game.id, onVolunteerToHost])

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="p-5">
        {/* Date and Time Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {formatDate(game.date)} • {formatTime(groupInfo.time)}
          </h3>
          {isThisWeek(game.date) && (
            <span className="bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full">
              This week
            </span>
          )}
        </div>

        {/* No Host State */}
        {!game.host && (
          <div className="space-y-3">
            <p className="text-gray-600 flex items-center gap-2">
              <span className="text-xl">🏠</span>
              <span className="font-semibold">Need a Host!</span>
            </p>
            <button
              onClick={handleVolunteer}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 min-h-[44px]"
            >
              Volunteer to Host
            </button>
          </div>
        )}

        {/* Has Host State */}
        {game.host && (
          <div className="space-y-4">
            <HostInfo host={game.host} />

            {/* Player Count */}
            <div>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                <span>👥</span> {playerCounts.message}
              </p>
              {playerCounts.alert && (
                <p
                  className={`text-sm font-semibold px-3 py-2 rounded-lg ${
                    playerCounts.alert.type === 'success'
                      ? 'text-green-700 bg-green-50'
                      : playerCounts.alert.type === 'warning'
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-blue-600 bg-blue-50'
                  }`}
                >
                  {playerCounts.alert.text}
                </p>
              )}
            </div>

            {/* Response Buttons */}
            <ResponseButtons
              currentResponse={game.userResponse}
              onRespond={handleRespond}
            />

            {/* View Details Toggle */}
            <button
              onClick={toggleExpanded}
              className="w-full text-sm text-gray-600 hover:text-gray-800 font-semibold py-2 flex items-center justify-center gap-1 min-h-[44px]"
              aria-expanded={expanded}
            >
              {expanded ? 'Hide Details' : 'View Details'}
              <svg
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded Player List */}
            {expanded && (
              <div className="border-t pt-4">
                <PlayerList responses={game.responses} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

GameCard.displayName = 'GameCard'

export default GameCard
