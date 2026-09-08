import type { SupabaseClient } from "@supabase/supabase-js";

export async function assertAdmin(context: { supabase: SupabaseClient; userId: string }) {
  const { data, error } = await context.supabase.rpc("is_admin");
  if (error) throw new Error(error.message);
  if (!data) throw new Error("You do not have admin access.");
}
