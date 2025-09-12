import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Advisor {
  id: string
  email: string
  name: string
  company?: string | null
  user_id: string
  created_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  name: string
  company?: string
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ 
    success: boolean
    advisor?: Advisor
    error?: string 
  }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Login failed' }
      }

      // Get advisor profile
      const advisor = await this.getAdvisorProfile(data.user.id)
      if (!advisor) {
        return { success: false, error: 'Advisor profile not found' }
      }

      return { success: true, advisor }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }
    }
  }

  static async signup(data: SignupData): Promise<{ 
    success: boolean
    advisor?: Advisor
    error?: string 
  }> {
    try {
      // Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            company: data.company || null
          }
        }
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      if (!authData.user) {
        return { success: false, error: 'Signup failed' }
      }

      // Wait for the session to be fully established
      let retries = 0
      let session = null
      
      while (!session && retries < 10) {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        session = currentSession
        if (!session) {
          await new Promise(resolve => setTimeout(resolve, 200))
          retries++
        }
      }

      if (!session) {
        return { success: false, error: 'Failed to establish authentication session' }
      }

      // Create advisor profile
      const { data: profileData, error: profileError } = await supabase
        .from('advisor_profiles')
        .insert({
          user_id: session.user.id,
          name: data.name,
          company: data.company || null
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // If it's an RLS error, provide more context
        if (profileError.code === '42501') {
          return { success: false, error: 'Authentication error during profile creation. Please try logging in.' }
        }
        return { success: false, error: profileError.message }
      }

      const advisor: Advisor = {
        id: profileData.id,
        user_id: profileData.user_id,
        email: session.user.email!,
        name: profileData.name,
        company: profileData.company,
        created_at: profileData.created_at
      }

      return { success: true, advisor }
    } catch (error) {
      console.error('Signup error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      }
    }
  }

  static async logout(): Promise<void> {
    await supabase.auth.signOut()
  }

  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static async getCurrentAdvisor(): Promise<Advisor | null> {
    try {
      const user = await this.getCurrentUser()
      if (!user) return null

      return await this.getAdvisorProfile(user.id)
    } catch (error) {
      console.error('Error getting current advisor:', error)
      return null
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  }

  static async getAdvisorProfile(userId: string): Promise<Advisor | null> {
    try {
      const { data, error } = await supabase
        .from('advisor_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !data) {
        return null
      }

      // Get user email
      const user = await this.getCurrentUser()
      if (!user) return null

      return {
        id: data.id,
        user_id: data.user_id,
        email: user.email!,
        name: data.name,
        company: data.company,
        created_at: data.created_at
      }
    } catch (error) {
      console.error('Error getting advisor profile:', error)
      return null
    }
  }

  static async getAdvisorById(advisorId: string): Promise<Advisor | null> {
    try {
      const { data, error } = await supabase
        .from('advisor_profiles')
        .select('*')
        .eq('id', advisorId)
        .single()

      if (error || !data) {
        return null
      }

      // Get user details
      const { data: userData } = await supabase.auth.admin.getUserById(data.user_id)
      if (!userData.user) return null

      return {
        id: data.id,
        user_id: data.user_id,
        email: userData.user.email!,
        name: data.name,
        company: data.company,
        created_at: data.created_at
      }
    } catch (error) {
      console.error('Error getting advisor by ID:', error)
      return null
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (advisor: Advisor | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const advisor = await this.getAdvisorProfile(session.user.id)
        callback(advisor)
      } else {
        callback(null)
      }
    })
  }
}