import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useBoards } from './hooks/useBoards'
import { initializeDefaultBoard } from './utils/initializeDefaultBoard'
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

function AppRoutes() {
  const { user } = useAuth()
  const { boards, ready } = useBoards()
  const navigate = useNavigate()
  const initialized = useRef(false)

  useEffect(() => {
    if (!user || !ready || initialized.current) return
    if (boards.length === 0) {
      initialized.current = true
      initializeDefaultBoard(user.uid).then(boardId => {
        navigate(`/board/${boardId}`, { replace: true })
      })
    }
  }, [user, ready, boards.length, navigate])

  if (!user) return <LoginPage />

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-indigo-400 text-lg font-semibold">Loading...</div>
      </div>
    )
  }

  return (
    <PrivateLayout>
      <Routes>
        <Route
          path="/"
          element={
            !ready
              ? <div className="flex-1 flex items-center justify-center text-slate-400">Loading…</div>
              : boards.length > 0
                ? <Navigate to={`/board/${boards[0].id}`} replace />
                : <div className="flex-1 flex items-center justify-center text-slate-400">Setting up your board…</div>
          }
        />
        <Route path="/board/:boardId" element={<BoardPage />} />
      </Routes>
    </PrivateLayout>
  )
}

export default function App() {
  const { user } = useAuth()

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-indigo-400 text-lg font-semibold">Loading...</div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return <AppRoutes />
}
