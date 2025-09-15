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
    let initialLoadComplete = false

    const restoreSession = async () => {
      try {
        // Get the session directly first
        const { data: { session } } = await AuthService.getSession()
        
        if (!session?.user) {
          if (mounted) {
            setAdvisor(null)
            setIsLoading(false)
            initialLoadComplete = true
          }
          return
        }

        // Try to get cached advisor profile first
        const cached = AuthService.getStoredAdvisorProfile()
        if (cached && cached.user_id === session.user.id) {
          if (mounted) {
            setAdvisor(cached)
            setIsLoading(false)
            initialLoadComplete = true
          }
          return
        }

        // Get advisor profile from database
        const advisor = await AuthService.getAdvisorProfile(session.user.id)
        if (mounted) {
          if (advisor) {
            // Build complete advisor object with email from session
            const completeAdvisor = {
              ...advisor,
              email: session.user.email!
            }
            AuthService.storeAdvisorProfile(completeAdvisor)
            setAdvisor(completeAdvisor)
          } else {
            setAdvisor(null)
          }
          setIsLoading(false)
          initialLoadComplete = true
        }
      } catch (error) {
        console.error('Error in restoreSession:', error)
        if (mounted) {
          setAdvisor(null)
          setIsLoading(false)
          initialLoadComplete = true
        }
      }
    }

    // Set up auth state listener first
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, !!session)
      
      if (!mounted) return

      if (session?.user) {
        try {
          // Check if we already have a cached profile for this user
          const cached = AuthService.getStoredAdvisorProfile()
          if (cached && cached.user_id === session.user.id) {
            setAdvisor(cached)
            if (initialLoadComplete) {
              setIsLoading(false)
            }
            return
          }

          // Get fresh advisor profile
          const advisorProfile = await AuthService.getAdvisorProfile(session.user.id)
          const advisor = advisorProfile ? {
            ...advisorProfile,
            email: session.user.email!
          } : null

          if (advisor) {
            AuthService.storeAdvisorProfile(advisor)
          } else {
            AuthService.clearStoredAdvisorProfile()
          }
          setAdvisor(advisor)
        } catch (error) {
          console.error('Error in auth state change:', error)
          AuthService.clearStoredAdvisorProfile()
          setAdvisor(null)
        }
      } else {
        AuthService.clearStoredAdvisorProfile()
        setAdvisor(null)
      }

      // Only set loading to false if initial load is complete
      // This prevents the auth state listener from interfering with initial load
      if (initialLoadComplete) {
        setIsLoading(false)
      }
    })

    // Start the session restoration after listener is set up
    restoreSession()

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