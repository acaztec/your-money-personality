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
    needsEmailConfirmation?: boolean
    error?: string 
  }> {
    try {
      // Sign up user - check if email confirmation is required
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

      // Check if email confirmation is required
      if (!authData.session && authData.user && !authData.user.email_confirmed_at) {
        return { 
          success: false,
          needsEmailConfirmation: true,
          error: 'Please check your email and click the confirmation link before proceeding.' 
        }
      }

      // If we have a session, the user is immediately available
      if (!authData.session) {
        return { 
          success: false, 
          error: 'User created but session not available. Please try logging in.' 
        }
      }

      // Create advisor profile using the authenticated user ID
      const { data: profileData, error: profileError } = await supabase
        .from('advisor_profiles')
        .insert({
          user_id: authData.session.user.id,
          name: data.name,
          company: data.company || null
        })
        .select()
        .single()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Handle foreign key constraint specifically
        if (profileError.code === '23503') {
          return { success: false, error: 'User authentication incomplete. Please try logging in instead.' }
        }
        return { success: false, error: `Profile creation failed: ${profileError.message}` }
      }

      const advisor: Advisor = {
        id: profileData.id,
        user_id: profileData.user_id,
        email: authData.session.user.email!,
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

  static async resendConfirmationEmail(email: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resend email'
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