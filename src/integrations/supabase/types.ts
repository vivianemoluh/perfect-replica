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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          category: string | null
          content_en: string | null
          content_fr: string | null
          cover_image_url: string | null
          created_at: string | null
          excerpt_en: string | null
          excerpt_fr: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          title_en: string | null
          title_fr: string
        }
        Insert: {
          category?: string | null
          content_en?: string | null
          content_fr?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt_en?: string | null
          excerpt_fr?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          title_en?: string | null
          title_fr: string
        }
        Update: {
          category?: string | null
          content_en?: string | null
          content_fr?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          excerpt_en?: string | null
          excerpt_fr?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          title_en?: string | null
          title_fr?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          cover_url: string | null
          created_at: string | null
          display_order: number | null
          excerpt_url: string | null
          genre: string | null
          id: string
          is_published: boolean | null
          publication_year: number | null
          purchase_links: Json | null
          slug: string
          summary_en: string | null
          summary_fr: string | null
          title_en: string | null
          title_fr: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          display_order?: number | null
          excerpt_url?: string | null
          genre?: string | null
          id?: string
          is_published?: boolean | null
          publication_year?: number | null
          purchase_links?: Json | null
          slug: string
          summary_en?: string | null
          summary_fr?: string | null
          title_en?: string | null
          title_fr: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          display_order?: number | null
          excerpt_url?: string | null
          genre?: string | null
          id?: string
          is_published?: boolean | null
          publication_year?: number | null
          purchase_links?: Json | null
          slug?: string
          summary_en?: string | null
          summary_fr?: string | null
          title_en?: string | null
          title_fr?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_read: boolean | null
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_read?: boolean | null
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_read?: boolean | null
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          description_en: string | null
          description_fr: string | null
          event_date: string
          event_type: string | null
          id: string
          is_published: boolean | null
          location: string | null
          registration_url: string | null
          title_en: string | null
          title_fr: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          registration_url?: string | null
          title_en?: string | null
          title_fr: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          is_published?: boolean | null
          location?: string | null
          registration_url?: string | null
          title_en?: string | null
          title_fr?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          caption_en: string | null
          caption_fr: string | null
          category: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
        }
        Insert: {
          caption_en?: string | null
          caption_fr?: string | null
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
        }
        Update: {
          caption_en?: string | null
          caption_fr?: string | null
          category?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_fr: string | null
          download_count: number | null
          file_url: string
          id: string
          is_free: boolean | null
          resource_type: string | null
          title_en: string | null
          title_fr: string
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          download_count?: number | null
          file_url: string
          id?: string
          is_free?: boolean | null
          resource_type?: string | null
          title_en?: string | null
          title_fr: string
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          download_count?: number | null
          file_url?: string
          id?: string
          is_free?: boolean | null
          resource_type?: string | null
          title_en?: string | null
          title_fr?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          book_id: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          rating: number | null
          review_text: string
          reviewer_location: string | null
          reviewer_name: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating?: number | null
          review_text: string
          reviewer_location?: string | null
          reviewer_name: string
        }
        Update: {
          book_id?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating?: number | null
          review_text?: string
          reviewer_location?: string | null
          reviewer_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
    Enums: {
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
