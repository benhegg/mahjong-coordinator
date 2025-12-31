/**
 * ErrorMessage - Reusable component for error messages
 *
 * @param {string} message - Error message to display
 * @param {Function} onDismiss - Optional callback to dismiss the error
 */
const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start justify-between gap-3">
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
