import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'

// Diagnostic endpoint: hits Cerebras's /v1/models list endpoint AND
// tries a small completion against each candidate model name so we
// can see exactly which name the user's account has access to. We
// kept getting `model_not_found` for llama-3.3-70b / llama3.3-70b in
// production; Cerebras doesn't document name format clearly and
// accounts have different model access. This is the fastest way to
// find what actually works.
//
// Super-admin only. Returns JSON with the model list + per-candidate
// probe results.

const CANDIDATES = [
  'llama-3.3-70b',
  'llama3.3-70b',
  'llama-3.1-8b',
  'llama3.1-8b',
  'llama-3.1-70b',
  'llama3.1-70b',
  'llama-4-scout-17b-16e-instruct',
  'qwen-3-32b',
  'gpt-oss-120b',
  'deepseek-r1-distill-llama-70b',
]

interface ProbeResult {
  model: string
  ok: boolean
  status: number
  error: string | null
}

async function probe(modelName: string, apiKey: string): Promise<ProbeResult> {
  try {
    const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 4,
      }),
    })
    const text = await res.text()
    if (res.ok) return { model: modelName, ok: true, status: res.status, error: null }
    // Truncate Cerebras's error body for readability.
    return {
      model: modelName,
      ok: false,
      status: res.status,
      error: text.slice(0, 300),
    }
  } catch (err) {
    return {
      model: modelName,
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const apiKey = process.env.CEREBRAS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'CEREBRAS_API_KEY unset' }, { status: 503 })
  }

  // 1) Ask Cerebras for the model list.
  let modelsListed: string[] = []
  let modelsListError: string | null = null
  try {
    const res = await fetch('https://api.cerebras.ai/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (res.ok) {
      const json = (await res.json()) as { data?: { id: string }[] }
      modelsListed = (json.data || []).map((m) => m.id)
    } else {
      modelsListError = `${res.status} ${await res.text().then((t) => t.slice(0, 200))}`
    }
  } catch (err) {
    modelsListError = err instanceof Error ? err.message : 'unknown'
  }

  // 2) Probe each candidate with a tiny chat completion.
  const probes = await Promise.all(CANDIDATES.map((m) => probe(m, apiKey)))

  const working = probes.filter((p) => p.ok).map((p) => p.model)

  return NextResponse.json({
    models_listed: modelsListed,
    models_list_error: modelsListError,
    candidates_tried: CANDIDATES,
    working_candidates: working,
    all_probes: probes,
    suggestion:
      working.length > 0
        ? `Set AI_CHAT_MODEL=cerebras/${working[0]} (or pick another from working_candidates) — then save via /admin/ai`
        : 'No candidates worked. Check models_listed for what your account supports; the /v1/models response is the source of truth.',
  })
}
