import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthService, Advisor, LoginCredentials, SignupData } from '../services/authService'

interface AuthContextType {
  advisor: Advisor | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [advisor, setAdvisor] = useState<Advisor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const restoreSession = async () => {
      try {
        const currentAdvisor = await AuthService.getCurrentAdvisor()
        if (mounted) {
          setAdvisor(currentAdvisor)
        }
      } catch (error) {
        if (mounted) {
          setAdvisor(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const advisor = await AuthService.getAdvisorProfile(session.user.id)
          if (advisor) {
            AuthService.storeAdvisorProfile(advisor)
          } else {
            AuthService.clearStoredAdvisorProfile()
          }
          setAdvisor(advisor)
        } catch (error) {
          AuthService.clearStoredAdvisorProfile()
          setAdvisor(null)
        }
      } else {
        AuthService.clearStoredAdvisorProfile()
        setAdvisor(null)
      }

      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const result = await AuthService.login(credentials)
    if (result.success && result.advisor) {
      setAdvisor(result.advisor)
    }
    return { success: result.success, error: result.error }
  }

  const signup = async (data: SignupData) => {
    const result = await AuthService.signup(data)
    if (result.success && result.advisor) {
      setAdvisor(result.advisor)
    }
    return { success: result.success, error: result.error }
  }

  const logout = async () => {
    await AuthService.logout()
    setAdvisor(null)
  }

  const value: AuthContextType = {
    advisor,
    isAuthenticated: !!advisor,
    isLoading,
    login,
    signup,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}