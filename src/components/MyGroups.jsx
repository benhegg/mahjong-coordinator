import { memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserGroups } from '../hooks/useGroups'
import { formatTime } from '../utils/formatters'
import { PageHeader, Card, ErrorMessage, Button, SkeletonMyGroups } from './common'

/**
 * GroupCard - Individual group list item
 */
const GroupCard = memo(({ group, onViewGames }) => {
  const handleClick = useCallback(() => {
    onViewGames(group.id)
  }, [group.id, onViewGames])

  const displayName = group.name || group.group_name || 'Unnamed Group'
  const displayTime = group.time ? formatTime(group.time) : ''
  const displayDay = group.day_of_week || group.dayOfWeek || ''

  return (
    <Card className="hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
            {displayName}
          </h3>
          {displayDay && displayTime && (
            <p className="text-sm text-gray-600">
              {displayDay}s at {displayTime}
            </p>
          )}
        </div>
        <Button onClick={handleClick} size="md">
          View Games
        </Button>
      </div>
    </Card>
  )
})

GroupCard.displayName = 'GroupCard'

/**
 * EmptyState - Shown when user has no groups
 */
const EmptyState = memo(({ onJoinGroup }) => (
  <Card>
    <div className="text-center py-8">
      <div className="text-5xl mb-4">🎲</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">No Groups Yet</h2>
      <p className="text-gray-600 mb-6">
        Join a group to start coordinating mahjong games with friends!
      </p>
      <Button onClick={onJoinGroup} size="lg">
        Join or Create a Group
      </Button>
    </div>
  </Card>
))

EmptyState.displayName = 'EmptyState'

/**
 * MyGroups - List of user's groups with navigation
 */
const MyGroups = () => {
  const navigate = useNavigate()
  const { groups, loading, error } = useUserGroups()

  const handleViewGames = useCallback((groupId) => {
    navigate(`/group/${groupId}`)
  }, [navigate])

  const handleJoinGroup = useCallback(() => {
    navigate('/welcome')
  }, [navigate])

  // Sort groups alphabetically by name
  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      const nameA = (a.name || a.group_name || '').toLowerCase()
      const nameB = (b.name || b.group_name || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [groups])

  // Show skeleton while loading
  if (loading) {
    return <SkeletonMyGroups />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <PageHeader
            emoji="🀄"
            title="My Groups"
            subtitle={groups.length > 0 ? 'Choose a group to view games' : 'Get started by joining a group'}
          />
        </Card>

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {groups.length === 0 ? (
          <EmptyState onJoinGroup={handleJoinGroup} />
        ) : (
          <div className="space-y-4">
            {sortedGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onViewGames={handleViewGames}
              />
            ))}

            {/* Add group button */}
            <div className="pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={handleJoinGroup}
              >
                <span className="text-lg">➕</span>
                Join Another Group
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(MyGroups)
