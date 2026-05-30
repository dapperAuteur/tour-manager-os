import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { backfillHelpEmbeddings } from '@/lib/help/embed-articles'

// One-shot admin endpoint: scans help_articles for rows whose
// embedding_model doesn't match the current AI_EMBEDDING_MODEL and
// re-embeds them. Idempotent; safe to call repeatedly.
//
// Gated by isSuperAdmin so a stray bearer token can't burn through
// embedding-API quota. Call via:
//   curl -X POST -H "Cookie: <session>" https://.../api/admin/help/backfill-embeddings
export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const result = await backfillHelpEmbeddings()
  return NextResponse.json(result)
}
