// Generated from the Supabase schema (supabase/migrations). Regenerate after schema changes.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert> = { Row: Row; Insert: Insert; Update: Partial<Insert>; Relationships: [] };

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      api_keys: Table<
        {
          created_at: string;
          id: string;
          key_hash: string;
          last_used_at: string | null;
          name: string;
          prefix: string;
          revoked_at: string | null;
          user_id: string;
        },
        {
          created_at?: string;
          id?: string;
          key_hash: string;
          last_used_at?: string | null;
          name: string;
          prefix: string;
          revoked_at?: string | null;
          user_id: string;
        }
      >;
      jobs: Table<
        {
          created_at: string;
          finished_at: string | null;
          id: string;
          input: Json;
          item_count: number;
          kind: string;
          processed_at: string | null;
          status: string;
          status_message: string | null;
          upstream_dataset_id: string | null;
          upstream_run_id: string | null;
        },
        {
          created_at?: string;
          finished_at?: string | null;
          id?: string;
          input: Json;
          item_count?: number;
          kind: string;
          processed_at?: string | null;
          status?: string;
          status_message?: string | null;
          upstream_dataset_id?: string | null;
          upstream_run_id?: string | null;
        }
      >;
      profiles: Table<
        {
          company: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          webhook_url: string | null;
          webhook_secret: string | null;
          webhook_last_status: number | null;
          webhook_last_at: string | null;
        },
        {
          company?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          webhook_url?: string | null;
          webhook_secret?: string | null;
          webhook_last_status?: number | null;
          webhook_last_at?: string | null;
        }
      >;
      run_items: Table<
        { data: Json; id: number; position: number; run_id: string; short_code: string | null; user_id: string },
        { data: Json; position: number; run_id: string; short_code?: string | null; user_id: string }
      >;
      runs: Table<
        {
          cost_usd: number;
          finished_at: string | null;
          id: string;
          input: Json;
          job_id: string | null;
          origin: string;
          result_count: number;
          started_at: string;
          status: string;
          status_message: string | null;
          targets: string[];
          user_id: string;
          short_id: string;
        },
        {
          cost_usd?: number;
          finished_at?: string | null;
          id?: string;
          input: Json;
          job_id?: string | null;
          origin: string;
          result_count?: number;
          started_at?: string;
          status?: string;
          status_message?: string | null;
          targets?: string[];
          user_id: string;
        }
      >;
      snapshots: Table<
        {
          comments: number | null;
          data: Json;
          id: number;
          likes: number | null;
          plays: number | null;
          run_id: string | null;
          shares: number | null;
          taken_at: string;
          tracked_post_id: string;
          user_id: string;
          views: number | null;
        },
        {
          comments?: number | null;
          data: Json;
          likes?: number | null;
          plays?: number | null;
          run_id?: string | null;
          shares?: number | null;
          taken_at?: string;
          tracked_post_id: string;
          user_id: string;
          views?: number | null;
        }
      >;
      tracked_posts: Table<
        {
          caption: string | null;
          comments: number | null;
          created_at: string;
          display_url: string | null;
          ends_at: string | null;
          id: string;
          include_shares: boolean;
          interval_minutes: number;
          last_checked_at: string | null;
          latest: Json | null;
          likes: number | null;
          next_check_at: string;
          owner_username: string | null;
          plays: number | null;
          product_type: string | null;
          shares: number | null;
          short_code: string;
          snapshot_count: number;
          status: string;
          url: string;
          user_id: string;
          views: number | null;
        },
        {
          caption?: string | null;
          comments?: number | null;
          created_at?: string;
          display_url?: string | null;
          ends_at?: string | null;
          id?: string;
          include_shares?: boolean;
          interval_minutes?: number;
          last_checked_at?: string | null;
          latest?: Json | null;
          likes?: number | null;
          next_check_at?: string;
          owner_username?: string | null;
          plays?: number | null;
          product_type?: string | null;
          shares?: number | null;
          short_code: string;
          snapshot_count?: number;
          status?: string;
          url: string;
          user_id: string;
          views?: number | null;
        }
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type RunRow = Tables<"runs">;
export type TrackedPostRow = Tables<"tracked_posts">;
export type SnapshotRow = Tables<"snapshots">;
export type ApiKeyRow = Tables<"api_keys">;
