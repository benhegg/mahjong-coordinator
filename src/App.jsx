import { Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import CreateGroup from './components/CreateGroup'
import GroupCreated from './components/GroupCreated'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/group-created/:groupId/:inviteCode" element={<GroupCreated />} />
      </Routes>
    </div>
  )
}

export default App
