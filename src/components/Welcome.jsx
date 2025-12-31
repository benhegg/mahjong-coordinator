import { useNavigate } from 'react-router-dom'

const Welcome = () => {
  const navigate = useNavigate()

  const handleCreateGroup = () => {
    navigate('/create-group')
  }

  const handleJoinGroup = () => {
    navigate('/join')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🀄</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to Mahjong Night!
            </h1>
            <p className="text-gray-600">
              Get started by creating or joining a group
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Create Group */}
            <button
              onClick={handleCreateGroup}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-4 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 shadow-md"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">➕</span>
                <div className="text-left">
                  <div className="font-bold">Create a Group</div>
                  <div className="text-sm text-pink-100">Start your own mahjong game</div>
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Join Group */}
            <button
              onClick={handleJoinGroup}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition duration-200"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">🎯</span>
                <div className="text-left">
                  <div className="font-bold">Join a Group</div>
                  <div className="text-sm text-gray-500">Enter an invite code</div>
                </div>
              </div>
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              You can create multiple groups or join existing ones
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome
