import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://afnwhdoqdwopvcsdgswi.supabase.co";

export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_1EcdaBYdh9GVIVTdqtWZoQ_anWOqq8a";

export function getSupabaseClient() {
  if (!client) client = createClient(supabaseUrl, supabasePublishableKey);
  return client;
}
