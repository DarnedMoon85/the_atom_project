import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we have valid Supabase credentials
export const hasSupabaseCredentials = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

if (!hasSupabaseCredentials) {
  console.warn('Supabase environment variables are not set. Using placeholder client. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for production use.');
}

// Create client with actual credentials or placeholder values that pass validation
// Placeholder values are valid format but won't work for actual requests
export const supabase = createClient<Database>(
  hasSupabaseCredentials ? supabaseUrl : 'https://placeholder.supabase.co',
  hasSupabaseCredentials ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder'
);
