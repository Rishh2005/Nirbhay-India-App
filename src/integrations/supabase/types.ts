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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      community_reports: {
        Row: {
          created_at: string | null
          description: string | null
          downvotes: number | null
          expires_at: string | null
          id: string
          latitude: number
          longitude: number
          report_type: string
          reporter_id: string | null
          severity: number | null
          upvotes: number | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          downvotes?: number | null
          expires_at?: string | null
          id?: string
          latitude: number
          longitude: number
          report_type: string
          reporter_id?: string | null
          severity?: number | null
          upvotes?: number | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          downvotes?: number | null
          expires_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          report_type?: string
          reporter_id?: string | null
          severity?: number | null
          upvotes?: number | null
          verified?: boolean | null
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string | null
          id: string
          is_guardian: boolean | null
          name: string
          phone_number: string
          priority: number | null
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_guardian?: boolean | null
          name: string
          phone_number: string
          priority?: number | null
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_guardian?: boolean | null
          name?: string
          phone_number?: string
          priority?: number | null
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      evidence_records: {
        Row: {
          blockchain_verified: boolean | null
          created_at: string | null
          evidence_type: string
          file_hash: string
          file_path: string
          id: string
          incident_id: string | null
          ipfs_cid: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          blockchain_verified?: boolean | null
          created_at?: string | null
          evidence_type: string
          file_hash: string
          file_path: string
          id?: string
          incident_id?: string | null
          ipfs_cid?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          blockchain_verified?: boolean | null
          created_at?: string | null
          evidence_type?: string
          file_hash?: string
          file_path?: string
          id?: string
          incident_id?: string | null
          ipfs_cid?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_records_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incident_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_verification: {
        Row: {
          blockchain_hash: string | null
          created_at: string | null
          guardian_contact_id: string | null
          id: string
          user_id: string
          verification_code: string | null
          verification_method: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string | null
          guardian_contact_id?: string | null
          id?: string
          user_id: string
          verification_code?: string | null
          verification_method?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string | null
          guardian_contact_id?: string | null
          id?: string
          user_id?: string
          verification_code?: string | null
          verification_method?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardian_verification_guardian_contact_id_fkey"
            columns: ["guardian_contact_id"]
            isOneToOne: false
            referencedRelation: "emergency_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          blockchain_hash: string | null
          created_at: string | null
          description: string | null
          id: string
          incident_type: string
          latitude: number | null
          location_hash: string | null
          longitude: number | null
          severity: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          blockchain_hash?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          incident_type: string
          latitude?: number | null
          location_hash?: string | null
          longitude?: number | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          blockchain_hash?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          incident_type?: string
          latitude?: number | null
          location_hash?: string | null
          longitude?: number | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          emergency_message: string | null
          full_name: string
          id: string
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          emergency_message?: string | null
          full_name: string
          id: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          emergency_message?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      safety_zones: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          radius: number | null
          verified: boolean | null
          zone_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          radius?: number | null
          verified?: boolean | null
          zone_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          radius?: number | null
          verified?: boolean | null
          zone_type?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          alert_type: string | null
          created_at: string | null
          id: string
          latitude: number
          location_name: string | null
          longitude: number
          notes: string | null
          resolved_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          latitude: number
          location_name?: string | null
          longitude: number
          notes?: string | null
          resolved_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          id?: string
          latitude?: number
          location_name?: string | null
          longitude?: number
          notes?: string | null
          resolved_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      travel_logs: {
        Row: {
          completed_at: string | null
          dest_lat: number | null
          dest_lng: number | null
          destination: string | null
          expected_arrival: string | null
          expected_duration: number | null
          id: string
          route_data: Json | null
          start_lat: number | null
          start_lng: number | null
          start_location: string | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          dest_lat?: number | null
          dest_lng?: number | null
          destination?: string | null
          expected_arrival?: string | null
          expected_duration?: number | null
          id?: string
          route_data?: Json | null
          start_lat?: number | null
          start_lng?: number | null
          start_location?: string | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          dest_lat?: number | null
          dest_lng?: number | null
          destination?: string | null
          expected_arrival?: string | null
          expected_duration?: number | null
          id?: string
          route_data?: Json | null
          start_lat?: number | null
          start_lng?: number | null
          start_location?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
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
