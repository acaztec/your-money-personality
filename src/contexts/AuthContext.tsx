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
    let timeoutId: NodeJS.Timeout

    const restoreSession = async () => {
      try {
        console.log('Starting session restoration...')
        const currentAdvisor = await AuthService.getCurrentAdvisor()
        console.log('Current advisor result:', currentAdvisor)
        if (mounted) {
          setAdvisor(currentAdvisor)
        }
      } catch (error) {
        console.error('Error restoring session:', error)
        if (mounted) {
          setAdvisor(null)
        }
      } finally {
        if (mounted) {
          console.log('Session restoration complete, setting isLoading to false')
          setIsLoading(false)
        }
      }
    }

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.log('Auth timeout - forcing isLoading to false')
        setIsLoading(false)
      }
    }, 10000) // 10 second timeout

    restoreSession()

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email, 'User ID:', session?.user?.id)

      if (session?.user) {
        try {
          console.log('Attempting to fetch advisor profile for user:', session.user.id)
          const advisor = await AuthService.getAdvisorProfile(session.user.id)
          console.log('Advisor profile result:', advisor)
          setAdvisor(advisor)

          if (!advisor) {
            console.warn('No advisor profile found for user:', session.user.id)
          }
        } catch (error) {
          console.error('Error getting advisor profile:', error)
          setAdvisor(null)
        }
      } else {
        console.log('No session, setting advisor to null')
        setAdvisor(null)
      }

      console.log('Setting isLoading to false')
      setIsLoading(false)
      
      // Clear timeout since we got a definitive result
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    })

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
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