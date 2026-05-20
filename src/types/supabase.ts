export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type TableDefinition<Row, Insert = Row, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: never[];
};

export type Database = {
  public: {
    Tables: {
      teams: TableDefinition<
        {
          id: string;
          name: string;
          leader_user_id: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          leader_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      users: TableDefinition<
        {
          id: string;
          name: string;
          email: string;
          role: string;
          team_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          name: string;
          email: string;
          role: string;
          team_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      letters: TableDefinition<
        {
          id: string;
          subject: string;
          recipient: string;
          letter_date: string;
          creator_user_id: string;
          team_id: string;
          status: string;
          current_reviewer_role: string | null;
          revision_target_role: string | null;
          revision_round: number;
          google_doc_id: string | null;
          google_doc_url: string | null;
          final_version_id: string | null;
          srikandi_reference_number: string | null;
          srikandi_reference_url: string | null;
          srikandi_processed_at: string | null;
          data_classification: string;
          cancel_reason: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          subject: string;
          recipient: string;
          letter_date: string;
          creator_user_id: string;
          team_id: string;
          status?: string;
          current_reviewer_role?: string | null;
          revision_target_role?: string | null;
          revision_round?: number;
          google_doc_id?: string | null;
          google_doc_url?: string | null;
          final_version_id?: string | null;
          srikandi_reference_number?: string | null;
          srikandi_reference_url?: string | null;
          srikandi_processed_at?: string | null;
          data_classification?: string;
          cancel_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      letter_versions: TableDefinition<
        {
          id: string;
          letter_id: string;
          parent_version_id: string | null;
          version_number: number;
          revision_round: number;
          version_type: string;
          title: string;
          source_type: string;
          storage_path: string | null;
          file_url: string | null;
          file_mime_type: string | null;
          file_size_bytes: number | null;
          checksum_sha256: string | null;
          google_doc_id: string | null;
          google_doc_url: string | null;
          comments_json: Json | null;
          created_by_user_id: string;
          reviewer_user_id: string | null;
          reviewer_role: string | null;
          notes: string | null;
          change_summary: string | null;
          exported_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          letter_id: string;
          parent_version_id?: string | null;
          version_number: number;
          revision_round?: number;
          version_type: string;
          title: string;
          source_type: string;
          storage_path?: string | null;
          file_url?: string | null;
          file_mime_type?: string | null;
          file_size_bytes?: number | null;
          checksum_sha256?: string | null;
          google_doc_id?: string | null;
          google_doc_url?: string | null;
          comments_json?: Json | null;
          created_by_user_id: string;
          reviewer_user_id?: string | null;
          reviewer_role?: string | null;
          notes?: string | null;
          change_summary?: string | null;
          exported_at?: string | null;
          created_at?: string;
        }
      >;
      correction_snapshot_jobs: TableDefinition<
        {
          id: string;
          letter_id: string;
          requested_by_user_id: string;
          reviewer_role: string;
          source_google_doc_id: string | null;
          status: string;
          error_message: string | null;
          result_version_id: string | null;
          created_at: string;
          completed_at: string | null;
        },
        {
          id?: string;
          letter_id: string;
          requested_by_user_id: string;
          reviewer_role: string;
          source_google_doc_id?: string | null;
          status?: string;
          error_message?: string | null;
          result_version_id?: string | null;
          created_at?: string;
          completed_at?: string | null;
        }
      >;
      approvals: TableDefinition<
        {
          id: string;
          letter_id: string;
          actor_user_id: string;
          actor_role: string;
          action: string;
          from_status: string | null;
          to_status: string | null;
          notes: string | null;
          version_id: string | null;
          created_at: string;
        },
        {
          id?: string;
          letter_id: string;
          actor_user_id: string;
          actor_role: string;
          action: string;
          from_status?: string | null;
          to_status?: string | null;
          notes?: string | null;
          version_id?: string | null;
          created_at?: string;
        }
      >;
      audit_logs: TableDefinition<
        {
          id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          actor_user_id: string | null;
          actor_role: string | null;
          from_status: string | null;
          to_status: string | null;
          metadata: Json;
          created_at: string;
        },
        {
          id?: string;
          entity_type: string;
          entity_id: string;
          action: string;
          actor_user_id?: string | null;
          actor_role?: string | null;
          from_status?: string | null;
          to_status?: string | null;
          metadata?: Json;
          created_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      create_draft_letter: {
        Args: {
          input_letter_id: string;
          input_subject: string;
          input_recipient: string;
          input_letter_date: string;
          input_creator_user_id: string;
          input_team_id: string;
          input_google_doc_id?: string | null;
          input_google_doc_url?: string | null;
          input_data_classification?: string;
          input_storage_path?: string | null;
          input_file_url?: string | null;
          input_file_mime_type?: string | null;
          input_file_size_bytes?: number | null;
          input_checksum_sha256?: string | null;
          input_source_type?: string | null;
        };
        Returns: {
          letter_id: string;
          version_id: string | null;
        }[];
      };
      submit_draft_to_general_subdivision: {
        Args: {
          input_letter_id: string;
          input_actor_user_id: string;
        };
        Returns: {
          letter_id: string;
          version_id: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
