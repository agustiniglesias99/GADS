import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. ' +
    'Copiá .env.example a .env y completá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
  )
}

// Untyped client: query results are mapped to the app's real types in
// src/lib/api.ts. (The schema is documented in src/lib/database.types.ts.)
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
