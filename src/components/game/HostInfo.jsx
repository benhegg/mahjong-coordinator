import { memo } from 'react'
import { getInitials } from '../../utils/formatters'

/**
 * HostInfo - Displays host information with avatar and address
 *
 * @param {Object} host - Host object with name and address
 */
const HostInfo = memo(({ host }) => {
  if (!host) return null

  const addressFirstLine = host.address?.split(',')[0] || 'Address not provided'

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {getInitials(host.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 flex items-center gap-1 truncate">
            <span className="text-sm">🏠</span>
            <span className="truncate">{host.name}</span>
          </p>
          <p className="text-sm text-gray-600 truncate">
            {addressFirstLine}
          </p>
        </div>
      </div>
    </div>
  )
})

HostInfo.displayName = 'HostInfo'

export default HostInfo
