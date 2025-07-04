// Utility functions for server-side authentication handling
// Provides a helper to retrieve the authenticated Supabase user either from
// cookie-based auth (via auth-helpers) or falling back to an Authorization header.
//
// This allows API routes that depend on createSupabaseServerClient() – which only
// checks cookies – to also work when the frontend explicitly passes the access
// token in a Bearer header.

import { createClient, type User } from '@supabase/supabase-js'

/**
 * Resolve current authenticated user from the incoming request.
 *
 * Looks for `Authorization: Bearer <token>` header and validates the JWT via
 * Supabase admin client. If that fails, it tries a best-effort decode of the
 * token payload (non-verified) to obtain the user id / email.
 */
export const getAuthUser = async (request: Request): Promise<User | null> => {
  // Look for Authorization header
  const authHeader = request.headers.get('authorization') || ''
  const [, token] = authHeader.match(/^Bearer\s+(.+)$/i) ?? []
  if (!token) return null

  // Validate token using Supabase admin API
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
    }
  )
  try {
    const { data } = await supabaseAdmin.auth.getUser(token)
    if (data.user) return data.user
  } catch (_) {
    // fall through to manual decode
  }

  // Decode JWT payload as last resort (NOT verified)
  try {
    const [, payloadB64] = token.split('.')
    const json = JSON.parse(Buffer.from(payloadB64, 'base64').toString())
    return {
      id: json.sub,
      email: json.email,
      aud: json.aud,
      role: json.role,
      app_metadata: json.app_metadata,
      user_metadata: json.user_metadata,
      created_at: '',
      identities: [],
    } as unknown as User
  } catch (_) {
    return null
  }
}
