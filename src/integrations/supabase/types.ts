export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      about_content: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          section_key: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "about_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_action_logs: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_auth: {
        Row: {
          created_at: string | null
          pass_key_hash: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          pass_key_hash: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          pass_key_hash?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_offices: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string
          hours: string
          id: string
          is_active: boolean
          map_url: string
          phone: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email: string
          hours: string
          id?: string
          is_active?: boolean
          map_url: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string
          hours?: string
          id?: string
          is_active?: boolean
          map_url?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          confirmation_sent_at: string | null
          confirmation_token: string | null
          created_at: string | null
          email: string
          id: string | null
          name: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: Database["public"]["Enums"]["admin_role"]
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          created_at?: string | null
          email: string
          id?: string | null
          name?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role: Database["public"]["Enums"]["admin_role"]
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          created_at?: string | null
          email?: string
          id?: string | null
          name?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_post_categories: {
        Row: {
          category_id: string
          post_id: string
        }
        Insert: {
          category_id: string
          post_id: string
        }
        Update: {
          category_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_post_categories_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      booking_settings: {
        Row: {
          booking_fee: number
          created_at: string
          id: string
          tax_rate: number
          updated_at: string
        }
        Insert: {
          booking_fee?: number
          created_at?: string
          id?: string
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          booking_fee?: number
          created_at?: string
          id?: string
          tax_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          arrival_time: string
          branch_id: string | null
          created_at: string
          departure_date: string
          departure_time: string
          from_location: string
          id: string
          price: number
          route_id: string
          seat_numbers: string[]
          status: string
          to_location: string
          updated_at: string
          user_id: string
        }
        Insert: {
          arrival_time: string
          branch_id?: string | null
          created_at?: string
          departure_date: string
          departure_time: string
          from_location: string
          id?: string
          price: number
          route_id: string
          seat_numbers: string[]
          status?: string
          to_location: string
          updated_at?: string
          user_id: string
        }
        Update: {
          arrival_time?: string
          branch_id?: string | null
          created_at?: string
          departure_date?: string
          departure_time?: string
          from_location?: string
          id?: string
          price?: number
          route_id?: string
          seat_numbers?: string[]
          status?: string
          to_location?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_admins: {
        Row: {
          admin_email: string | null
          branch_id: string | null
          created_at: string | null
          id: string
          is_superadmin: boolean | null
          user_id: string
        }
        Insert: {
          admin_email?: string | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          is_superadmin?: boolean | null
          user_id: string
        }
        Update: {
          admin_email?: string | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          is_superadmin?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_admins_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_admins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          city: string
          code: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          code: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bus_schedules: {
        Row: {
          available_seats: number
          bus_id: string
          created_at: string
          departure_date: string
          departure_time: string
          id: string
          route_id: string
          status: string
          updated_at: string
        }
        Insert: {
          available_seats?: number
          bus_id: string
          created_at?: string
          departure_date: string
          departure_time: string
          id?: string
          route_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          available_seats?: number
          bus_id?: string
          created_at?: string
          departure_date?: string
          departure_time?: string
          id?: string
          route_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_bus_schedules_bus_id"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "fleet"
            referencedColumns: ["id"]
          },
        ]
      }
      company_statistics: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_active: boolean
          label: string
          stat_key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          label: string
          stat_key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          label?: string
          stat_key?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_statistics_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      company_values: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          icon_name: string | null
          id: string
          is_active: boolean
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_values_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      data_exports: {
        Row: {
          admin_id: string
          completed_at: string | null
          created_at: string
          export_type: string
          file_path: string | null
          file_size: number | null
          filters: Json | null
          id: string
          record_count: number | null
          status: string
        }
        Insert: {
          admin_id: string
          completed_at?: string | null
          created_at?: string
          export_type: string
          file_path?: string | null
          file_size?: number | null
          filters?: Json | null
          id?: string
          record_count?: number | null
          status?: string
        }
        Update: {
          admin_id?: string
          completed_at?: string | null
          created_at?: string
          export_type?: string
          file_path?: string | null
          file_size?: number | null
          filters?: Json | null
          id?: string
          record_count?: number | null
          status?: string
        }
        Relationships: []
      }
      driver_assignments: {
        Row: {
          assignment_date: string
          bus_id: string | null
          created_at: string
          driver_id: string
          id: string
          route_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assignment_date?: string
          bus_id?: string | null
          created_at?: string
          driver_id: string
          id?: string
          route_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assignment_date?: string
          bus_id?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          route_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_assignments_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "fleet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_assignments_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_auth: {
        Row: {
          created_at: string
          driver_id: string
          email: string
          id: string
          last_login: string | null
          pass_key: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          email: string
          id?: string
          last_login?: string | null
          pass_key: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          email?: string
          id?: string
          last_login?: string | null
          pass_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_auth_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          branch_id: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          experience_years: number | null
          full_name: string
          hire_date: string
          id: string
          license_number: string
          phone: string | null
          rating: number | null
          status: string
          total_trips: number | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          experience_years?: number | null
          full_name: string
          hire_date?: string
          id?: string
          license_number: string
          phone?: string | null
          rating?: number | null
          status?: string
          total_trips?: number | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          experience_years?: number | null
          full_name?: string
          hire_date?: string
          id?: string
          license_number?: string
          phone?: string | null
          rating?: number | null
          status?: string
          total_trips?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      fleet: {
        Row: {
          base_price_multiplier: number | null
          branch_id: string | null
          capacity: number
          created_at: string
          description: string
          features: string[]
          id: string
          image_url: string
          name: string
          updated_at: string
        }
        Insert: {
          base_price_multiplier?: number | null
          branch_id?: string | null
          capacity: number
          created_at?: string
          description: string
          features: string[]
          id?: string
          image_url: string
          name: string
          updated_at?: string
        }
        Update: {
          base_price_multiplier?: number | null
          branch_id?: string | null
          capacity?: number
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          image_url?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      footer_settings: {
        Row: {
          about_us_text: string | null
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          copyright_text: string | null
          id: number
          newsletter_enabled: boolean
          social_facebook_url: string | null
          social_instagram_url: string | null
          social_twitter_url: string | null
          social_youtube_url: string | null
          updated_at: string
        }
        Insert: {
          about_us_text?: string | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          copyright_text?: string | null
          id: number
          newsletter_enabled?: boolean
          social_facebook_url?: string | null
          social_instagram_url?: string | null
          social_twitter_url?: string | null
          social_youtube_url?: string | null
          updated_at?: string
        }
        Update: {
          about_us_text?: string | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          copyright_text?: string | null
          id?: number
          newsletter_enabled?: boolean
          social_facebook_url?: string | null
          social_instagram_url?: string | null
          social_twitter_url?: string | null
          social_youtube_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string | null
          category_id: string
          description: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          is_featured: boolean
          title: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          category_id: string
          description?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          is_featured?: boolean
          title: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          category_id?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          is_featured?: boolean
          title?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gallery_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_images_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      history_milestones: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
          year: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          year: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "history_milestones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      locations: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_bookings: {
        Row: {
          admin_email: string
          booking_id: string | null
          branch_id: string | null
          created_at: string
          id: string
          passenger_email: string | null
          passenger_name: string
          passenger_phone: string | null
        }
        Insert: {
          admin_email: string
          booking_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          passenger_email?: string | null
          passenger_name: string
          passenger_phone?: string | null
        }
        Update: {
          admin_email?: string
          booking_id?: string | null
          branch_id?: string | null
          created_at?: string
          id?: string
          passenger_email?: string | null
          passenger_name?: string
          passenger_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manual_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_bookings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_type: string
          sender_id: string | null
          sender_type: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_type: string
          sender_id?: string | null
          sender_type: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_type?: string
          sender_id?: string | null
          sender_type?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      navigation_links: {
        Row: {
          created_at: string
          display_order: number
          href: string
          id: string
          is_active: boolean
          link_type: string
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          href: string
          id?: string
          is_active?: boolean
          link_type: string
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          href?: string
          id?: string
          is_active?: boolean
          link_type?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          booking_count: number | null
          created_at: string
          full_name: string | null
          id: string
          is_online: boolean | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          booking_count?: number | null
          created_at?: string
          full_name?: string | null
          id: string
          is_online?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          booking_count?: number | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_online?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      receipt_settings: {
        Row: {
          branch_id: string | null
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_settings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_templates: {
        Row: {
          accent_color: string | null
          background_gradient: string | null
          body_font: string | null
          branch_id: string | null
          company_name: string | null
          company_tagline: string | null
          created_at: string | null
          created_by: string | null
          footer_message: string | null
          header_font: string | null
          header_message: string | null
          header_style: string | null
          id: string
          is_active: boolean
          is_default: boolean
          logo_url: string | null
          primary_color: string | null
          promotional_message: string | null
          secondary_color: string | null
          show_fleet_details: boolean | null
          show_qr_code: boolean | null
          show_weather_info: boolean | null
          support_email: string | null
          support_phone: string | null
          template_name: string
          terms_and_conditions: string | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          accent_color?: string | null
          background_gradient?: string | null
          body_font?: string | null
          branch_id?: string | null
          company_name?: string | null
          company_tagline?: string | null
          created_at?: string | null
          created_by?: string | null
          footer_message?: string | null
          header_font?: string | null
          header_message?: string | null
          header_style?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          logo_url?: string | null
          primary_color?: string | null
          promotional_message?: string | null
          secondary_color?: string | null
          show_fleet_details?: boolean | null
          show_qr_code?: boolean | null
          show_weather_info?: boolean | null
          support_email?: string | null
          support_phone?: string | null
          template_name?: string
          terms_and_conditions?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          accent_color?: string | null
          background_gradient?: string | null
          body_font?: string | null
          branch_id?: string | null
          company_name?: string | null
          company_tagline?: string | null
          created_at?: string | null
          created_by?: string | null
          footer_message?: string | null
          header_font?: string | null
          header_message?: string | null
          header_style?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          logo_url?: string | null
          primary_color?: string | null
          promotional_message?: string | null
          secondary_color?: string | null
          show_fleet_details?: boolean | null
          show_qr_code?: boolean | null
          show_weather_info?: boolean | null
          support_email?: string | null
          support_phone?: string | null
          template_name?: string
          terms_and_conditions?: string | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipt_templates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_verifications: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          ip_address: unknown | null
          notes: string | null
          receipt_id: string
          user_agent: string | null
          verification_type: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          notes?: string | null
          receipt_id: string
          user_agent?: string | null
          verification_type: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          notes?: string | null
          receipt_id?: string
          user_agent?: string | null
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipt_verifications_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          generated_at: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          receipt_number: string
          receipt_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          generated_at?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          receipt_number?: string
          receipt_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          generated_at?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          receipt_number?: string
          receipt_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      reschedule_requests: {
        Row: {
          admin_notes: string | null
          booking_id: string
          created_at: string
          current_departure_date: string
          current_departure_time: string
          current_route_id: string
          fee_amount: number | null
          id: string
          payment_details: Json | null
          payment_status: string | null
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          requested_departure_date: string
          requested_departure_time: string
          requested_route_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          booking_id: string
          created_at?: string
          current_departure_date: string
          current_departure_time: string
          current_route_id: string
          fee_amount?: number | null
          id?: string
          payment_details?: Json | null
          payment_status?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_departure_date: string
          requested_departure_time: string
          requested_route_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          booking_id?: string
          created_at?: string
          current_departure_date?: string
          current_departure_time?: string
          current_route_id?: string
          fee_amount?: number | null
          id?: string
          payment_details?: Json | null
          payment_status?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          requested_departure_date?: string
          requested_departure_time?: string
          requested_route_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_booking"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean
          rating: number
          review_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean
          rating: number
          review_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean
          rating?: number
          review_text?: string
          user_id?: string
        }
        Relationships: []
      }
      route_fleet_pricing: {
        Row: {
          created_at: string
          custom_price: number
          fleet_id: string
          id: string
          route_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_price: number
          fleet_id: string
          id?: string
          route_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_price?: number
          fleet_id?: string
          id?: string
          route_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_fleet_pricing_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_fleet_pricing_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          branch_id: string | null
          created_at: string
          departure_times: string[]
          duration: string
          from_location: string
          id: string
          is_popular: boolean | null
          price: number
          to_location: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          departure_times: string[]
          duration: string
          from_location: string
          id?: string
          is_popular?: boolean | null
          price: number
          to_location: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          departure_times?: string[]
          duration?: string
          from_location?: string
          id?: string
          is_popular?: boolean | null
          price?: number
          to_location?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "routes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          available_seats: number
          branch_id: string | null
          bus_id: string | null
          created_at: string
          departure_date: string
          departure_time: string
          driver_id: string | null
          id: string
          route_id: string
          updated_at: string
        }
        Insert: {
          available_seats?: number
          branch_id?: string | null
          bus_id?: string | null
          created_at?: string
          departure_date: string
          departure_time: string
          driver_id?: string | null
          id?: string
          route_id: string
          updated_at?: string
        }
        Update: {
          available_seats?: number
          branch_id?: string | null
          bus_id?: string | null
          created_at?: string
          departure_date?: string
          departure_time?: string
          driver_id?: string | null
          id?: string
          route_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "fleet"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      seat_availability: {
        Row: {
          booking_id: string | null
          bus_id: string | null
          created_at: string
          departure_date: string
          departure_time: string
          id: string
          locked_by: string | null
          locked_until: string | null
          route_id: string
          seat_number: number
          status: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          bus_id?: string | null
          created_at?: string
          departure_date: string
          departure_time: string
          id?: string
          locked_by?: string | null
          locked_until?: string | null
          route_id: string
          seat_number: number
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          bus_id?: string | null
          created_at?: string
          departure_date?: string
          departure_time?: string
          id?: string
          locked_by?: string | null
          locked_until?: string | null
          route_id?: string
          seat_number?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_availability_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "fleet"
            referencedColumns: ["id"]
          },
        ]
      }
      site_branding: {
        Row: {
          company_name: string
          id: number
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string
          id: number
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          id?: number
          logo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          role: string
          updated_at: string
        }
        Insert: {
          bio: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          role: string
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_bus_to_booking: {
        Args: {
          p_route_id: string
          p_departure_date: string
          p_departure_time: string
          p_preferred_bus_id?: string
          p_required_seats?: number
        }
        Returns: {
          assigned_bus_id: string
          fleet_name: string
          available_seats: number
          is_fallback: boolean
        }[]
      }
      book_seat: {
        Args: {
          p_route_id: string
          p_departure_date: string
          p_departure_time: string
          p_seat_number: number
          p_booking_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      bulk_delete_bookings: {
        Args: {
          p_start_date?: string
          p_end_date?: string
          p_branch_id?: string
          p_admin_id?: string
        }
        Returns: Json
      }
      create_admin_and_assign_branch: {
        Args:
          | {
              p_admin_email: string
              p_branch_id: string
              p_is_superadmin?: boolean
            }
          | {
              p_admin_email: string
              p_pass_key: string
              p_branch_id: string
              p_is_superadmin: boolean
            }
        Returns: Json
      }
      create_admin_auth: {
        Args: {
          email_param: string
          pass_key_param: string
          created_by_param: string
        }
        Returns: string
      }
      create_admin_user_v2: {
        Args: {
          p_email: string
          p_password: string
          p_branch_id?: string
          p_is_superadmin?: boolean
        }
        Returns: Json
      }
      create_booking_with_branch: {
        Args: {
          p_user_id: string
          p_route_id: string
          p_from_location: string
          p_to_location: string
          p_departure_date: string
          p_departure_time: string
          p_arrival_time: string
          p_seat_numbers: string[]
          p_price: number
          p_status: string
          p_branch_id: string
        }
        Returns: Json
      }
      establish_admin_session: {
        Args: { admin_user_id: string }
        Returns: boolean
      }
      export_bookings_data: {
        Args: {
          p_start_date?: string
          p_end_date?: string
          p_branch_id?: string
        }
        Returns: {
          booking_id: string
          user_email: string
          passenger_name: string
          passenger_phone: string
          passenger_email: string
          route_name: string
          departure_date: string
          departure_time: string
          seat_numbers: string[]
          price: number
          status: string
          booking_type: string
          branch_name: string
          receipt_number: string
          payment_status: string
          payment_method: string
          created_at: string
        }[]
      }
      generate_receipt_number: {
        Args: { branch_code: string }
        Returns: string
      }
      get_admin_analytics: {
        Args: { p_branch_id?: string }
        Returns: Json
      }
      get_admin_auth_by_email: {
        Args: { email_param: string }
        Returns: {
          id: string
          admin_email: string
          pass_key: string
          last_login: string
          created_at: string
        }[]
      }
      get_admin_bookings: {
        Args: { p_branch_id?: string }
        Returns: {
          booking_id: string
          user_id: string
          route_name: string
          passenger_name: string
          passenger_phone: string
          passenger_email: string
          departure_date: string
          departure_time: string
          seat_numbers: string[]
          price: number
          status: string
          created_at: string
          branch_name: string
          booking_type: string
        }[]
      }
      get_admin_branch_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_receipts: {
        Args: { p_branch_id?: string }
        Returns: {
          receipt_id: string
          receipt_number: string
          booking_id: string
          passenger_name: string
          passenger_phone: string
          route_name: string
          amount: number
          payment_method: string
          payment_status: string
          generated_at: string
          branch_name: string
        }[]
      }
      get_admin_receipts_with_signoff: {
        Args: { p_branch_id?: string }
        Returns: {
          receipt_id: string
          receipt_number: string
          booking_id: string
          passenger_name: string
          passenger_phone: string
          route_name: string
          amount: number
          payment_method: string
          payment_status: string
          generated_at: string
          branch_name: string
          receipt_status: string
          is_signed_off: boolean
          verification_count: number
        }[]
      }
      get_admin_seat_map: {
        Args: {
          p_route_id: string
          p_departure_date: string
          p_departure_time: string
          p_bus_id?: string
        }
        Returns: {
          seat_number: number
          status: string
          passenger_name: string
          passenger_phone: string
          passenger_email: string
          booking_id: string
          bus_id: string
          fleet_name: string
        }[]
      }
      get_admin_users_with_contact: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          full_name: string
          phone: string
          booking_count: number
          is_online: boolean
          created_at: string
        }[]
      }
      get_available_fleet_for_route: {
        Args: {
          p_route_id: string
          p_departure_date: string
          p_departure_time: string
        }
        Returns: {
          bus_id: string
          fleet_name: string
          fleet_description: string
          capacity: number
          features: string[]
          image_url: string
          available_seats: number
          status: string
          base_price_multiplier: number
          route_base_price: number
        }[]
      }
      get_branches_for_booking: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          city: string
        }[]
      }
      get_current_admin_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_branch_admin_branch_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_receipt_details: {
        Args: { p_receipt_id: string }
        Returns: Json
      }
      get_receipt_template: {
        Args: { p_branch_id?: string }
        Returns: Json
      }
      get_seat_availability: {
        Args:
          | {
              p_route_id: string
              p_departure_date: string
              p_departure_time: string
            }
          | {
              p_route_id: string
              p_departure_date: string
              p_departure_time: string
              p_bus_id?: string
            }
        Returns: {
          seat_number: number
          status: string
          is_available: boolean
          bus_id: string
        }[]
      }
      get_user_contact_info: {
        Args: { user_uuid: string }
        Returns: Json
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      initialize_seat_availability: {
        Args: {
          p_route_id: string
          p_departure_date: string
          p_departure_time: string
          p_total_seats?: number
          p_bus_id?: string
        }
        Returns: undefined
      }
      is_current_user_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      lock_seat: {
        Args: {
          p_route_id: string
          p_departure_date: string
          p_departure_time: string
          p_seat_number: number
          p_user_id: string
          p_lock_duration_minutes?: number
        }
        Returns: boolean
      }
      log_admin_activity: {
        Args: {
          action_type: string
          description: string
          admin_email: string
          entity_type: string
          entity_id: string
        }
        Returns: undefined
      }
      release_expired_locks: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      sign_off_receipt: {
        Args: {
          p_receipt_id: string
          p_admin_user_id: string
          p_notes?: string
        }
        Returns: Json
      }
      update_admin_last_login: {
        Args: { email_param: string }
        Returns: undefined
      }
      update_admin_password: {
        Args: { admin_user_id: string; new_password: string }
        Returns: boolean
      }
      validate_admin_session: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      verify_password: {
        Args: { password: string; hash: string }
        Returns: boolean
      }
      verify_receipt: {
        Args:
          | { p_receipt_id: string; p_booking_id?: string }
          | {
              p_receipt_id: string
              p_booking_id?: string
              p_admin_user_id?: string
            }
        Returns: Json
      }
    }
    Enums: {
      admin_role: "superadmin" | "branch_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["superadmin", "branch_admin"],
    },
  },
} as const
