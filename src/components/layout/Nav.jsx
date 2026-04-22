import { useAuth } from '../../context/AuthContext'

export default function Nav() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white border-b border-indigo-100 px-5 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-6">
        <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          ⚡ KanbanApp
        </span>
      </div>
      <div className="flex items-center gap-3">
        <img
          src={user?.photoURL}
          alt={user?.displayName}
          className="w-8 h-8 rounded-full border-2 border-indigo-200"
        />
        <button
          onClick={logout}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
