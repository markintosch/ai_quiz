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
          organisation: string | null
          access_code: string | null
          client_token: string | null
          client_link_expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          date?: string | null
          organisation?: string | null
          access_code?: string | null
          client_token?: string | null
          client_link_expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          date?: string | null
          organisation?: string | null
          access_code?: string | null
          client_token?: string | null
          client_link_expires_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      cohort_waves: {
        Row: {
          id: string
          cohort_id: string
          wave_number: number
          label: string
          wave_date: string | null
          is_open: boolean
          created_at: string
        }
        Insert: {
          id?: string
          cohort_id: string
          wave_number: number
          label?: string
          wave_date?: string | null
          is_open?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string
          wave_number?: number
          label?: string
          wave_date?: string | null
          is_open?: boolean
          created_at?: string
        }
        Relationships: []
      }
      cohort_responses: {
        Row: {
          id: string
          cohort_id: string
          wave_id: string
          response_id: string
          created_at: string
        }
        Insert: {
          id?: string
          cohort_id: string
          wave_id: string
          response_id: string
          created_at?: string
        }
        Update: {
          id?: string
          cohort_id?: string
          wave_id?: string
          response_id?: string
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
      pulse_suggestions: {
        Row: {
          id: string
          theme_id: string
          suggestion: string
          email: string | null
          marketing_consent: boolean
          ip_hash: string | null
          created_at: string
        }
        Insert: {
          id?: string
          theme_id: string
          suggestion: string
          email?: string | null
          marketing_consent?: boolean
          ip_hash?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          theme_id?: string
          suggestion?: string
          email?: string | null
          marketing_consent?: boolean
          ip_hash?: string | null
          created_at?: string
        }
        Relationships: []
      }
      pulse_responses: {
        Row: {
          id: string
          theme_id: string
          subject_slug: string
          scores: Json
          respondent_num: number | null
          email: string | null
          marketing_consent: boolean
          ip_hash: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          theme_id: string
          subject_slug: string
          scores: Json
          respondent_num?: number | null
          email?: string | null
          marketing_consent?: boolean
          ip_hash?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          theme_id?: string
          subject_slug?: string
          scores?: Json
          respondent_num?: number | null
          email?: string | null
          marketing_consent?: boolean
          ip_hash?: string | null
          submitted_at?: string
        }
        Relationships: []
      }
      pulse_themes: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          editorial_intro: string | null
          linked_episode_url: string | null
          presub_open_at: string | null
          presub_close_at: string | null
          opens_at: string | null
          closes_at: string | null
          published: boolean
          disclaimer_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          editorial_intro?: string | null
          linked_episode_url?: string | null
          presub_open_at?: string | null
          presub_close_at?: string | null
          opens_at?: string | null
          closes_at?: string | null
          published?: boolean
          disclaimer_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          editorial_intro?: string | null
          linked_episode_url?: string | null
          presub_open_at?: string | null
          presub_close_at?: string | null
          opens_at?: string | null
          closes_at?: string | null
          published?: boolean
          disclaimer_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pulse_entities: {
        Row: {
          id: string
          theme_id: string
          entity_type: string
          slug: string
          label: string
          subtitle: string | null
          description_short: string | null
          source_url: string | null
          source_domain: string | null
          canonical_url: string | null
          hero_image_url: string | null
          og_image_url: string | null
          logo_url: string | null
          location_text: string | null
          organizer_name: string | null
          start_date: string | null
          end_date: string | null
          edition_label: string | null
          ingest_status: string
          metadata_reviewed_by: string | null
          last_fetched_at: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          theme_id: string
          entity_type?: string
          slug: string
          label: string
          subtitle?: string | null
          description_short?: string | null
          source_url?: string | null
          source_domain?: string | null
          canonical_url?: string | null
          hero_image_url?: string | null
          og_image_url?: string | null
          logo_url?: string | null
          location_text?: string | null
          organizer_name?: string | null
          start_date?: string | null
          end_date?: string | null
          edition_label?: string | null
          ingest_status?: string
          metadata_reviewed_by?: string | null
          last_fetched_at?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          theme_id?: string
          entity_type?: string
          slug?: string
          label?: string
          subtitle?: string | null
          description_short?: string | null
          source_url?: string | null
          source_domain?: string | null
          canonical_url?: string | null
          hero_image_url?: string | null
          og_image_url?: string | null
          logo_url?: string | null
          location_text?: string | null
          organizer_name?: string | null
          start_date?: string | null
          end_date?: string | null
          edition_label?: string | null
          ingest_status?: string
          metadata_reviewed_by?: string | null
          last_fetched_at?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      pulse_dimensions: {
        Row: {
          id: string
          theme_id: string
          slug: string
          label: string
          anchor_low: string
          anchor_high: string
          weight: number
          editorial_note: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          theme_id: string
          slug: string
          label: string
          anchor_low: string
          anchor_high: string
          weight?: number
          editorial_note?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          theme_id?: string
          slug?: string
          label?: string
          anchor_low?: string
          anchor_high?: string
          weight?: number
          editorial_note?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      pulse_responses_v2: {
        Row: {
          id: string
          theme_id: string | null
          entity_id: string | null
          respondent_id: string | null
          scores: Json
          respondent_num: number | null
          submitted_at: string
          ip_hash: string | null
          session_hash: string | null
          revision_of: string | null
        }
        Insert: {
          id?: string
          theme_id?: string | null
          entity_id?: string | null
          respondent_id?: string | null
          scores: Json
          respondent_num?: number | null
          submitted_at?: string
          ip_hash?: string | null
          session_hash?: string | null
          revision_of?: string | null
        }
        Update: {
          id?: string
          theme_id?: string | null
          entity_id?: string | null
          respondent_id?: string | null
          scores?: Json
          respondent_num?: number | null
          submitted_at?: string
          ip_hash?: string | null
          session_hash?: string | null
          revision_of?: string | null
        }
        Relationships: []
      }
      pulse_leads: {
        Row: {
          id: string
          email: string
          theme_id: string | null
          consent_marketing: boolean
          consent_results: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          theme_id?: string | null
          consent_marketing?: boolean
          consent_results?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          theme_id?: string | null
          consent_marketing?: boolean
          consent_results?: boolean
          created_at?: string
        }
        Relationships: []
      }
      pulse_suggestions_v2: {
        Row: {
          id: string
          theme_id: string | null
          suggested_label: string
          suggested_url: string | null
          suggested_by_email: string | null
          vote_count: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          theme_id?: string | null
          suggested_label: string
          suggested_url?: string | null
          suggested_by_email?: string | null
          vote_count?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          theme_id?: string | null
          suggested_label?: string
          suggested_url?: string | null
          suggested_by_email?: string | null
          vote_count?: number
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      pulse_agent_profiles: {
        Row: {
          id: string
          entity_id: string
          generated_title: string | null
          generated_summary: string | null
          generated_tags: Json | null
          generated_fields: Json | null
          confidence_flags: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          entity_id: string
          generated_title?: string | null
          generated_summary?: string | null
          generated_tags?: Json | null
          generated_fields?: Json | null
          confidence_flags?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          entity_id?: string
          generated_title?: string | null
          generated_summary?: string | null
          generated_tags?: Json | null
          generated_fields?: Json | null
          confidence_flags?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      pulse_anomaly_flags: {
        Row: {
          id: string
          theme_id: string | null
          entity_id: string | null
          flag_type: string | null
          severity: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          theme_id?: string | null
          entity_id?: string | null
          flag_type?: string | null
          severity?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          theme_id?: string | null
          entity_id?: string | null
          flag_type?: string | null
          severity?: string | null
          details?: Json | null
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
