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
    // Check initial auth state
    const initAuth = async () => {
      try {
        const currentAdvisor = await AuthService.getCurrentAdvisor()
        setAdvisor(currentAdvisor)
      } catch (error) {
        console.error('Error checking auth state:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((advisor) => {
      setAdvisor(advisor)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
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