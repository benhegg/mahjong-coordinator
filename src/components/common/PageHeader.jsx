/**
 * PageHeader - Reusable component for page headers with emoji, title, and subtitle
 *
 * @param {string} emoji - Emoji to display (default: 🀄)
 * @param {string} title - Main title text
 * @param {string} subtitle - Subtitle or description text
 */
const PageHeader = ({ emoji = '🀄', title, subtitle }) => {
  return (
    <div className="text-center mb-8">
      <div className="text-6xl mb-4">{emoji}</div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-gray-600">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default PageHeader
