// Database types for Supabase
// This will be generated from Supabase, but providing a basic structure for now

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
      sessions: {
        Row: {
          id: string
          lpn: string
          state: string
          order_id: string | null
          prefix: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          lpn: string
          state: string
          order_id?: string | null
          prefix?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          lpn?: string
          state?: string
          order_id?: string | null
          prefix?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          item_code: string
          description: string | null
          prefix: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_code: string
          description?: string | null
          prefix?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_code?: string
          description?: string | null
          prefix?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      session_items: {
        Row: {
          id: string
          session_id: string
          item_id: string
          scanned_at: string
        }
        Insert: {
          id?: string
          session_id: string
          item_id: string
          scanned_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          item_id?: string
          scanned_at?: string
        }
      }
    }
  }
}
