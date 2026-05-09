// Supabase client - connects to your Supabase project.
// Uses the anon (public) key, which is safe to expose in client-side code.
// Row Level Security on the database controls what users can actually do.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
