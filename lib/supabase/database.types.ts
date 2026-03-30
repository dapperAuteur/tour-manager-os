export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      advance_contacts: {
        Row: {
          address: string | null
          advance_sheet_id: string
          company_name: string | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          fax: string | null
          id: string
          mobile: string | null
          notes: string | null
          phone: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          advance_sheet_id: string
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          fax?: string | null
          id?: string
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          advance_sheet_id?: string
          company_name?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          fax?: string | null
          id?: string
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advance_contacts_advance_sheet_id_fkey"
            columns: ["advance_sheet_id"]
            isOneToOne: false
            referencedRelation: "advance_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      advance_other_artists: {
        Row: {
          advance_sheet_id: string
          artist_name: string
          created_at: string | null
          id: string
          set_length_minutes: number | null
          slot: string | null
          sort_order: number | null
        }
        Insert: {
          advance_sheet_id: string
          artist_name: string
          created_at?: string | null
          id?: string
          set_length_minutes?: number | null
          slot?: string | null
          sort_order?: number | null
        }
        Update: {
          advance_sheet_id?: string
          artist_name?: string
          created_at?: string | null
          id?: string
          set_length_minutes?: number | null
          slot?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "advance_other_artists_advance_sheet_id_fkey"
            columns: ["advance_sheet_id"]
            isOneToOne: false
            referencedRelation: "advance_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      advance_sheets: {
        Row: {
          caterer_name: string | null
          caterer_phone: string | null
          created_at: string | null
          curfew_time: string | null
          delay_unit_type: string | null
          doors_time: string | null
          dressing_room_count: number | null
          dressing_room_location: string | null
          dressing_room_lockable: boolean | null
          dressing_room_shower: boolean | null
          dressing_room_toilet: boolean | null
          dressing_room_washbasin: boolean | null
          has_backstage_parking: boolean | null
          has_rear_door: boolean | null
          has_smoke_machines: boolean | null
          has_stage_door: boolean | null
          hospitality_provider_name: string | null
          hospitality_provider_phone: string | null
          id: string
          meal_times: string | null
          merch_area_description: string | null
          merch_split: string | null
          metadata: Json | null
          number_of_performances: number | null
          pa_system: string | null
          per_diem_amount: number | null
          per_diem_contact_name: string | null
          performance_length_minutes: number | null
          radio_mic_type: string | null
          reverb_unit_type: string | null
          security_guard_name: string | null
          security_guard_phone: string | null
          show_format: string | null
          show_id: string
          smoke_machine_notes: string | null
          smoking_allowed: boolean | null
          sound_company_email: string | null
          sound_company_name: string | null
          sound_company_phone: string | null
          soundcheck_time: string | null
          stage_depth: number | null
          stage_height: number | null
          stage_time: string | null
          stage_width: number | null
          status: string
          submitted_at: string | null
          ticket_price: number | null
          token: string
          total_gross: number | null
          updated_at: string | null
          venue_address: string | null
          venue_backstage_phone: string | null
          venue_capacity: number | null
          venue_fax: string | null
          venue_phone: string | null
          venue_type: string | null
        }
        Insert: {
          caterer_name?: string | null
          caterer_phone?: string | null
          created_at?: string | null
          curfew_time?: string | null
          delay_unit_type?: string | null
          doors_time?: string | null
          dressing_room_count?: number | null
          dressing_room_location?: string | null
          dressing_room_lockable?: boolean | null
          dressing_room_shower?: boolean | null
          dressing_room_toilet?: boolean | null
          dressing_room_washbasin?: boolean | null
          has_backstage_parking?: boolean | null
          has_rear_door?: boolean | null
          has_smoke_machines?: boolean | null
          has_stage_door?: boolean | null
          hospitality_provider_name?: string | null
          hospitality_provider_phone?: string | null
          id?: string
          meal_times?: string | null
          merch_area_description?: string | null
          merch_split?: string | null
          metadata?: Json | null
          number_of_performances?: number | null
          pa_system?: string | null
          per_diem_amount?: number | null
          per_diem_contact_name?: string | null
          performance_length_minutes?: number | null
          radio_mic_type?: string | null
          reverb_unit_type?: string | null
          security_guard_name?: string | null
          security_guard_phone?: string | null
          show_format?: string | null
          show_id: string
          smoke_machine_notes?: string | null
          smoking_allowed?: boolean | null
          sound_company_email?: string | null
          sound_company_name?: string | null
          sound_company_phone?: string | null
          soundcheck_time?: string | null
          stage_depth?: number | null
          stage_height?: number | null
          stage_time?: string | null
          stage_width?: number | null
          status?: string
          submitted_at?: string | null
          ticket_price?: number | null
          token?: string
          total_gross?: number | null
          updated_at?: string | null
          venue_address?: string | null
          venue_backstage_phone?: string | null
          venue_capacity?: number | null
          venue_fax?: string | null
          venue_phone?: string | null
          venue_type?: string | null
        }
        Update: {
          caterer_name?: string | null
          caterer_phone?: string | null
          created_at?: string | null
          curfew_time?: string | null
          delay_unit_type?: string | null
          doors_time?: string | null
          dressing_room_count?: number | null
          dressing_room_location?: string | null
          dressing_room_lockable?: boolean | null
          dressing_room_shower?: boolean | null
          dressing_room_toilet?: boolean | null
          dressing_room_washbasin?: boolean | null
          has_backstage_parking?: boolean | null
          has_rear_door?: boolean | null
          has_smoke_machines?: boolean | null
          has_stage_door?: boolean | null
          hospitality_provider_name?: string | null
          hospitality_provider_phone?: string | null
          id?: string
          meal_times?: string | null
          merch_area_description?: string | null
          merch_split?: string | null
          metadata?: Json | null
          number_of_performances?: number | null
          pa_system?: string | null
          per_diem_amount?: number | null
          per_diem_contact_name?: string | null
          performance_length_minutes?: number | null
          radio_mic_type?: string | null
          reverb_unit_type?: string | null
          security_guard_name?: string | null
          security_guard_phone?: string | null
          show_format?: string | null
          show_id?: string
          smoke_machine_notes?: string | null
          smoking_allowed?: boolean | null
          sound_company_email?: string | null
          sound_company_name?: string | null
          sound_company_phone?: string | null
          soundcheck_time?: string | null
          stage_depth?: number | null
          stage_height?: number | null
          stage_time?: string | null
          stage_width?: number | null
          status?: string
          submitted_at?: string | null
          ticket_price?: number | null
          token?: string
          total_gross?: number | null
          updated_at?: string | null
          venue_address?: string | null
          venue_backstage_phone?: string | null
          venue_capacity?: number | null
          venue_fax?: string | null
          venue_phone?: string | null
          venue_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advance_sheets_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: true
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      album_media: {
        Row: {
          album_id: string
          caption: string | null
          created_at: string | null
          id: string
          media_type: string
          sort_order: number | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          album_id: string
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type: string
          sort_order?: number | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          album_id?: string
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type?: string
          sort_order?: number | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_media_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "shared_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          org_id: string
          rate_limit: number | null
          scopes: Json | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          org_id: string
          rate_limit?: number | null
          scopes?: Json | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          org_id?: string
          rate_limit?: number | null
          scopes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_logs: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          method: string
          path: string
          response_time_ms: number | null
          status_code: number | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          method: string
          path: string
          response_time_ms?: number | null
          status_code?: number | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          method?: string
          path?: string
          response_time_ms?: number | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      audio_comments: {
        Row: {
          audio_id: string
          content: string
          created_at: string | null
          id: string
          timestamp_seconds: number | null
          user_id: string
        }
        Insert: {
          audio_id: string
          content: string
          created_at?: string | null
          id?: string
          timestamp_seconds?: number | null
          user_id: string
        }
        Update: {
          audio_id?: string
          content?: string
          created_at?: string | null
          id?: string
          timestamp_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_comments_audio_id_fkey"
            columns: ["audio_id"]
            isOneToOne: false
            referencedRelation: "shared_audio"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          audio_url: string | null
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          linked_products: Json | null
          linked_shows: Json | null
          linked_venues: Json | null
          org_id: string
          published: boolean | null
          slug: string
          tags: Json | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          author_id?: string | null
          content: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          linked_products?: Json | null
          linked_shows?: Json | null
          linked_venues?: Json | null
          org_id: string
          published?: boolean | null
          slug: string
          tags?: Json | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          linked_products?: Json | null
          linked_shows?: Json | null
          linked_venues?: Json | null
          org_id?: string
          published?: boolean | null
          slug?: string
          tags?: Json | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      checkin_responses: {
        Row: {
          checkin_id: string
          created_at: string | null
          id: string
          mood: number | null
          response: string
          user_id: string
        }
        Insert: {
          checkin_id: string
          created_at?: string | null
          id?: string
          mood?: number | null
          response: string
          user_id: string
        }
        Update: {
          checkin_id?: string
          created_at?: string | null
          id?: string
          mood?: number | null
          response?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkin_responses_checkin_id_fkey"
            columns: ["checkin_id"]
            isOneToOne: false
            referencedRelation: "family_checkins"
            referencedColumns: ["id"]
          },
        ]
      }
      community_categories: {
        Row: {
          access_level: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "community_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_id: string
          category_id: string
          content: string
          created_at: string | null
          id: string
          locked: boolean | null
          pinned: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          category_id: string
          content: string
          created_at?: string | null
          id?: string
          locked?: boolean | null
          pinned?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          category_id?: string
          content?: string
          created_at?: string | null
          id?: string
          locked?: boolean | null
          pinned?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "community_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      community_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          difficulty: string | null
          estimated_minutes: number | null
          id: string
          published: boolean | null
          slug: string
          sort_order: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          id?: string
          published?: boolean | null
          slug: string
          sort_order?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_minutes?: number | null
          id?: string
          published?: boolean | null
          slug?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      custom_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          org_id: string
          ssl_provisioned: boolean | null
          updated_at: string | null
          verification_token: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          org_id: string
          ssl_provisioned?: boolean | null
          updated_at?: string | null
          verification_token?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          org_id?: string
          ssl_provisioned?: boolean | null
          updated_at?: string | null
          verification_token?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_domains_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      deduction_categories: {
        Row: {
          description: string | null
          id: string
          irs_guidance: string | null
          name: string
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          id: string
          irs_guidance?: string | null
          name: string
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          irs_guidance?: string | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          clicked_count: number | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          list_id: string | null
          opened_count: number | null
          org_id: string
          recipients_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          clicked_count?: number | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          list_id?: string | null
          opened_count?: number | null
          org_id: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          clicked_count?: number | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          list_id?: string | null
          opened_count?: number | null
          org_id?: string
          recipients_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_campaigns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_campaigns_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_lists: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_lists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_subscribers: {
        Row: {
          city: string | null
          email: string
          id: string
          list_id: string
          name: string | null
          source: string | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          city?: string | null
          email: string
          id?: string
          list_id: string
          name?: string | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          city?: string | null
          email?: string
          id?: string
          list_id?: string
          name?: string | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_subscribers_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "email_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          category: string
          condition: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          owner: string | null
          purchase_date: string | null
          purchase_price: number | null
          quantity: number | null
          serial_number: string | null
          travels_with_band: boolean | null
          updated_at: string | null
        }
        Insert: {
          category: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          owner?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number | null
          serial_number?: string | null
          travels_with_band?: boolean | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          condition?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          owner?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          quantity?: number | null
          serial_number?: string | null
          travels_with_band?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          is_tax_deductible: boolean | null
          member_id: string | null
          notes: string | null
          receipt_url: string | null
          show_id: string | null
          status: string
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          is_tax_deductible?: boolean | null
          member_id?: string | null
          notes?: string | null
          receipt_url?: string | null
          show_id?: string | null
          status?: string
          tour_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          is_tax_deductible?: boolean | null
          member_id?: string | null
          notes?: string | null
          receipt_url?: string | null
          show_id?: string | null
          status?: string
          tour_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      family_checkins: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          org_id: string
          prompt: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          org_id: string
          prompt: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          org_id?: string
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_checkins_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          sender_id: string | null
          sender_role: string
          thread_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          sender_role?: string
          thread_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string | null
          sender_role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "feedback_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_notifications: {
        Row: {
          created_at: string | null
          id: string
          read: boolean | null
          recipient_id: string
          thread_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id: string
          thread_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_notifications_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "feedback_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_threads: {
        Row: {
          category: string
          created_at: string | null
          id: string
          org_id: string | null
          priority: string
          status: string
          subject: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          org_id?: string | null
          priority?: string
          status?: string
          subject: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          org_id?: string | null
          priority?: string
          status?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_threads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      flights: {
        Row: {
          airline: string | null
          arrival_city: string | null
          arrival_time: string | null
          confirmation_number: string | null
          connecting_airline: string | null
          connecting_arrival_city: string | null
          connecting_arrival_time: string | null
          connecting_departure_time: string | null
          connecting_flight_number: string | null
          created_at: string | null
          departure_city: string | null
          departure_time: string | null
          flight_number: string | null
          id: string
          itinerary_day_id: string
          notes: string | null
          reserved_by: string | null
          sort_order: number | null
        }
        Insert: {
          airline?: string | null
          arrival_city?: string | null
          arrival_time?: string | null
          confirmation_number?: string | null
          connecting_airline?: string | null
          connecting_arrival_city?: string | null
          connecting_arrival_time?: string | null
          connecting_departure_time?: string | null
          connecting_flight_number?: string | null
          created_at?: string | null
          departure_city?: string | null
          departure_time?: string | null
          flight_number?: string | null
          id?: string
          itinerary_day_id: string
          notes?: string | null
          reserved_by?: string | null
          sort_order?: number | null
        }
        Update: {
          airline?: string | null
          arrival_city?: string | null
          arrival_time?: string | null
          confirmation_number?: string | null
          connecting_airline?: string | null
          connecting_arrival_city?: string | null
          connecting_arrival_time?: string | null
          connecting_departure_time?: string | null
          connecting_flight_number?: string | null
          created_at?: string | null
          departure_city?: string | null
          departure_time?: string | null
          flight_number?: string | null
          id?: string
          itinerary_day_id?: string
          notes?: string | null
          reserved_by?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "flights_itinerary_day_id_fkey"
            columns: ["itinerary_day_id"]
            isOneToOne: false
            referencedRelation: "itinerary_days"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          module_id: string | null
          published: boolean | null
          slug: string
          sort_order: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          module_id?: string | null
          published?: boolean | null
          slug: string
          sort_order?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          module_id?: string | null
          published?: boolean | null
          slug?: string
          sort_order?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_articles_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      input_channels: {
        Row: {
          channel_number: number
          di_box: boolean | null
          id: string
          input_list_id: string
          instrument: string
          microphone: string | null
          notes: string | null
          phantom_power: boolean | null
          sort_order: number | null
          stand_type: string | null
        }
        Insert: {
          channel_number: number
          di_box?: boolean | null
          id?: string
          input_list_id: string
          instrument: string
          microphone?: string | null
          notes?: string | null
          phantom_power?: boolean | null
          sort_order?: number | null
          stand_type?: string | null
        }
        Update: {
          channel_number?: number
          di_box?: boolean | null
          id?: string
          input_list_id?: string
          instrument?: string
          microphone?: string | null
          notes?: string | null
          phantom_power?: boolean | null
          sort_order?: number | null
          stand_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "input_channels_input_list_id_fkey"
            columns: ["input_list_id"]
            isOneToOne: false
            referencedRelation: "input_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      input_lists: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          org_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          org_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          org_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "input_lists_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_days: {
        Row: {
          bus_call_time: string | null
          created_at: string | null
          date: string
          day_type: string
          depart_time: string | null
          distance_miles: number | null
          drive_time_hours: number | null
          driver_name: string | null
          driver_phone: string | null
          hotel_address: string | null
          hotel_amenities: string | null
          hotel_confirmation: string | null
          hotel_distance_to_venue: string | null
          hotel_doubles: number | null
          hotel_fax: string | null
          hotel_name: string | null
          hotel_phone: string | null
          hotel_room_count: number | null
          hotel_singles: number | null
          id: string
          next_arrive_time: string | null
          next_destination: string | null
          next_distance_miles: number | null
          notes: string | null
          show_id: string | null
          tour_id: string
          updated_at: string | null
          weather_description: string | null
          weather_temp_high: number | null
          weather_temp_low: number | null
        }
        Insert: {
          bus_call_time?: string | null
          created_at?: string | null
          date: string
          day_type?: string
          depart_time?: string | null
          distance_miles?: number | null
          drive_time_hours?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          hotel_address?: string | null
          hotel_amenities?: string | null
          hotel_confirmation?: string | null
          hotel_distance_to_venue?: string | null
          hotel_doubles?: number | null
          hotel_fax?: string | null
          hotel_name?: string | null
          hotel_phone?: string | null
          hotel_room_count?: number | null
          hotel_singles?: number | null
          id?: string
          next_arrive_time?: string | null
          next_destination?: string | null
          next_distance_miles?: number | null
          notes?: string | null
          show_id?: string | null
          tour_id: string
          updated_at?: string | null
          weather_description?: string | null
          weather_temp_high?: number | null
          weather_temp_low?: number | null
        }
        Update: {
          bus_call_time?: string | null
          created_at?: string | null
          date?: string
          day_type?: string
          depart_time?: string | null
          distance_miles?: number | null
          drive_time_hours?: number | null
          driver_name?: string | null
          driver_phone?: string | null
          hotel_address?: string | null
          hotel_amenities?: string | null
          hotel_confirmation?: string | null
          hotel_distance_to_venue?: string | null
          hotel_doubles?: number | null
          hotel_fax?: string | null
          hotel_name?: string | null
          hotel_phone?: string | null
          hotel_room_count?: number | null
          hotel_singles?: number | null
          id?: string
          next_arrive_time?: string | null
          next_destination?: string | null
          next_distance_miles?: number | null
          notes?: string | null
          show_id?: string | null
          tour_id?: string
          updated_at?: string | null
          weather_description?: string | null
          weather_temp_high?: number | null
          weather_temp_low?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_days_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itinerary_days_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_quizzes: {
        Row: {
          correct_answer: number
          created_at: string | null
          explanation: string | null
          id: string
          lesson_id: string
          options: Json
          question: string
          sort_order: number | null
        }
        Insert: {
          correct_answer: number
          created_at?: string | null
          explanation?: string | null
          id?: string
          lesson_id: string
          options: Json
          question: string
          sort_order?: number | null
        }
        Update: {
          correct_answer?: number
          created_at?: string | null
          explanation?: string | null
          id?: string
          lesson_id?: string
          options?: Json
          question?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_quizzes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          id: string
          published: boolean | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          id?: string
          published?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      member_module_access: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          member_id: string
          module_id: string
          org_id: string
          requested_at: string | null
          status: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          member_id: string
          module_id: string
          org_id: string
          requested_at?: string | null
          status?: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          member_id?: string
          module_id?: string
          org_id?: string
          requested_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_module_access_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_module_access_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      member_payouts: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          member_id: string
          notes: string | null
          paid: boolean | null
          paid_at: string | null
          settlement_id: string
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          member_id: string
          notes?: string | null
          paid?: boolean | null
          paid_at?: string | null
          settlement_id: string
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          member_id?: string
          notes?: string | null
          paid?: boolean | null
          paid_at?: string | null
          settlement_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_payouts_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_inventory: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          quantity_remaining: number
          quantity_start: number
          tour_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity_remaining?: number
          quantity_start?: number
          tour_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity_remaining?: number
          quantity_start?: number
          tour_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merch_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merch_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_inventory_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_products: {
        Row: {
          active: boolean | null
          category: string | null
          cost_basis: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          org_id: string
          price: number
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          cost_basis?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          org_id: string
          price: number
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          cost_basis?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          org_id?: string
          price?: number
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "merch_products_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_sales: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number
          show_id: string | null
          sold_at: string | null
          sold_by: string | null
          total: number | null
          tour_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          show_id?: string | null
          sold_at?: string | null
          sold_by?: string | null
          total?: number | null
          tour_id: string
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          show_id?: string | null
          sold_at?: string | null
          sold_by?: string | null
          total?: number | null
          tour_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "merch_sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "merch_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_sales_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "merch_sales_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      module_tutorials: {
        Row: {
          content: string
          created_at: string | null
          id: string
          media_type: string | null
          media_url: string | null
          module_id: string
          step_number: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          module_id: string
          step_number: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          module_id?: string
          step_number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_tutorials_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          sort_order: number | null
          tier: string
        }
        Insert: {
          created_at?: string | null
          description: string
          icon: string
          id: string
          name: string
          sort_order?: number | null
          tier?: string
        }
        Update: {
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number | null
          tier?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string | null
          id: string
          is_paid: boolean | null
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_paid?: boolean | null
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_paid?: boolean | null
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_modules: {
        Row: {
          enabled: boolean | null
          enabled_at: string | null
          enabled_by: string | null
          id: string
          module_id: string
          org_id: string
        }
        Insert: {
          enabled?: boolean | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          module_id: string
          org_id: string
        }
        Update: {
          enabled?: boolean | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          module_id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_modules_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_modules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          brand_colors: Json | null
          brand_favicon_url: string | null
          brand_font: string | null
          brand_logo_url: string | null
          brand_name: string | null
          brand_primary_color: string | null
          brand_tagline: string | null
          created_at: string | null
          created_by: string | null
          custom_css: string | null
          custom_domain: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
          white_label_enabled: boolean | null
        }
        Insert: {
          brand_colors?: Json | null
          brand_favicon_url?: string | null
          brand_font?: string | null
          brand_logo_url?: string | null
          brand_name?: string | null
          brand_primary_color?: string | null
          brand_tagline?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          white_label_enabled?: boolean | null
        }
        Update: {
          brand_colors?: Json | null
          brand_favicon_url?: string | null
          brand_font?: string | null
          brand_logo_url?: string | null
          brand_name?: string | null
          brand_primary_color?: string | null
          brand_tagline?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_css?: string | null
          custom_domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
          white_label_enabled?: boolean | null
        }
        Relationships: []
      }
      package_acts: {
        Row: {
          act_name: string
          act_type: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          org_id: string | null
          package_id: string
          set_length_minutes: number | null
          sort_order: number | null
          tour_id: string | null
        }
        Insert: {
          act_name: string
          act_type?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          org_id?: string | null
          package_id: string
          set_length_minutes?: number | null
          sort_order?: number | null
          tour_id?: string | null
        }
        Update: {
          act_name?: string
          act_type?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          org_id?: string | null
          package_id?: string
          set_length_minutes?: number | null
          sort_order?: number | null
          tour_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "package_acts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_acts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tour_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_acts_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      per_diem_log: {
        Row: {
          city: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          rate: number
          received: boolean | null
          received_amount: number | null
          state: string | null
          tax_year: number
          tour_id: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          rate?: number
          received?: boolean | null
          received_amount?: number | null
          state?: string | null
          tax_year: number
          tour_id: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          rate?: number
          received?: boolean | null
          received_amount?: number | null
          state?: string | null
          tax_year?: number
          tour_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "per_diem_log_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string | null
          id: string
          label: string
          poll_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          label: string
          poll_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string
          poll_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string | null
          id: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allow_multiple: boolean | null
          closes_at: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          org_id: string
          question: string
          status: string
          tour_id: string | null
          updated_at: string | null
        }
        Insert: {
          allow_multiple?: boolean | null
          closes_at?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          org_id: string
          question: string
          status?: string
          tour_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_multiple?: boolean | null
          closes_at?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          org_id?: string
          question?: string
          status?: string
          tour_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_rsvps: {
        Row: {
          created_at: string | null
          id: string
          session_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_rsvps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          created_at: string | null
          created_by: string
          date: string
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          org_id: string
          start_time: string
          status: string
          timezone: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          date: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          org_id: string
          start_time: string
          status?: string
          timezone?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          date?: string
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          org_id?: string
          start_time?: string
          status?: string
          timezone?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      production_timeline: {
        Row: {
          created_at: string | null
          date: string
          id: string
          package_id: string
          show_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          package_id: string
          show_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          package_id?: string
          show_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_timeline_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tour_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_timeline_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          active: boolean | null
          applies_to: string
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_lifetime_grant: boolean | null
          max_uses: number | null
          times_used: number | null
        }
        Insert: {
          active?: boolean | null
          applies_to?: string
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_lifetime_grant?: boolean | null
          max_uses?: number | null
          times_used?: number | null
        }
        Update: {
          active?: boolean | null
          applies_to?: string
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_lifetime_grant?: boolean | null
          max_uses?: number | null
          times_used?: number | null
        }
        Relationships: []
      }
      schedule_items: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          itinerary_day_id: string
          label: string
          location: string | null
          notes: string | null
          sort_order: number | null
          time: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          itinerary_day_id: string
          label: string
          location?: string | null
          notes?: string | null
          sort_order?: number | null
          time?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          itinerary_day_id?: string
          label?: string
          location?: string | null
          notes?: string | null
          sort_order?: number | null
          time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_items_itinerary_day_id_fkey"
            columns: ["itinerary_day_id"]
            isOneToOne: false
            referencedRelation: "itinerary_days"
            referencedColumns: ["id"]
          },
        ]
      }
      setlist_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          setlist_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          setlist_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          setlist_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "setlist_comments_setlist_id_fkey"
            columns: ["setlist_id"]
            isOneToOne: false
            referencedRelation: "setlists"
            referencedColumns: ["id"]
          },
        ]
      }
      setlist_songs: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          id: string
          is_encore: boolean | null
          key: string | null
          notes: string | null
          setlist_id: string
          sort_order: number | null
          tempo: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_encore?: boolean | null
          key?: string | null
          notes?: string | null
          setlist_id: string
          sort_order?: number | null
          tempo?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_encore?: boolean | null
          key?: string | null
          notes?: string | null
          setlist_id?: string
          sort_order?: number | null
          tempo?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "setlist_songs_setlist_id_fkey"
            columns: ["setlist_id"]
            isOneToOne: false
            referencedRelation: "setlists"
            referencedColumns: ["id"]
          },
        ]
      }
      setlists: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          show_id: string | null
          status: string | null
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          show_id?: string | null
          status?: string | null
          tour_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          show_id?: string | null
          status?: string | null
          tour_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "setlists_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "setlists_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          created_at: string | null
          id: string
          net_profit: number | null
          notes: string | null
          settlement_date: string | null
          show_id: string
          total_expenses: number | null
          total_revenue: number | null
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          net_profit?: number | null
          notes?: string | null
          settlement_date?: string | null
          show_id: string
          total_expenses?: number | null
          total_revenue?: number | null
          tour_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          net_profit?: number | null
          notes?: string | null
          settlement_date?: string | null
          show_id?: string
          total_expenses?: number | null
          total_revenue?: number | null
          tour_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlements_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: true
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_albums: {
        Row: {
          cover_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          org_id: string
          title: string
          tour_id: string | null
          updated_at: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          org_id: string
          title: string
          tour_id?: string | null
          updated_at?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          org_id?: string
          title?: string
          tour_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_albums_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_albums_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_audio: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          file_url: string
          id: string
          org_id: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_url: string
          id?: string
          org_id: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_url?: string
          id?: string
          org_id?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_audio_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      show_revenue: {
        Row: {
          created_at: string | null
          guarantee: number | null
          id: string
          merch_sales: number | null
          notes: string | null
          other_revenue: number | null
          other_revenue_description: string | null
          show_id: string
          ticket_sales: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          guarantee?: number | null
          id?: string
          merch_sales?: number | null
          notes?: string | null
          other_revenue?: number | null
          other_revenue_description?: string | null
          show_id: string
          ticket_sales?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          guarantee?: number | null
          id?: string
          merch_sales?: number | null
          notes?: string | null
          other_revenue?: number | null
          other_revenue_description?: string | null
          show_id?: string
          ticket_sales?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "show_revenue_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: true
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      shows: {
        Row: {
          city: string
          country: string | null
          created_at: string | null
          date: string
          id: string
          notes: string | null
          state: string | null
          status: string
          timezone: string | null
          tour_id: string
          updated_at: string | null
          venue_name: string | null
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string | null
          date: string
          id?: string
          notes?: string | null
          state?: string | null
          status?: string
          timezone?: string | null
          tour_id: string
          updated_at?: string | null
          venue_name?: string | null
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string | null
          date?: string
          id?: string
          notes?: string | null
          state?: string | null
          status?: string
          timezone?: string | null
          tour_id?: string
          updated_at?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shows_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_plots: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          elements: Json | null
          id: string
          is_default: boolean | null
          name: string
          org_id: string
          show_id: string | null
          stage_depth: number | null
          stage_width: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          elements?: Json | null
          id?: string
          is_default?: boolean | null
          name: string
          org_id: string
          show_id?: string | null
          stage_depth?: number | null
          stage_width?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          elements?: Json | null
          id?: string
          is_default?: boolean | null
          name?: string
          org_id?: string
          show_id?: string | null
          stage_depth?: number | null
          stage_width?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_plots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_plots_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      state_income: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          gross_income: number
          id: string
          notes: string | null
          performance_date: string
          show_id: string | null
          state: string
          tax_year: number
          tour_id: string
          updated_at: string | null
          user_id: string
          venue_name: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          gross_income?: number
          id?: string
          notes?: string | null
          performance_date: string
          show_id?: string | null
          state: string
          tax_year: number
          tour_id: string
          updated_at?: string | null
          user_id: string
          venue_name?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          gross_income?: number
          id?: string
          notes?: string | null
          performance_date?: string
          show_id?: string | null
          state?: string
          tax_year?: number
          tour_id?: string
          updated_at?: string | null
          user_id?: string
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "state_income_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "state_income_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          cancelled_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          org_id: string | null
          promo_code_id: string | null
          started_at: string | null
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          org_id?: string | null
          promo_code_id?: string | null
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          org_id?: string | null
          promo_code_id?: string | null
          started_at?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_blocks: {
        Row: {
          act_id: string | null
          block_type: string
          created_at: string | null
          end_time: string | null
          id: string
          label: string
          notes: string | null
          sort_order: number | null
          start_time: string
          timeline_id: string
        }
        Insert: {
          act_id?: string | null
          block_type: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          label: string
          notes?: string | null
          sort_order?: number | null
          start_time: string
          timeline_id: string
        }
        Update: {
          act_id?: string | null
          block_type?: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          label?: string
          notes?: string | null
          sort_order?: number | null
          start_time?: string
          timeline_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_blocks_act_id_fkey"
            columns: ["act_id"]
            isOneToOne: false
            referencedRelation: "package_acts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_blocks_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "production_timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_members: {
        Row: {
          created_at: string | null
          daily_rate: number | null
          display_name: string
          id: string
          per_diem_rate: number | null
          role: string
          tour_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_rate?: number | null
          display_name: string
          id?: string
          per_diem_rate?: number | null
          role?: string
          tour_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_rate?: number | null
          display_name?: string
          id?: string
          per_diem_rate?: number | null
          role?: string
          tour_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_members_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_packages: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          org_id: string | null
          package_type: string
          start_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          org_id?: string | null
          package_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          org_id?: string | null
          package_type?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_packages_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          artist_name: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          artist_name: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          artist_name?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      travel_arrangements: {
        Row: {
          address: string | null
          arrangement_type: string
          booked_by: string | null
          check_in: string | null
          check_out: string | null
          confirmation_number: string | null
          cost: number | null
          created_at: string | null
          id: string
          notes: string | null
          phone: string | null
          show_id: string | null
          status: string | null
          tour_id: string
          updated_at: string | null
          vendor_name: string | null
        }
        Insert: {
          address?: string | null
          arrangement_type: string
          booked_by?: string | null
          check_in?: string | null
          check_out?: string | null
          confirmation_number?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          show_id?: string | null
          status?: string | null
          tour_id: string
          updated_at?: string | null
          vendor_name?: string | null
        }
        Update: {
          address?: string | null
          arrangement_type?: string
          booked_by?: string | null
          check_in?: string | null
          check_out?: string | null
          confirmation_number?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          show_id?: string | null
          status?: string | null
          tour_id?: string
          updated_at?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travel_arrangements_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_arrangements_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          id: string
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          id?: string
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          id?: string
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          lesson_id: string
          quiz_score: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id: string
          quiz_score?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          lesson_id?: string
          quiz_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email_notifications: boolean | null
          home_page: string | null
          id: string
          phone: string | null
          push_notifications: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email_notifications?: boolean | null
          home_page?: string | null
          id: string
          phone?: string | null
          push_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email_notifications?: boolean | null
          home_page?: string | null
          id?: string
          phone?: string | null
          push_notifications?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      venue_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          notes: string | null
          phone: string | null
          role: string
          venue_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          role: string
          venue_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_contacts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venue_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_notes: {
        Row: {
          category: string | null
          city: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          org_id: string
          state: string | null
          updated_at: string | null
          venue_name: string
        }
        Insert: {
          category?: string | null
          city?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          org_id: string
          state?: string | null
          updated_at?: string | null
          venue_name: string
        }
        Update: {
          category?: string | null
          city?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          org_id?: string
          state?: string | null
          updated_at?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_notes_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_profiles: {
        Row: {
          address: string | null
          capacity: number | null
          city: string
          country: string | null
          created_at: string | null
          created_from_advance_sheet: string | null
          dressing_room_count: number | null
          email: string | null
          has_backstage_parking: boolean | null
          has_rear_door: boolean | null
          has_stage_door: boolean | null
          id: string
          last_played_at: string | null
          lat: number | null
          lng: number | null
          name: string
          pa_system: string | null
          phone: string | null
          photo_urls: Json | null
          stage_depth: number | null
          stage_height: number | null
          stage_width: number | null
          state: string | null
          times_played: number | null
          updated_at: string | null
          venue_type: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          city: string
          country?: string | null
          created_at?: string | null
          created_from_advance_sheet?: string | null
          dressing_room_count?: number | null
          email?: string | null
          has_backstage_parking?: boolean | null
          has_rear_door?: boolean | null
          has_stage_door?: boolean | null
          id?: string
          last_played_at?: string | null
          lat?: number | null
          lng?: number | null
          name: string
          pa_system?: string | null
          phone?: string | null
          photo_urls?: Json | null
          stage_depth?: number | null
          stage_height?: number | null
          stage_width?: number | null
          state?: string | null
          times_played?: number | null
          updated_at?: string | null
          venue_type?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          capacity?: number | null
          city?: string
          country?: string | null
          created_at?: string | null
          created_from_advance_sheet?: string | null
          dressing_room_count?: number | null
          email?: string | null
          has_backstage_parking?: boolean | null
          has_rear_door?: boolean | null
          has_stage_door?: boolean | null
          id?: string
          last_played_at?: string | null
          lat?: number | null
          lng?: number | null
          name?: string
          pa_system?: string | null
          phone?: string | null
          photo_urls?: Json | null
          stage_depth?: number | null
          stage_height?: number | null
          stage_width?: number | null
          state?: string | null
          times_played?: number | null
          updated_at?: string | null
          venue_type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      venue_ratings: {
        Row: {
          created_at: string | null
          dressing_room_rating: number | null
          hospitality_rating: number | null
          id: string
          load_in_rating: number | null
          org_id: string
          overall_rating: number
          review: string | null
          show_date: string | null
          sound_rating: number | null
          user_id: string | null
          venue_id: string
        }
        Insert: {
          created_at?: string | null
          dressing_room_rating?: number | null
          hospitality_rating?: number | null
          id?: string
          load_in_rating?: number | null
          org_id: string
          overall_rating: number
          review?: string | null
          show_date?: string | null
          sound_rating?: number | null
          user_id?: string | null
          venue_id: string
        }
        Update: {
          created_at?: string | null
          dressing_room_rating?: number | null
          hospitality_rating?: number | null
          id?: string
          load_in_rating?: number | null
          org_id?: string
          overall_rating?: number
          review?: string | null
          show_date?: string | null
          sound_rating?: number | null
          user_id?: string | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_ratings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_ratings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venue_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_stages: {
        Row: {
          capacity: number | null
          created_at: string | null
          has_monitors: boolean | null
          id: string
          is_indoor: boolean
          name: string
          notes: string | null
          pa_system: string | null
          sort_order: number | null
          stage_depth: number | null
          stage_height: number | null
          stage_type: string
          stage_width: number | null
          venue_id: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          has_monitors?: boolean | null
          id?: string
          is_indoor?: boolean
          name: string
          notes?: string | null
          pa_system?: string | null
          sort_order?: number | null
          stage_depth?: number | null
          stage_height?: number | null
          stage_type: string
          stage_width?: number | null
          venue_id: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          has_monitors?: boolean | null
          id?: string
          is_indoor?: boolean
          name?: string
          notes?: string | null
          pa_system?: string | null
          sort_order?: number | null
          stage_depth?: number | null
          stage_height?: number | null
          stage_type?: string
          stage_width?: number | null
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_stages_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venue_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      warmup_routines: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          id: string
          is_system: boolean | null
          routine_type: string
          steps: Json | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_system?: boolean | null
          routine_type: string
          steps?: Json | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          id?: string
          is_system?: boolean | null
          routine_type?: string
          steps?: Json | null
          title?: string
        }
        Relationships: []
      }
      weather_cache: {
        Row: {
          city: string
          date: string
          description: string | null
          fetched_at: string | null
          icon: string | null
          id: string
          precipitation_pct: number | null
          show_id: string
          state: string | null
          temp_high_f: number | null
          temp_low_f: number | null
          wind_mph: number | null
        }
        Insert: {
          city: string
          date: string
          description?: string | null
          fetched_at?: string | null
          icon?: string | null
          id?: string
          precipitation_pct?: number | null
          show_id: string
          state?: string | null
          temp_high_f?: number | null
          temp_low_f?: number | null
          wind_mph?: number | null
        }
        Update: {
          city?: string
          date?: string
          description?: string | null
          fetched_at?: string | null
          icon?: string | null
          id?: string
          precipitation_pct?: number | null
          show_id?: string
          state?: string | null
          temp_high_f?: number | null
          temp_low_f?: number | null
          wind_mph?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_cache_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: true
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          events: Json | null
          id: string
          org_id: string
          secret_hash: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          events?: Json | null
          id?: string
          org_id: string
          secret_hash?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          events?: Json | null
          id?: string
          org_id?: string
          secret_hash?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_logs: {
        Row: {
          created_at: string | null
          date: string
          energy_level: number | null
          exercised: boolean | null
          hydration_glasses: number | null
          id: string
          meals_eaten: number | null
          mood: number | null
          notes: string | null
          performance_rating: number | null
          show_id: string | null
          sleep_hours: number | null
          sleep_quality: number | null
          stress_level: number | null
          timezone_from: string | null
          timezone_to: string | null
          updated_at: string | null
          user_id: string
          voice_condition: number | null
          warmup_completed: boolean | null
        }
        Insert: {
          created_at?: string | null
          date: string
          energy_level?: number | null
          exercised?: boolean | null
          hydration_glasses?: number | null
          id?: string
          meals_eaten?: number | null
          mood?: number | null
          notes?: string | null
          performance_rating?: number | null
          show_id?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          timezone_from?: string | null
          timezone_to?: string | null
          updated_at?: string | null
          user_id: string
          voice_condition?: number | null
          warmup_completed?: boolean | null
        }
        Update: {
          created_at?: string | null
          date?: string
          energy_level?: number | null
          exercised?: boolean | null
          hydration_glasses?: number | null
          id?: string
          meals_eaten?: number | null
          mood?: number | null
          notes?: string | null
          performance_rating?: number | null
          show_id?: string | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          timezone_from?: string | null
          timezone_to?: string | null
          updated_at?: string | null
          user_id?: string
          voice_condition?: number | null
          warmup_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "wellness_logs_show_id_fkey"
            columns: ["show_id"]
            isOneToOne: false
            referencedRelation: "shows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      lifetime_sales_stats: {
        Row: {
          active_annual_count: number | null
          lifetime_remaining: number | null
          paid_lifetime_count: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_tour_ids: { Args: never; Returns: string[] }
      get_venue_prefill: {
        Args: { p_city: string; p_venue_name: string }
        Returns: Json
      }
      populate_state_income: {
        Args: { p_tour_id: string; p_user_id: string }
        Returns: number
      }
      search_feedback_threads: {
        Args: { query: string }
        Returns: {
          category: string
          created_at: string
          id: string
          priority: string
          similarity: number
          status: string
          subject: string
          updated_at: string
          user_id: string
        }[]
      }
      search_help_articles: {
        Args: { query: string }
        Returns: {
          category: string
          content: string
          id: string
          module_id: string
          similarity: number
          slug: string
          tags: string[]
          title: string
        }[]
      }
      search_venues: {
        Args: { query: string; venue_type_filter?: string }
        Returns: {
          capacity: number
          city: string
          id: string
          name: string
          similarity: number
          state: string
          times_played: number
          venue_type: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
