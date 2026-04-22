import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    try {
      setError(null)
      await login()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.error('Login error:', err?.code, err?.message)
        setError('Sign in failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">⚡</div>
        <h1 className="text-2xl font-extrabold text-indigo-900 mb-2">KanbanApp</h1>
        <p className="text-slate-400 text-sm mb-8">Your team's task board, simplified.</p>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>
        {error && (
          <p className="text-red-400 text-xs mt-3">{error}</p>
        )}
      </div>
    </div>
  )
}
