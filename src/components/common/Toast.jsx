import { useState, useEffect, useCallback, createContext, useContext, memo } from 'react'

/**
 * Toast notification context and provider
 */
const ToastContext = createContext(null)

/**
 * Toast types and their styling
 */
const TOAST_STYLES = {
  success: {
    bg: 'bg-green-600',
    icon: '✓'
  },
  error: {
    bg: 'bg-red-600',
    icon: '✕'
  },
  warning: {
    bg: 'bg-amber-500',
    icon: '⚠'
  },
  info: {
    bg: 'bg-blue-500',
    icon: 'ℹ'
  }
}

/**
 * Individual Toast component
 */
const ToastItem = memo(({ toast, onDismiss }) => {
  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info

  useEffect(() => {
    if (toast.duration !== Infinity) {
      const timer = setTimeout(() => {
        onDismiss(toast.id)
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div
      className={`${style.bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-sm animate-slide-up`}
      role="alert"
    >
      <span className="text-lg font-bold">{style.icon}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-white/80 hover:text-white transition p-1"
        aria-label="Dismiss notification"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
})

ToastItem.displayName = 'ToastItem'

/**
 * Toast container component
 */
const ToastContainer = memo(({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
})

ToastContainer.displayName = 'ToastContainer'

/**
 * Toast Provider component
 * Wrap your app with this to enable toast notifications
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    show: (message, type, duration) => addToast(message, type, duration),
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration || 5000),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
    dismiss: removeToast,
    dismissAll: () => setToasts([])
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * Hook to use toast notifications
 * @returns {Object} Toast methods (success, error, warning, info, dismiss)
 */
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastProvider
