import { memo, useCallback } from 'react'

/**
 * Response button configurations
 */
const RESPONSES = [
  {
    status: 'going',
    label: "I'm going",
    activeLabel: '✓ Going',
    activeClass: 'bg-green-500 text-white',
    inactiveClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  },
  {
    status: 'maybe',
    label: 'Maybe',
    activeLabel: '~ Maybe',
    activeClass: 'bg-amber-500 text-white',
    inactiveClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  },
  {
    status: 'not-going',
    label: "Can't go",
    activeLabel: "✗ Can't go",
    activeClass: 'bg-gray-400 text-white',
    inactiveClass: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }
]

/**
 * ResponseButtons - Three-way toggle for game attendance
 *
 * @param {string} currentResponse - Current user's response status
 * @param {Function} onRespond - Callback when response changes
 * @param {boolean} disabled - Whether buttons are disabled
 */
const ResponseButtons = memo(({ currentResponse, onRespond, disabled = false }) => {
  const handleClick = useCallback((status) => {
    if (!disabled) {
      onRespond(status)
    }
  }, [onRespond, disabled])

  return (
    <div className="grid grid-cols-3 gap-2">
      {RESPONSES.map(({ status, label, activeLabel, activeClass, inactiveClass }) => {
        const isActive = currentResponse === status

        return (
          <button
            key={status}
            onClick={() => handleClick(status)}
            disabled={disabled}
            className={`py-3 px-4 rounded-lg font-semibold transition duration-200 min-h-[44px] ${
              isActive ? activeClass : inactiveClass
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-pressed={isActive}
          >
            {isActive ? activeLabel : label}
          </button>
        )
      })}
    </div>
  )
})

ResponseButtons.displayName = 'ResponseButtons'

export default ResponseButtons
