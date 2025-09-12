import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      advisor_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          company: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          company?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          company?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assessment_results: {
        Row: {
          id: string
          assessment_id: string
          advisor_email: string
          client_email: string
          client_name: string | null
          answers: any
          profile: any
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          assessment_id: string
          advisor_email: string
          client_email: string
          client_name?: string | null
          answers: any
          profile: any
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          assessment_id?: string
          advisor_email?: string
          client_email?: string
          client_name?: string | null
          answers?: any
          profile?: any
          completed_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}