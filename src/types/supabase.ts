// Placeholder for generated Supabase types.
// Run: npx supabase gen types typescript --linked > src/types/supabase.ts
// to replace this with the real generated types once you have a Supabase project.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          custom_questions: Json | null
          active: boolean
          created_at: string
          brand_color: string | null
          welcome_message: string | null
          excluded_question_codes: string[] | null
          product_id: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          custom_questions?: Json | null
          active?: boolean
          created_at?: string
          brand_color?: string | null
          welcome_message?: string | null
          excluded_question_codes?: string[] | null
          product_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          custom_questions?: Json | null
          active?: boolean
          created_at?: string
          brand_color?: string | null
          welcome_message?: string | null
          excluded_question_codes?: string[] | null
          product_id?: string | null
        }
        Relationships: []
      }
      interest_registrations: {
        Row: {
          id: string
          service_key: 'intro_session' | 'intro_training' | 'ai_coding' | 'clevel_training' | 'custom_project'
          respondent_id: string | null
          name: string
          email: string
          options: Json
          created_at: string
        }
        Insert: {
          id?: string
          service_key: 'intro_session' | 'intro_training' | 'ai_coding' | 'clevel_training' | 'custom_project'
          respondent_id?: string | null
          name: string
          email: string
          options?: Json
          created_at?: string
        }
        Update: {
          id?: string
          service_key?: 'intro_session' | 'intro_training' | 'ai_coding' | 'clevel_training' | 'custom_project'
          respondent_id?: string | null
          name?: string
          email?: string
          options?: Json
          created_at?: string
        }
        Relationships: []
      }
      quiz_products: {
        Row: {
          id: string
          key: string
          name: string
          subdomain: string | null
          description: string | null
          active: boolean
          questions_config: Json | null
          scoring_config: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          name: string
          subdomain?: string | null
          description?: string | null
          active?: boolean
          questions_config?: Json | null
          scoring_config?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          name?: string
          subdomain?: string | null
          description?: string | null
          active?: boolean
          questions_config?: Json | null
          scoring_config?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      cohorts: {
        Row: {
          id: string
          company_id: string
          name: string
          date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      respondents: {
        Row: {
          id: string
          cohort_id: string | null
          company_id: string | null
          name: string
          email: string
          job_title: string
          company_name: string
          industry: string | null
          company_size: string | null
          source: string
          gdpr_consent: boolean
          calendly_status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cohort_id?: string | null
          company_id?: string | null
          name: string
          email: string
          job_title: string
          company_name: string
          industry?: string | null
          company_size?: string | null
          source: string
          gdpr_consent: boolean
          calendly_status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string | null
          company_id?: string | null
          name?: string
          email?: string
          job_title?: string
          company_name?: string
          industry?: string | null
          company_size?: string | null
          source?: string
          gdpr_consent?: boolean
          calendly_status?: string | null
          created_at?: string
        }
        Relationships: []
      }
      responses: {
        Row: {
          id: string
          respondent_id: string
          quiz_version: string
          attempt_number: number
          answers: Json
          scores: Json
          maturity_level: string
          shadow_ai_flag: boolean
          shadow_ai_severity: string | null
          recommendation_payload: Json
          product_key: string
          created_at: string
        }
        Insert: {
          id?: string
          respondent_id: string
          quiz_version: string
          attempt_number?: number
          answers: Json
          scores: Json
          maturity_level: string
          shadow_ai_flag?: boolean
          shadow_ai_severity?: string | null
          recommendation_payload: Json
          product_key?: string
          created_at?: string
        }
        Update: {
          id?: string
          respondent_id?: string
          quiz_version?: string
          attempt_number?: number
          answers?: Json
          scores?: Json
          maturity_level?: string
          shadow_ai_flag?: boolean
          shadow_ai_severity?: string | null
          recommendation_payload?: Json
          product_key?: string
          created_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          dimension: string
          code: string
          text: string
          type: string
          options: Json
          weight: number
          is_custom: boolean
          company_id: string | null
          lite: boolean
          active: boolean
        }
        Insert: {
          id?: string
          dimension: string
          code: string
          text: string
          type: string
          options: Json
          weight?: number
          is_custom?: boolean
          company_id?: string | null
          lite?: boolean
          active?: boolean
        }
        Update: {
          id?: string
          dimension?: string
          code?: string
          text?: string
          type?: string
          options?: Json
          weight?: number
          is_custom?: boolean
          company_id?: string | null
          lite?: boolean
          active?: boolean
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          respondent_id: string | null
          quiz_version: string
          session_status: string
          quiz_model_version: string
          results_access_mode: string
          benchmark_eligible: boolean
          consent_timestamp: string | null
          privacy_notice_version: string | null
          created_at: string
        }
        Insert: {
          id?: string
          respondent_id?: string | null
          quiz_version: string
          session_status?: string
          quiz_model_version?: string
          results_access_mode?: string
          benchmark_eligible?: boolean
          consent_timestamp?: string | null
          privacy_notice_version?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          respondent_id?: string | null
          quiz_version?: string
          session_status?: string
          quiz_model_version?: string
          results_access_mode?: string
          benchmark_eligible?: boolean
          consent_timestamp?: string | null
          privacy_notice_version?: string | null
          created_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      arena_questions: {
        Row: {
          id: string
          product_key: string
          question_text: string
          options: Json
          correct_value: string
          explanation: string | null
          difficulty: string
          topic: string | null
          ai_generated: boolean
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_key?: string
          question_text: string
          options: Json
          correct_value: string
          explanation?: string | null
          difficulty?: string
          topic?: string | null
          ai_generated?: boolean
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_key?: string
          question_text?: string
          options?: Json
          correct_value?: string
          explanation?: string | null
          difficulty?: string
          topic?: string | null
          ai_generated?: boolean
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      arena_sessions: {
        Row: {
          id: string
          company_id: string | null
          join_code: string
          host_name: string
          status: string
          question_count: number
          time_per_q: number
          questions: Json
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          join_code: string
          host_name: string
          status?: string
          question_count?: number
          time_per_q?: number
          questions?: Json
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          join_code?: string
          host_name?: string
          status?: string
          question_count?: number
          time_per_q?: number
          questions?: Json
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      arena_participants: {
        Row: {
          id: string
          session_id: string
          display_name: string
          email: string | null
          score: number
          rank: number | null
          joined_at: string
        }
        Insert: {
          id?: string
          session_id: string
          display_name: string
          email?: string | null
          score?: number
          rank?: number | null
          joined_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          display_name?: string
          email?: string | null
          score?: number
          rank?: number | null
          joined_at?: string
        }
        Relationships: []
      }
      arena_answers: {
        Row: {
          id: string
          session_id: string
          participant_id: string
          question_index: number
          answer_value: string
          is_correct: boolean
          time_taken_ms: number | null
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          participant_id: string
          question_index: number
          answer_value: string
          is_correct: boolean
          time_taken_ms?: number | null
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          participant_id?: string
          question_index?: number
          answer_value?: string
          is_correct?: boolean
          time_taken_ms?: number | null
          points?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
