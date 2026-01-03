import { memo, forwardRef } from 'react'
import { Spinner } from './Skeleton'

/**
 * Button variants and their styles
 */
const VARIANTS = {
  primary: 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  outline: 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
  success: 'bg-green-500 text-white hover:bg-green-600',
  warning: 'bg-amber-500 text-white hover:bg-amber-600',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'
}

/**
 * Button sizes
 */
const SIZES = {
  sm: 'py-2 px-3 text-sm min-h-[36px]',
  md: 'py-3 px-4 text-base min-h-[44px]', // 44px touch target
  lg: 'py-4 px-6 text-lg min-h-[52px]'
}

/**
 * Reusable Button component with loading state and variants
 *
 * @param {string} variant - Button style variant
 * @param {string} size - Button size
 * @param {boolean} loading - Show loading spinner
 * @param {boolean} disabled - Disable button
 * @param {boolean} fullWidth - Make button full width
 * @param {ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 */
const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  className = '',
  ...props
}, ref) => {
  const isDisabled = disabled || loading

  const baseStyles = 'font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2'
  const variantStyles = VARIANTS[variant] || VARIANTS.primary
  const sizeStyles = SIZES[size] || SIZES.md
  const widthStyles = fullWidth ? 'w-full' : ''
  const disabledStyles = isDisabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {loading && <Spinner size="w-4 h-4" />}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default memo(Button)
