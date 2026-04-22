import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, token as tokenStore } from '../lib/api'

interface AuthState {
  email: string | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ email: null, loading: true })

  useEffect(() => {
    const t = tokenStore.get()
    if (!t) {
      setState({ email: null, loading: false })
      return
    }
    api
      .me()
      .then((r) => setState({ email: r.email, loading: false }))
      .catch(() => {
        tokenStore.clear()
        setState({ email: null, loading: false })
      })
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    tokenStore.set(res.token)
    setState({ email: res.email, loading: false })
  }, [])

  const logout = useCallback(() => {
    tokenStore.clear()
    setState({ email: null, loading: false })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: !!state.email,
      login,
      logout,
    }),
    [state, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
