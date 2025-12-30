import { Routes, Route } from 'react-router-dom'
import Login from './components/Login'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </div>
  )
}

export default App
