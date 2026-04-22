import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './components/auth/LoginPage'
import BoardPage from './components/boards/BoardPage'
import Nav from './components/layout/Nav'
import Sidebar from './components/layout/Sidebar'

function PrivateLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-indigo-50/40">
      <Nav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()

  // Still loading Firebase auth state
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-indigo-400 text-lg font-semibold">Loading...</div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return (
    <PrivateLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/board/home" replace />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
      </Routes>
    </PrivateLayout>
  )
}
