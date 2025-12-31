/**
 * Card - Reusable card component with white background and rounded corners
 *
 * @param {ReactNode} children - Content to display inside the card
 * @param {string} className - Additional CSS classes
 */
const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-8 ${className}`}>
      {children}
    </div>
  )
}

export default Card
