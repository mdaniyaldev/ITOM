export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admin_permissions: {
        Row: {
          admin_user_id: string;
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          level: string;
          module: string;
          updated_at: string | null;
        };
        Insert: {
          admin_user_id: string;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          level: string;
          module: string;
          updated_at?: string | null;
        };
        Update: {
          admin_user_id?: string;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          level?: string;
          module?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_permissions_admin_user_id_fkey";
            columns: ["admin_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          action_type: string;
          changes: Json | null;
          created_at: string | null;
          deleted_at: string | null;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_address: unknown;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action_type: string;
          changes?: Json | null;
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_address?: unknown;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action_type?: string;
          changes?: Json | null;
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip_address?: unknown;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      case_studies: {
        Row: {
          box1_description: string | null;
          box2_description: string | null;
          box3_description: string | null;
          box4_description: string | null;
          box5_description: string | null;
          country: string | null;
          created_at: string | null;
          deleted_at: string | null;
          field: string | null;
          has_rights_tick: boolean;
          has_true_tick: boolean;
          id: string;
          likes: number | null;
          main_card_description: string | null;
          shares: number | null;
          source_link: string | null;
          status: string | null;
          title: string;
          updated_at: string | null;
          user_id: string;
          views: number | null;
          visibility: string;
          who_it_is_about: string;
        };
        Insert: {
          box1_description?: string | null;
          box2_description?: string | null;
          box3_description?: string | null;
          box4_description?: string | null;
          box5_description?: string | null;
          country?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          field?: string | null;
          has_rights_tick: boolean;
          has_true_tick: boolean;
          id?: string;
          likes?: number | null;
          main_card_description?: string | null;
          shares?: number | null;
          source_link?: string | null;
          status?: string | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
          views?: number | null;
          visibility?: string;
          who_it_is_about: string;
        };
        Update: {
          box1_description?: string | null;
          box2_description?: string | null;
          box3_description?: string | null;
          box4_description?: string | null;
          box5_description?: string | null;
          country?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          field?: string | null;
          has_rights_tick?: boolean;
          has_true_tick?: boolean;
          id?: string;
          likes?: number | null;
          main_card_description?: string | null;
          shares?: number | null;
          source_link?: string | null;
          status?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
          views?: number | null;
          visibility?: string;
          who_it_is_about?: string;
        };
        Relationships: [
          {
            foreignKeyName: "case_studies_country_fkey";
            columns: ["country"];
            isOneToOne: false;
            referencedRelation: "master_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "case_studies_field_fkey";
            columns: ["field"];
            isOneToOne: false;
            referencedRelation: "master_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "case_studies_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      email_log: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          error_message: string | null;
          id: string;
          sent_at: string | null;
          status: string;
          subject: string;
          template_key: string;
          to_email: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          error_message?: string | null;
          id?: string;
          sent_at?: string | null;
          status: string;
          subject: string;
          template_key: string;
          to_email: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          error_message?: string | null;
          id?: string;
          sent_at?: string | null;
          status?: string;
          subject?: string;
          template_key?: string;
          to_email?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "email_log_template_key_fkey";
            columns: ["template_key"];
            isOneToOne: false;
            referencedRelation: "email_templates";
            referencedColumns: ["template_name"];
          },
          {
            foreignKeyName: "email_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      email_templates: {
        Row: {
          body: string;
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          is_active: boolean | null;
          subject: string;
          template_name: string;
          updated_at: string | null;
        };
        Insert: {
          body: string;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          subject: string;
          template_name: string;
          updated_at?: string | null;
        };
        Update: {
          body?: string;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          subject?: string;
          template_name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      field_visibility: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          entity_id: string;
          entity_type: string;
          field_name: string;
          id: string;
          locked_at: string | null;
          locked_by: string | null;
          updated_at: string | null;
          visibility: string;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id: string;
          entity_type: string;
          field_name: string;
          id?: string;
          locked_at?: string | null;
          locked_by?: string | null;
          updated_at?: string | null;
          visibility: string;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          field_name?: string;
          id?: string;
          locked_at?: string | null;
          locked_by?: string | null;
          updated_at?: string | null;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "field_visibility_locked_by_fkey";
            columns: ["locked_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      file_access_requests: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          file_id: string;
          id: string;
          request_message: string | null;
          requester_user_id: string;
          responded_at: string | null;
          responded_by: string | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          file_id: string;
          id?: string;
          request_message?: string | null;
          requester_user_id: string;
          responded_at?: string | null;
          responded_by?: string | null;
          status: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          file_id?: string;
          id?: string;
          request_message?: string | null;
          requester_user_id?: string;
          responded_at?: string | null;
          responded_by?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "file_access_requests_file_id_fkey";
            columns: ["file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "file_access_requests_requester_user_id_fkey";
            columns: ["requester_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "file_access_requests_responded_by_fkey";
            columns: ["responded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      files: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          entity_id: string;
          entity_type: string;
          file_name: string;
          file_size: number;
          file_type: string;
          file_url: string;
          id: string;
          status: string;
          updated_at: string | null;
          user_id: string;
          virus_scan_result: string | null;
          visibility: string;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id: string;
          entity_type: string;
          file_name: string;
          file_size: number;
          file_type: string;
          file_url: string;
          id?: string;
          status: string;
          updated_at?: string | null;
          user_id: string;
          virus_scan_result?: string | null;
          visibility: string;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          file_name?: string;
          file_size?: number;
          file_type?: string;
          file_url?: string;
          id?: string;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
          virus_scan_result?: string | null;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "files_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      idea_steps: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          idea_id: string;
          proof_approved: boolean | null;
          proof_submitted: string | null;
          status: string;
          step_no: number;
          updated_at: string | null;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          idea_id: string;
          proof_approved?: boolean | null;
          proof_submitted?: string | null;
          status: string;
          step_no: number;
          updated_at?: string | null;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          idea_id?: string;
          proof_approved?: boolean | null;
          proof_submitted?: string | null;
          status?: string;
          step_no?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "idea_steps_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "ideas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "idea_steps_step_no_fkey";
            columns: ["step_no"];
            isOneToOne: false;
            referencedRelation: "steps_master";
            referencedColumns: ["step_no"];
          },
        ];
      };
      ideas: {
        Row: {
          badge: string | null;
          created_at: string | null;
          current_step: number | null;
          deleted_at: string | null;
          filing_status: string | null;
          how_it_works: string;
          id: string;
          kind_of_idea: string | null;
          likes: number | null;
          money_in_usd: number | null;
          money_needed_usd: number | null;
          name: string;
          ownership: string | null;
          problem: string;
          score: number | null;
          status: string | null;
          told_whom: string | null;
          updated_at: string | null;
          user_id: string;
          views: number | null;
          visibility: string;
        };
        Insert: {
          badge?: string | null;
          created_at?: string | null;
          current_step?: number | null;
          deleted_at?: string | null;
          filing_status?: string | null;
          how_it_works: string;
          id?: string;
          kind_of_idea?: string | null;
          likes?: number | null;
          money_in_usd?: number | null;
          money_needed_usd?: number | null;
          name: string;
          ownership?: string | null;
          problem: string;
          score?: number | null;
          status?: string | null;
          told_whom?: string | null;
          updated_at?: string | null;
          user_id: string;
          views?: number | null;
          visibility?: string;
        };
        Update: {
          badge?: string | null;
          created_at?: string | null;
          current_step?: number | null;
          deleted_at?: string | null;
          filing_status?: string | null;
          how_it_works?: string;
          id?: string;
          kind_of_idea?: string | null;
          likes?: number | null;
          money_in_usd?: number | null;
          money_needed_usd?: number | null;
          name?: string;
          ownership?: string | null;
          problem?: string;
          score?: number | null;
          status?: string | null;
          told_whom?: string | null;
          updated_at?: string | null;
          user_id?: string;
          views?: number | null;
          visibility?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ideas_kind_of_idea_fkey";
            columns: ["kind_of_idea"];
            isOneToOne: false;
            referencedRelation: "master_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ideas_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      inventor_profiles: {
        Row: {
          badge: string | null;
          city: string | null;
          country: string | null;
          created_at: string | null;
          deleted_at: string | null;
          email_verified: boolean | null;
          field_of_work: string | null;
          id: string;
          name: string;
          phone: string;
          photo_url: string;
          qualification: string | null;
          score: number | null;
          self_description: string | null;
          status: string | null;
          team_details: Json | null;
          updated_at: string | null;
          user_id: string;
          visibility: string;
          what_you_do: string | null;
          where_you_work_or_study: string | null;
        };
        Insert: {
          badge?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email_verified?: boolean | null;
          field_of_work?: string | null;
          id?: string;
          name: string;
          phone: string;
          photo_url: string;
          qualification?: string | null;
          score?: number | null;
          self_description?: string | null;
          status?: string | null;
          team_details?: Json | null;
          updated_at?: string | null;
          user_id: string;
          visibility?: string;
          what_you_do?: string | null;
          where_you_work_or_study?: string | null;
        };
        Update: {
          badge?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          email_verified?: boolean | null;
          field_of_work?: string | null;
          id?: string;
          name?: string;
          phone?: string;
          photo_url?: string;
          qualification?: string | null;
          score?: number | null;
          self_description?: string | null;
          status?: string | null;
          team_details?: Json | null;
          updated_at?: string | null;
          user_id?: string;
          visibility?: string;
          what_you_do?: string | null;
          where_you_work_or_study?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "inventor_profiles_country_fkey";
            columns: ["country"];
            isOneToOne: false;
            referencedRelation: "master_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventor_profiles_field_of_work_fkey";
            columns: ["field_of_work"];
            isOneToOne: false;
            referencedRelation: "master_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventor_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventor_profiles_what_you_do_fkey";
            columns: ["what_you_do"];
            isOneToOne: false;
            referencedRelation: "master_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      investor_profiles: {
        Row: {
          badge: string | null;
          contact_person: string | null;
          contact_phone: string;
          country: string | null;
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          investment_countries: string[] | null;
          logo_url: string | null;
          looking_for: string | null;
          name: string;
          past_investments: Json | null;
          reply_speed: string | null;
          score: number | null;
          status: string | null;
          type: string | null;
          updated_at: string | null;
          user_id: string;
          verified_at: string | null;
          visibility: string;
          what_you_give: string | null;
        };
        Insert: {
          badge?: string | null;
          contact_person?: string | null;
          contact_phone: string;
          country?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          investment_countries?: string[] | null;
          logo_url?: string | null;
          looking_for?: string | null;
          name: string;
          past_investments?: Json | null;
          reply_speed?: string | null;
          score?: number | null;
          status?: string | null;
          type?: string | null;
          updated_at?: string | null;
          user_id: string;
          verified_at?: string | null;
          visibility?: string;
          what_you_give?: string | null;
        };
        Update: {
          badge?: string | null;
          contact_person?: string | null;
          contact_phone?: string;
          country?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          investment_countries?: string[] | null;
          logo_url?: string | null;
          looking_for?: string | null;
          name?: string;
          past_investments?: Json | null;
          reply_speed?: string | null;
          score?: number | null;
          status?: string | null;
          type?: string | null;
          updated_at?: string | null;
          user_id?: string;
          verified_at?: string | null;
          visibility?: string;
          what_you_give?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "investor_profiles_country_fkey";
            columns: ["country"];
            isOneToOne: false;
            referencedRelation: "master_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_profiles_reply_speed_fkey";
            columns: ["reply_speed"];
            isOneToOne: false;
            referencedRelation: "master_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_profiles_type_fkey";
            columns: ["type"];
            isOneToOne: false;
            referencedRelation: "master_lists";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "investor_profiles_what_you_give_fkey";
            columns: ["what_you_give"];
            isOneToOne: false;
            referencedRelation: "master_lists";
            referencedColumns: ["id"];
          },
        ];
      };
      master_lists: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          is_active: boolean | null;
          list_label: string;
          list_name: string;
          list_value: string;
          sort_order: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          list_label: string;
          list_name: string;
          list_value: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          list_label?: string;
          list_name?: string;
          list_value?: string;
          sort_order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          created_at: string | null;
          deleted_at: string | null;
          file_id: string | null;
          id: string;
          sender_user_id: string;
          thread_id: string;
          updated_at: string | null;
        };
        Insert: {
          body: string;
          created_at?: string | null;
          deleted_at?: string | null;
          file_id?: string | null;
          id?: string;
          sender_user_id: string;
          thread_id: string;
          updated_at?: string | null;
        };
        Update: {
          body?: string;
          created_at?: string | null;
          deleted_at?: string | null;
          file_id?: string | null;
          id?: string;
          sender_user_id?: string;
          thread_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_file_id_fkey";
            columns: ["file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_user_id_fkey";
            columns: ["sender_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "threads";
            referencedColumns: ["id"];
          },
        ];
      };
      nda_acceptances: {
        Row: {
          accepted: boolean;
          accepted_at: string | null;
          created_at: string | null;
          deleted_at: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          accepted: boolean;
          accepted_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          accepted?: boolean;
          accepted_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nda_acceptances_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string | null;
          deleted_at: string | null;
          entity_id: string | null;
          entity_type: string | null;
          id: string;
          is_read: boolean | null;
          title: string;
          type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          is_read?: boolean | null;
          title: string;
          type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id?: string | null;
          entity_type?: string | null;
          id?: string;
          is_read?: boolean | null;
          title?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      reports_blocks: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          kind: string;
          reason: string;
          reporter_id: string;
          status: string;
          thread_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          kind: string;
          reason: string;
          reporter_id: string;
          status: string;
          thread_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          kind?: string;
          reason?: string;
          reporter_id?: string;
          status?: string;
          thread_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reports_blocks_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_blocks_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "threads";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          created_at: string | null;
          decision_reason: string | null;
          deleted_at: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          locked_at: string | null;
          locked_by: string | null;
          reviewer_user_id: string | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          decision_reason?: string | null;
          deleted_at?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          locked_at?: string | null;
          locked_by?: string | null;
          reviewer_user_id?: string | null;
          status: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          decision_reason?: string | null;
          deleted_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          locked_at?: string | null;
          locked_by?: string | null;
          reviewer_user_id?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_locked_by_fkey";
            columns: ["locked_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_reviewer_user_id_fkey";
            columns: ["reviewer_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      revisions: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          entity_id: string;
          entity_type: string;
          field_name: string;
          id: string;
          new_value: string | null;
          old_value: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string;
          submitted_at: string | null;
          submitted_by: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id: string;
          entity_type: string;
          field_name: string;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status: string;
          submitted_at?: string | null;
          submitted_by?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          field_name?: string;
          id?: string;
          new_value?: string | null;
          old_value?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string;
          submitted_at?: string | null;
          submitted_by?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "revisions_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "revisions_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      score_history: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          override_by: string | null;
          points: number;
          reason: string | null;
          rule: string;
          source: string;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          override_by?: string | null;
          points: number;
          reason?: string | null;
          rule: string;
          source: string;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          override_by?: string | null;
          points?: number;
          reason?: string | null;
          rule?: string;
          source?: string;
        };
        Relationships: [
          {
            foreignKeyName: "score_history_override_by_fkey";
            columns: ["override_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      steps_master: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          description: string | null;
          id: string;
          name: string;
          points_awarded: number;
          required_proof: string | null;
          step_no: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          points_awarded: number;
          required_proof?: string | null;
          step_no: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          points_awarded?: number;
          required_proof?: string | null;
          step_no?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      thread_outcomes: {
        Row: {
          created_at: string | null;
          decided_at: string | null;
          decided_by: string | null;
          deleted_at: string | null;
          id: string;
          outcome: string;
          thread_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          decided_at?: string | null;
          decided_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          outcome: string;
          thread_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          decided_at?: string | null;
          decided_by?: string | null;
          deleted_at?: string | null;
          id?: string;
          outcome?: string;
          thread_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "thread_outcomes_decided_by_fkey";
            columns: ["decided_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "thread_outcomes_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "threads";
            referencedColumns: ["id"];
          },
        ];
      };
      threads: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          idea_id: string | null;
          initiator_user_id: string;
          last_message_at: string | null;
          recipient_user_id: string;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          idea_id?: string | null;
          initiator_user_id: string;
          last_message_at?: string | null;
          recipient_user_id: string;
          status: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          idea_id?: string | null;
          initiator_user_id?: string;
          last_message_at?: string | null;
          recipient_user_id?: string;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "threads_idea_id_fkey";
            columns: ["idea_id"];
            isOneToOne: false;
            referencedRelation: "ideas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "threads_initiator_user_id_fkey";
            columns: ["initiator_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "threads_recipient_user_id_fkey";
            columns: ["recipient_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          approved_at: string | null;
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          is_approved: boolean | null;
          role: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          approved_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          is_approved?: boolean | null;
          role: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          approved_at?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          is_approved?: boolean | null;
          role?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          country: string | null;
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          name: string;
          phone: string;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          country?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          id: string;
          name: string;
          phone: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          country?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          name?: string;
          phone?: string;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      views_likes: {
        Row: {
          created_at: string | null;
          deleted_at: string | null;
          entity_id: string;
          entity_type: string;
          id: string;
          kind: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id: string;
          entity_type: string;
          id?: string;
          kind: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          deleted_at?: string | null;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          kind?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "views_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean };
      is_approved_member: { Args: { user_id: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
