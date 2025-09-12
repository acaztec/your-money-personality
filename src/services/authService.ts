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
        // Handle specific email confirmation error
        if (error.message.includes('Email not confirmed')) {
          return { 
            success: false, 
            error: 'Please check your email and click the confirmation link before logging in.' 
          }
        }
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Login failed' }
      }

      // Get advisor profile
      const advisor = await this.getAdvisorProfile(data.user.id)
      
      // If no advisor profile exists but user is confirmed, create it from user metadata
      if (!advisor && data.user.email_confirmed_at) {
        console.log('Creating missing advisor profile for confirmed user:', data.user.id)
        
        const name = data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Advisor'
        const company = data.user.user_metadata?.company || null
        
        const { data: profileData, error: profileError } = await supabase
          .from('advisor_profiles')
          .insert({
            user_id: data.user.id,
            name: name,
            company: company
          })
          .select()
          .single()
        
        if (!profileError && profileData) {
          advisor = {
            id: profileData.id,
            user_id: profileData.user_id,
            email: data.user.email!,
            name: profileData.name,
            company: profileData.company,
            created_at: profileData.created_at
          }
          console.log('Created advisor profile successfully:', advisor)
        } else {
          console.error('Failed to create advisor profile:', profileError)
          return { success: false, error: 'Failed to create advisor profile' }
        }
      }
      
      if (!advisor) {
        return { success: false, error: 'Advisor profile not found and could not be created' }
      }

      return { success: true, advisor }
    } catch (error) {
      console.error('Login error:', error)
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
      // Sign up user and force email confirmation to be bypassed
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/advisor/dashboard`,
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

      // Handle case where session might not be created due to email confirmation
      if (!authData.session && !authData.user.email_confirmed_at) {
        return { 
          success: false, 
          error: 'Account created but requires email confirmation. Please check your email and then login.' 
        }
      }
      
      // If user exists but no session (unconfirmed), try to sign them in
      if (!authData.session) {
        console.log('No session from signup, attempting to sign in user...')
        const signInResult = await this.login({ email: data.email, password: data.password })
        if (signInResult.success) {
          return { success: true, advisor: signInResult.advisor }
        } else {
          return { success: false, error: signInResult.error || 'Account created but login failed' }
        }
      }

      // Create advisor profile immediately
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
      console.log('Fetching advisor profile for userId:', userId)
      
      const { data, error } = await supabase
        .from('advisor_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      console.log('Advisor profile query result:', { data, error })

      if (error || !data) {
        if (error.code === 'PGRST116') {
          // No rows returned - this is expected for new users
          console.log('No advisor profile found (expected for new users)')
          return null
        }
        console.log('No advisor profile found or error:', error)
        return null
      }

      // Get user email
      const user = await this.getCurrentUser()
      console.log('Current user for profile:', user?.email)
      if (!user) return null

      const advisor = {
        id: data.id,
        user_id: data.user_id,
        email: user.email!,
        name: data.name,
        company: data.company,
        created_at: data.created_at
      }
      
      console.log('Returning advisor profile:', advisor)
      return advisor
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
  static onAuthStateChange(callback: (event: any, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}