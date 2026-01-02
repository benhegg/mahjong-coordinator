/**
 * NotificationPrompt - Reusable component for requesting notification permissions
 *
 * @param {Function} onEnable - Callback when user clicks "Enable Notifications"
 * @param {Function} onSkip - Callback when user clicks "Maybe Later"
 * @param {boolean} loading - Whether the enable action is in progress
 * @param {string} error - Error message to display (optional)
 */
const NotificationPrompt = ({ onEnable, onSkip, loading = false, error = '' }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">🔔</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Enable Notifications
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Get notified when games need players
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onEnable}
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enabling...' : 'Enable Notifications'}
        </button>
        <button
          onClick={onSkip}
          disabled={loading}
          className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition duration-200 disabled:opacity-50"
        >
          Maybe Later
        </button>
      </div>
    </div>
  )
}

export default NotificationPrompt
