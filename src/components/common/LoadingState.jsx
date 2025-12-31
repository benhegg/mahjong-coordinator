/**
 * LoadingState - Reusable component for loading screens
 *
 * @param {string} message - Loading message to display (default: "Loading...")
 */
const LoadingState = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="text-center">
        <div className="text-6xl mb-4">✨</div>
        <div className="text-gray-600">{message}</div>
      </div>
    </div>
  )
}

export default LoadingState
