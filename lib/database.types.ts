// Generated from the live Supabase project (arch-portfolio) — do not edit by hand.
// Regenerate: npx supabase gen types typescript --project-id dossiqaxjptjvjwngvrd > lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      architects: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          id: string;
          name: string;
          profile_id: string | null;
          title: string | null;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          profile_id?: string | null;
          title?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          profile_id?: string | null;
          title?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "architects_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          changes: Json | null;
          created_at: string;
          entity: string;
          entity_id: string | null;
          id: number;
          label: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          changes?: Json | null;
          created_at?: string;
          entity: string;
          entity_id?: string | null;
          id?: never;
          label?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          changes?: Json | null;
          created_at?: string;
          entity?: string;
          entity_id?: string | null;
          id?: never;
          label?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      collaboration_requests: {
        Row: {
          budget: string | null;
          client_id: string;
          created_at: string;
          description: string;
          id: string;
          location: string | null;
          owner_note: string | null;
          project_type: string | null;
          status: string;
          timeline: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          budget?: string | null;
          client_id?: string;
          created_at?: string;
          description: string;
          id?: string;
          location?: string | null;
          owner_note?: string | null;
          project_type?: string | null;
          status?: string;
          timeline?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          budget?: string | null;
          client_id?: string;
          created_at?: string;
          description?: string;
          id?: string;
          location?: string | null;
          owner_note?: string | null;
          project_type?: string | null;
          status?: string;
          timeline?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collaboration_requests_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      collaborator_invites: {
        Row: {
          architect_id: string;
          created_at: string;
          email: string;
          id: string;
          invited_by: string | null;
          message: string | null;
          responded_at: string | null;
          status: string;
        };
        Insert: {
          architect_id: string;
          created_at?: string;
          email: string;
          id?: string;
          invited_by?: string | null;
          message?: string | null;
          responded_at?: string | null;
          status?: string;
        };
        Update: {
          architect_id?: string;
          created_at?: string;
          email?: string;
          id?: string;
          invited_by?: string | null;
          message?: string | null;
          responded_at?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collaborator_invites_architect_id_fkey";
            columns: ["architect_id"];
            isOneToOne: false;
            referencedRelation: "architects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collaborator_invites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversation_messages: {
        Row: {
          body: string;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string | null;
        };
        Insert: {
          body: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id?: string | null;
        };
        Update: {
          body?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          client_id: string;
          client_unread: boolean;
          created_at: string;
          id: string;
          last_message_at: string;
          owner_unread: boolean;
          project_id: string | null;
          status: string;
          subject: string;
        };
        Insert: {
          client_id?: string;
          client_unread?: boolean;
          created_at?: string;
          id?: string;
          last_message_at?: string;
          owner_unread?: boolean;
          project_id?: string | null;
          status?: string;
          subject: string;
        };
        Update: {
          client_id?: string;
          client_unread?: boolean;
          created_at?: string;
          id?: string;
          last_message_at?: string;
          owner_unread?: boolean;
          project_id?: string | null;
          status?: string;
          subject?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          link: string | null;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          company: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          is_suspended: boolean;
          phone: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          company?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id: string;
          is_suspended?: boolean;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          company?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          is_suspended?: boolean;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_collaborators: {
        Row: {
          architect_id: string;
          can_edit: boolean;
          can_upload: boolean;
          created_at: string;
          credit_role: string | null;
          id: string;
          project_id: string;
          sort_order: number;
        };
        Insert: {
          architect_id: string;
          can_edit?: boolean;
          can_upload?: boolean;
          created_at?: string;
          credit_role?: string | null;
          id?: string;
          project_id: string;
          sort_order?: number;
        };
        Update: {
          architect_id?: string;
          can_edit?: boolean;
          can_upload?: boolean;
          created_at?: string;
          credit_role?: string | null;
          id?: string;
          project_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "project_collaborators_architect_id_fkey";
            columns: ["architect_id"];
            isOneToOne: false;
            referencedRelation: "architects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_collaborators_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_media: {
        Row: {
          caption: string | null;
          created_at: string;
          file_name: string | null;
          id: string;
          kind: string;
          mime_type: string | null;
          path: string;
          project_id: string;
          sort_order: number;
          uploaded_by: string | null;
          url: string;
        };
        Insert: {
          caption?: string | null;
          created_at?: string;
          file_name?: string | null;
          id?: string;
          kind?: string;
          mime_type?: string | null;
          path: string;
          project_id: string;
          sort_order?: number;
          uploaded_by?: string | null;
          url: string;
        };
        Update: {
          caption?: string | null;
          created_at?: string;
          file_name?: string | null;
          id?: string;
          kind?: string;
          mime_type?: string | null;
          path?: string;
          project_id?: string;
          sort_order?: number;
          uploaded_by?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_media_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_media_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          area: string | null;
          category: string | null;
          cover_url: string | null;
          created_at: string;
          created_by: string | null;
          description: string | null;
          design_concept: string | null;
          featured: boolean;
          id: string;
          is_shared: boolean;
          location: string | null;
          materials: string | null;
          original_architect_id: string | null;
          slug: string;
          software: string | null;
          sort_order: number;
          source_url: string | null;
          status: string;
          summary: string | null;
          tags: string[];
          title: string;
          updated_at: string;
          visibility: string;
          year: number | null;
        };
        Insert: {
          area?: string | null;
          category?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          design_concept?: string | null;
          featured?: boolean;
          id?: string;
          is_shared?: boolean;
          location?: string | null;
          materials?: string | null;
          original_architect_id?: string | null;
          slug: string;
          software?: string | null;
          sort_order?: number;
          source_url?: string | null;
          status?: string;
          summary?: string | null;
          tags?: string[];
          title: string;
          updated_at?: string;
          visibility?: string;
          year?: number | null;
        };
        Update: {
          area?: string | null;
          category?: string | null;
          cover_url?: string | null;
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          design_concept?: string | null;
          featured?: boolean;
          id?: string;
          is_shared?: boolean;
          location?: string | null;
          materials?: string | null;
          original_architect_id?: string | null;
          slug?: string;
          software?: string | null;
          sort_order?: number;
          source_url?: string | null;
          status?: string;
          summary?: string | null;
          tags?: string[];
          title?: string;
          updated_at?: string;
          visibility?: string;
          year?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "projects_original_architect_id_fkey";
            columns: ["original_architect_id"];
            isOneToOne: false;
            referencedRelation: "architects";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          project_id: string;
          reason: string;
          reporter_id: string;
          resolution_note: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          status: string;
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          project_id: string;
          reason: string;
          reporter_id?: string;
          resolution_note?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          project_id?: string;
          reason?: string;
          reporter_id?: string;
          resolution_note?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reports_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_resolved_by_fkey";
            columns: ["resolved_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      site_profile: {
        Row: {
          avatar_path: string | null;
          avatar_url: string | null;
          bio: string | null;
          credentials: string | null;
          cv_url: string | null;
          education: string | null;
          full_name: string;
          headline: string | null;
          id: number;
          instagram_url: string | null;
          linkedin_url: string | null;
          location: string | null;
          phone: string | null;
          public_email: string | null;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          avatar_path?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          credentials?: string | null;
          cv_url?: string | null;
          education?: string | null;
          full_name?: string;
          headline?: string | null;
          id?: number;
          instagram_url?: string | null;
          linkedin_url?: string | null;
          location?: string | null;
          phone?: string | null;
          public_email?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          avatar_path?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          credentials?: string | null;
          cv_url?: string | null;
          education?: string | null;
          full_name?: string;
          headline?: string | null;
          id?: number;
          instagram_url?: string | null;
          linkedin_url?: string | null;
          location?: string | null;
          phone?: string | null;
          public_email?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_set_user_role: {
        Args: { p_role: string; p_user: string };
        Returns: undefined;
      };
      admin_set_user_suspended: {
        Args: { p_suspended: boolean; p_user: string };
        Returns: undefined;
      };
      respond_to_invite: {
        Args: { p_accept: boolean; p_invite: string };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
