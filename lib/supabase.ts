import { createClient } from '@supabase/supabase-js'

// Set these in your env: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export function isSupabaseConfigured(): boolean {
  return supabase !== null
}

// ---- edit-key session (kept only in memory for this tab) ----
let editKey: string | null = null

export function getEditKey(): string | null {
  return editKey
}

export function clearEditKey(): void {
  editKey = null
}

/**
 * Verify the edit passphrase against the database.
 * The real protection lives in the DB: writes only succeed
 * through the kb_* RPCs, which re-check the key server-side.
 */
export async function verifyEditKey(key: string): Promise<boolean> {
  if (!supabase) return false
  try {
    const { data, error } = await supabase.rpc('kb_verify_key', { p_key: key })
    if (error || data !== true) return false
    editKey = key // remember for this tab only (not persisted)
    return true
  } catch {
    return false
  }
}
