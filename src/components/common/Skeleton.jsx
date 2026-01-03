import { memo } from 'react'

/**
 * Base skeleton component with shimmer animation
 */
const SkeletonBase = memo(({ className = '' }) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
    style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
  />
))

SkeletonBase.displayName = 'SkeletonBase'

/**
 * Skeleton text line
 * @param {string} width - Width class (e.g., "w-full", "w-3/4")
 */
export const SkeletonText = memo(({ width = 'w-full', className = '' }) => (
  <SkeletonBase className={`h-4 ${width} ${className}`} />
))

SkeletonText.displayName = 'SkeletonText'

/**
 * Skeleton avatar/circle
 * @param {string} size - Size class (e.g., "w-10 h-10", "w-12 h-12")
 */
export const SkeletonAvatar = memo(({ size = 'w-10 h-10', className = '' }) => (
  <SkeletonBase className={`${size} rounded-full ${className}`} />
))

SkeletonAvatar.displayName = 'SkeletonAvatar'

/**
 * Skeleton button
 */
export const SkeletonButton = memo(({ width = 'w-24', className = '' }) => (
  <SkeletonBase className={`h-10 ${width} rounded-lg ${className}`} />
))

SkeletonButton.displayName = 'SkeletonButton'

/**
 * Skeleton card for group list items
 */
export const SkeletonGroupCard = memo(() => (
  <div className="bg-white rounded-2xl shadow-xl p-8">
    <div className="flex items-center justify-between">
      <div className="flex-1 space-y-2">
        <SkeletonText width="w-48" />
        <SkeletonText width="w-32" className="h-3" />
      </div>
      <SkeletonButton width="w-28" />
    </div>
  </div>
))

SkeletonGroupCard.displayName = 'SkeletonGroupCard'

/**
 * Skeleton card for game items
 */
export const SkeletonGameCard = memo(() => (
  <div className="bg-white rounded-2xl shadow-md p-5 space-y-4">
    {/* Date header */}
    <div className="flex items-center justify-between">
      <SkeletonText width="w-40" className="h-5" />
      <SkeletonBase className="w-20 h-6 rounded-full" />
    </div>

    {/* Host info */}
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <SkeletonText width="w-32" />
          <SkeletonText width="w-48" className="h-3" />
        </div>
      </div>
    </div>

    {/* Player count */}
    <SkeletonText width="w-24" className="h-3" />

    {/* Response buttons */}
    <div className="grid grid-cols-3 gap-2">
      <SkeletonButton width="w-full" className="h-12" />
      <SkeletonButton width="w-full" className="h-12" />
      <SkeletonButton width="w-full" className="h-12" />
    </div>
  </div>
))

SkeletonGameCard.displayName = 'SkeletonGameCard'

/**
 * Full page loading skeleton for MyGroups
 */
export const SkeletonMyGroups = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 px-4 py-8">
    <div className="max-w-2xl mx-auto">
      {/* Header card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="text-center space-y-3">
          <SkeletonBase className="w-12 h-12 rounded-full mx-auto" />
          <SkeletonText width="w-32" className="mx-auto h-6" />
          <SkeletonText width="w-48" className="mx-auto h-4" />
        </div>
      </div>

      {/* Group cards */}
      <div className="space-y-4">
        <SkeletonGroupCard />
        <SkeletonGroupCard />
        <SkeletonGroupCard />
      </div>
    </div>
  </div>
))

SkeletonMyGroups.displayName = 'SkeletonMyGroups'

/**
 * Full page loading skeleton for GroupPage
 */
export const SkeletonGroupPage = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
    {/* Header */}
    <div className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonBase className="w-8 h-8 rounded" />
            <SkeletonText width="w-48" className="h-6" />
          </div>
          <SkeletonBase className="w-6 h-6 rounded" />
        </div>
        <SkeletonText width="w-40" className="h-4" />
        <SkeletonButton width="w-full" className="h-11" />
      </div>
    </div>

    {/* Game cards */}
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Month header */}
      <SkeletonText width="w-40" className="mx-auto h-4" />

      {/* Games */}
      <div className="space-y-4">
        <SkeletonGameCard />
        <SkeletonGameCard />
        <SkeletonGameCard />
      </div>
    </div>
  </div>
))

SkeletonGroupPage.displayName = 'SkeletonGroupPage'

/**
 * Inline loading spinner
 */
export const Spinner = memo(({ size = 'w-5 h-5', className = '' }) => (
  <svg
    className={`animate-spin ${size} ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
))

Spinner.displayName = 'Spinner'

export default SkeletonBase
