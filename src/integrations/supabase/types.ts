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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      action_budgets: {
        Row: {
          action: string
          hits: number
          user_id: string
          window_start: string
        }
        Insert: {
          action: string
          hits?: number
          user_id: string
          window_start: string
        }
        Update: {
          action?: string
          hits?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      admin_access: {
        Row: {
          blocked_until: string
          expires_at: string
          failures: number
          session_id: string
          user_id: string
        }
        Insert: {
          blocked_until?: string
          expires_at?: string
          failures?: number
          session_id?: string
          user_id: string
        }
        Update: {
          blocked_until?: string
          expires_at?: string
          failures?: number
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_audit: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          details: Json
          id: string
          resource: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          details?: Json
          id?: string
          resource?: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          details?: Json
          id?: string
          resource?: string
        }
        Relationships: []
      }
      catalog_registry: {
        Row: {
          category: string
          display_name: string | null
          enabled: boolean
          game_name: string
          overridden: boolean
          source_url: string
          updated_at: string
        }
        Insert: {
          category?: string
          display_name?: string | null
          enabled?: boolean
          game_name: string
          overridden?: boolean
          source_url: string
          updated_at?: string
        }
        Update: {
          category?: string
          display_name?: string | null
          enabled?: boolean
          game_name?: string
          overridden?: boolean
          source_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      catalog_revisions: {
        Row: {
          actor_id: string
          after_data: Json
          before_data: Json | null
          created_at: string
          game_name: string
          id: string
        }
        Insert: {
          actor_id: string
          after_data: Json
          before_data?: Json | null
          created_at?: string
          game_name: string
          id?: string
        }
        Update: {
          actor_id?: string
          after_data?: Json
          before_data?: Json | null
          created_at?: string
          game_name?: string
          id?: string
        }
        Relationships: []
      }
      challenge_runs: {
        Row: {
          day: string
          finished_at: string | null
          id: string
          last_hit: string
          score: number
          started_at: string
          step: number
          user_id: string
        }
        Insert: {
          day?: string
          finished_at?: string | null
          id?: string
          last_hit?: string
          score?: number
          started_at?: string
          step?: number
          user_id: string
        }
        Update: {
          day?: string
          finished_at?: string | null
          id?: string
          last_hit?: string
          score?: number
          started_at?: string
          step?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_runs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          user_id: string
        }
        Update: {
          comment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "game_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reports: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          reason: string
          resolved: boolean
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          reason: string
          resolved?: boolean
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          reason?: string
          resolved?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "game_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      game_comments: {
        Row: {
          created_at: string
          game_name: string
          hidden: boolean
          id: string
          message: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_name: string
          hidden?: boolean
          id?: string
          message: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_name?: string
          hidden?: boolean
          id?: string
          message?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_feedback: {
        Row: {
          created_at: string
          game_name: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_name: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_name?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_ratings: {
        Row: {
          game_name: string
          rating: number
          user_id: string
        }
        Insert: {
          game_name: string
          rating: number
          user_id: string
        }
        Update: {
          game_name?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_requests: {
        Row: {
          created_at: string
          description: string
          id: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      play_events: {
        Row: {
          created_at: string
          game_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_name: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_name?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "play_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_library: {
        Row: {
          favorite: boolean
          game_name: string
          played_at: string | null
          user_id: string
        }
        Insert: {
          favorite?: boolean
          game_name: string
          played_at?: string | null
          user_id: string
        }
        Update: {
          favorite?: boolean
          game_name?: string
          played_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_library_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          display_name: string
          id: string
          leaderboard_enabled: boolean
          preferences: Json
        }
        Insert: {
          avatar_url?: string | null
          display_name?: string
          id: string
          leaderboard_enabled?: boolean
          preferences?: Json
        }
        Update: {
          avatar_url?: string | null
          display_name?: string
          id?: string
          leaderboard_enabled?: boolean
          preferences?: Json
        }
        Relationships: []
      }
      request_votes: {
        Row: {
          request_id: string
          user_id: string
        }
        Insert: {
          request_id: string
          user_id: string
        }
        Update: {
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_votes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "game_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rtc_closed_rooms: {
        Row: {
          closed_at: string
          room_id: string
        }
        Insert: {
          closed_at?: string
          room_id: string
        }
        Update: {
          closed_at?: string
          room_id?: string
        }
        Relationships: []
      }
      rtc_members: {
        Row: {
          name: string
          peer_id: string
          room_id: string
          seen_at: string
          user_id: string
        }
        Insert: {
          name: string
          peer_id: string
          room_id: string
          seen_at?: string
          user_id: string
        }
        Update: {
          name?: string
          peer_id?: string
          room_id?: string
          seen_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rtc_members_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rtc_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rtc_rooms: {
        Row: {
          expires_at: string
          host_id: string
          id: string
        }
        Insert: {
          expires_at?: string
          host_id: string
          id: string
        }
        Update: {
          expires_at?: string
          host_id?: string
          id?: string
        }
        Relationships: []
      }
      rtc_signals: {
        Row: {
          created_at: string
          id: number
          kind: string
          payload: Json
          recipient: string
          room_id: string | null
          sender: string
        }
        Insert: {
          created_at?: string
          id?: never
          kind: string
          payload: Json
          recipient: string
          room_id?: string | null
          sender: string
        }
        Update: {
          created_at?: string
          id?: never
          kind?: string
          payload?: Json
          recipient?: string
          room_id?: string | null
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "rtc_signals_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rtc_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      save_versions: {
        Row: {
          checksum: string
          created_at: string
          game_name: string
          id: string
          object_name: string
          size_bytes: number
          slot: string
          user_id: string
          version: number
        }
        Insert: {
          checksum: string
          created_at?: string
          game_name: string
          id?: string
          object_name: string
          size_bytes: number
          slot?: string
          user_id: string
          version: number
        }
        Update: {
          checksum?: string
          created_at?: string
          game_name?: string
          id?: string
          object_name?: string
          size_bytes?: number
          slot?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          created_at: string
          event_key: string
          id: string
          points: number
          user_id: string
        }
        Insert: {
          created_at?: string
          event_key: string
          id?: string
          points: number
          user_id: string
        }
        Update: {
          created_at?: string
          event_key?: string
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_catalog_edit: {
        Args: {
          _category: string
          _display: string
          _enabled: boolean
          _game: string
          _url: string
        }
        Returns: undefined
      }
      admin_is_unlocked: { Args: never; Returns: boolean }
      admin_lock: { Args: never; Returns: undefined }
      admin_moderate_comment: {
        Args: { _hidden: boolean; _id: string }
        Returns: undefined
      }
      admin_overview: { Args: never; Returns: Json }
      admin_remove_rating: {
        Args: { _game: string; _user: string }
        Returns: undefined
      }
      admin_reports: { Args: never; Returns: Json }
      admin_set_moderator: {
        Args: { _enabled: boolean; _user: string }
        Returns: undefined
      }
      admin_set_request_status: {
        Args: { _request: string; _status: string }
        Returns: undefined
      }
      admin_user_list: { Args: { _offset?: number }; Returns: Json }
      can_like_comment: { Args: { _id: string }; Returns: boolean }
      comment_page: {
        Args: { _game: string; _offset?: number; _sort?: string }
        Returns: Json
      }
      community_summary: { Args: never; Returns: Json }
      consume_action_budget: {
        Args: { _action: string; _maximum: number; _seconds: number }
        Returns: undefined
      }
      daily_challenge_board: { Args: never; Returns: Json }
      finish_daily_challenge: { Args: { _run: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hit_daily_target: {
        Args: { _direction: number; _run: string }
        Returns: Json
      }
      player_progress: { Args: never; Returns: Json }
      record_admin_attempt: {
        Args: { _session: string; _success: boolean; _user: string }
        Returns: Json
      }
      register_save_version: {
        Args: {
          _base: number
          _checksum: string
          _game: string
          _object: string
          _slot: string
        }
        Returns: Json
      }
      rtc_close_room: { Args: { _room: string }; Returns: undefined }
      rtc_exchange: {
        Args: {
          _kind?: string
          _name?: string
          _op?: string
          _payload?: Json
          _peer: string
          _room: string
          _since?: number
          _to?: string
        }
        Returns: Json
      }
      rtc_guarded_exchange: {
        Args: {
          _kind?: string
          _name?: string
          _op?: string
          _payload?: Json
          _peer: string
          _room: string
          _since?: number
          _to?: string
        }
        Returns: Json
      }
      save_object_can_delete: { Args: { _name: string }; Returns: boolean }
      save_upload_allowed: { Args: never; Returns: boolean }
      start_daily_challenge: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
