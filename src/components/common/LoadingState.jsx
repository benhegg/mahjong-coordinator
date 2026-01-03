import { memo } from 'react'
import { Spinner } from './Skeleton'

/**
 * LoadingState - Reusable component for full-page loading screens
 *
 * @param {string} message - Loading message to display (default: "Loading...")
 * @param {string} emoji - Optional emoji to show (default: "✨")
 * @param {boolean} showSpinner - Whether to show a spinner instead of emoji
 */
const LoadingState = memo(({ message = 'Loading...', emoji = '✨', showSpinner = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-4 py-8">
      <div className="text-center">
        {showSpinner ? (
          <div className="mb-4 flex justify-center">
            <Spinner size="w-12 h-12" className="text-pink-500" />
          </div>
        ) : (
          <div className="text-6xl mb-4 animate-bounce-in">{emoji}</div>
        )}
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
})

LoadingState.displayName = 'LoadingState'

export default LoadingState
