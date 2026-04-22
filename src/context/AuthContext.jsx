import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = still loading, null = not logged in, object = logged in
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    getRedirectResult(auth)
      .then(result => console.log('redirect result:', result?.user?.email ?? 'no user'))
      .catch(err => console.error('redirect error:', err?.code, err?.message))
    return onAuthStateChanged(auth, user => {
      console.log('auth state changed:', user?.email ?? 'null')
      setUser(user)
    })
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
