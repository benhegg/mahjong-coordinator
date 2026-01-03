import { memo, useMemo } from 'react'

/**
 * Status badge configurations
 */
const STATUS_STYLES = {
  going: 'bg-green-100 text-green-700',
  maybe: 'bg-amber-100 text-amber-700',
  'not-going': 'bg-gray-100 text-gray-600'
}

const STATUS_LABELS = {
  going: 'Going',
  maybe: 'Maybe',
  'not-going': "Can't go"
}

/**
 * PlayerList - Displays list of players with their response status
 *
 * @param {Array} responses - Array of response objects with userId, userName, status
 */
const PlayerList = memo(({ responses = [] }) => {
  // Sort by status: going first, then maybe, then not-going
  const sortedResponses = useMemo(() => {
    const order = { going: 0, maybe: 1, 'not-going': 2 }
    return [...responses].sort((a, b) => {
      const orderA = order[a.status] ?? 3
      const orderB = order[b.status] ?? 3
      return orderA - orderB
    })
  }, [responses])

  if (responses.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-2">
        No responses yet
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-700 mb-3">
        Players ({responses.length})
      </p>
      {sortedResponses.map((response) => (
        <div
          key={response.userId}
          className="flex items-center justify-between py-1"
        >
          <span className="text-sm text-gray-800">
            {response.userName}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded ${
              STATUS_STYLES[response.status] || STATUS_STYLES['not-going']
            }`}
          >
            {STATUS_LABELS[response.status] || response.status}
          </span>
        </div>
      ))}
    </div>
  )
})

PlayerList.displayName = 'PlayerList'

export default PlayerList
