export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const missingVariables = [
    !supabaseUrl && "NEXT_PUBLIC_SUPABASE_URL",
    !supabaseAnonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter(Boolean)

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Missing required Supabase environment variable(s): ${missingVariables.join(", ")}. ` +
        "Copy .env.example to .env.local, add the values from Supabase Project Settings > API, and restart the dev server.",
    )
  }

  return { supabaseUrl, supabaseAnonKey }
}
