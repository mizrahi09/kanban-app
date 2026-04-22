import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = still loading, null = not logged in, object = logged in
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    getRedirectResult(auth).catch(() => {})
    return onAuthStateChanged(auth, setUser)
  }, [])

  const login = () => signInWithRedirect(auth, googleProvider)
  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
