// Shared Supabase client for Edge Functions
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const createServiceClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
};

export const createAuthenticatedClient = (authToken: string) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  
  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  });
};
