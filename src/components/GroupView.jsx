import { useState } from 'react'
import PageHeader from './common/PageHeader'
import Card from './common/Card'

const GroupView = () => {
  // Mock current user
  const currentUser = {
    id: '1',
    name: 'You',
    email: 'you@example.com'
  }

  // Mock group data
  const groupInfo = {
    name: 'Thursday Night Mahjong',
    dayOfWeek: 'Thursday',
    time: '19:00',
    frequency: 'weekly'
  }

  // Generate next 8 weeks of game dates
  const generateUpcomingDates = () => {
    const dates = []
    const today = new Date()
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }
    const targetDay = dayMap[groupInfo.dayOfWeek]

    // Find next occurrence of target day
    let currentDate = new Date(today)
    while (currentDate.getDay() !== targetDay) {
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Generate 8 weeks
    for (let i = 0; i < 8; i++) {
      dates.push({
        id: i + 1,
        date: new Date(currentDate),
        host: i === 0 ? { id: '2', name: 'Alice Chen' } : null,
        attendees: i === 0
          ? [
              { id: '2', name: 'Alice Chen' },
              { id: '3', name: 'Bob Wu' },
              { id: '1', name: 'You' }
            ]
          : i === 1
          ? [{ id: '1', name: 'You' }]
          : []
      })
      currentDate.setDate(currentDate.getDate() + 7)
    }

    return dates
  }

  const [gameDates, setGameDates] = useState(generateUpcomingDates())

  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const handleSignUpToHost = (dateId) => {
    setGameDates(gameDates.map(date =>
      date.id === dateId
        ? {
            ...date,
            host: currentUser,
            attendees: date.attendees.some(a => a.id === currentUser.id)
              ? date.attendees
              : [...date.attendees, currentUser]
          }
        : date
    ))
  }

  const handleToggleAttendance = (dateId) => {
    setGameDates(gameDates.map(date => {
      if (date.id === dateId) {
        const isAttending = date.attendees.some(a => a.id === currentUser.id)
        if (isAttending) {
          // Remove from attendees
          return {
            ...date,
            attendees: date.attendees.filter(a => a.id !== currentUser.id)
          }
        } else {
          // Add to attendees
          return {
            ...date,
            attendees: [...date.attendees, currentUser]
          }
        }
      }
      return date
    }))
  }

  const isUserAttending = (date) => {
    return date.attendees.some(a => a.id === currentUser.id)
  }

  const isUserHost = (date) => {
    return date.host?.id === currentUser.id
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <PageHeader
            emoji="🀄"
            title={groupInfo.name}
            subtitle={`${groupInfo.dayOfWeek}s at ${formatTime(groupInfo.time)}`}
          />
          <p className="text-sm text-gray-600 text-center">
            Invite code: <span className="font-mono font-bold">ABC123</span>
          </p>
        </Card>

        <div className="space-y-4">
          {gameDates.map((date, index) => (
            <Card key={date.id} className="hover:shadow-2xl transition-shadow">
              <div className="space-y-4">
                {/* Date Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {formatDate(date.date)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatTime(groupInfo.time)}
                      {index === 0 && <span className="ml-2 text-pink-600 font-semibold">This week</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    {date.host ? (
                      <div>
                        <p className="text-xs text-gray-500">Host</p>
                        <p className="font-semibold text-pink-600">
                          {isUserHost(date) ? '🏠 You' : `🏠 ${date.host.name}`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No host yet</p>
                    )}
                  </div>
                </div>

                {/* Attendees */}
                {date.attendees.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-2">
                      Attending ({date.attendees.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {date.attendees.map(attendee => (
                        <span
                          key={attendee.id}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                            attendee.id === currentUser.id
                              ? 'bg-pink-100 text-pink-700 font-semibold'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {attendee.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {!date.host && (
                    <button
                      onClick={() => handleSignUpToHost(date.id)}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200"
                    >
                      🏠 Host this game
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleAttendance(date.id)}
                    className={`flex-1 font-semibold py-2 px-4 rounded-lg transition duration-200 ${
                      isUserAttending(date)
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {isUserAttending(date) ? "✓ I'm going" : "I'll attend"}
                  </button>
                </div>

                {/* Need more players indicator */}
                {date.attendees.length < 4 && date.attendees.length > 0 && (
                  <p className="text-xs text-center text-orange-600">
                    ⚠️ Need {4 - date.attendees.length} more player{4 - date.attendees.length !== 1 ? 's' : ''}
                  </p>
                )}

                {date.attendees.length >= 4 && (
                  <p className="text-xs text-center text-green-600">
                    ✓ Full table!
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GroupView
