// Per-model pricing metadata for the admin AI page.
//
// Keep this small and hand-maintained — every preset on /admin/ai
// should have a matching entry here. Pricing is best-effort and
// approximate; check the provider's pricing page before relying on
// these for budgeting.
//
// Tiers:
//   - free        Self-hosted (Ollama) or 100% free credits, no card
//   - free-tier   Daily/monthly free allowance, then pay-per-token
//   - paid        Pay-per-token from the first request
//   - gateway     Vercel AI Gateway free credits (credit card required)

export type PricingTier = 'free' | 'free-tier' | 'paid' | 'gateway'

export interface ModelPricing {
  tier: PricingTier
  // Cost in USD per 1M tokens. Use null when N/A (e.g. embedding-only
  // model uses inputPerM; chat uses both).
  inputPerM: number | null
  outputPerM: number | null
  // Short tier note for the UI tooltip / row.
  note: string
}

const PRICING: Record<string, ModelPricing> = {
  // ---- Cerebras (Inference Cloud) ----
  // Catalog from this account's /v1/models response — 2026-05-30.
  // If a model 404s, hit GET /api/admin/ai/cerebras-probe to see what
  // the account actually has access to and edit this list.
  'cerebras/gpt-oss-120b': {
    tier: 'free-tier',
    inputPerM: 0.25,
    outputPerM: 0.69,
    note: 'Reasoning model. Free daily allowance, then pay-per-token',
  },
  'cerebras/zai-glm-4.7': {
    tier: 'free-tier',
    inputPerM: 0.6,
    outputPerM: 2.2,
    note: 'Reasoning model. Free daily allowance, then pay-per-token',
  },

  // ---- Mistral (direct) ----
  'mistral/mistral-embed': {
    tier: 'paid',
    inputPerM: 0.1,
    outputPerM: null,
    note: 'Pay-per-token, no free tier',
  },
  'mistral/mistral-large-latest': {
    tier: 'paid',
    inputPerM: 2.0,
    outputPerM: 6.0,
    note: 'Pay-per-token',
  },
  'mistral/mistral-small-latest': {
    tier: 'paid',
    inputPerM: 0.2,
    outputPerM: 0.6,
    note: 'Pay-per-token, much cheaper than Large',
  },

  // ---- OpenRouter (multiprovider) ----
  'openrouter/anthropic/claude-3.5-sonnet': {
    tier: 'paid',
    inputPerM: 3.0,
    outputPerM: 15.0,
    note: 'Pay-per-token via OpenRouter (Anthropic upstream)',
  },
  'openrouter/openai/gpt-4o-mini': {
    tier: 'paid',
    inputPerM: 0.15,
    outputPerM: 0.6,
    note: 'Pay-per-token via OpenRouter (OpenAI upstream)',
  },
  'openrouter/mistralai/mistral-7b-instruct': {
    tier: 'paid',
    inputPerM: 0.07,
    outputPerM: 0.07,
    note: 'Very cheap pay-per-token, lower quality',
  },

  // ---- Together AI ----
  'together/meta-llama/Llama-3.3-70B-Instruct-Turbo': {
    tier: 'paid',
    inputPerM: 0.88,
    outputPerM: 0.88,
    note: 'Pay-per-token Llama 3.3 70B Turbo',
  },
  'together/meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo': {
    tier: 'paid',
    inputPerM: 1.2,
    outputPerM: 1.2,
    note: 'Pay-per-token vision-capable Llama 3.2 90B',
  },
}

export function getModelPricing(modelString: string): ModelPricing {
  return (
    PRICING[modelString] ?? {
      tier: 'gateway',
      inputPerM: null,
      outputPerM: null,
      note: 'Unknown — routed via Vercel AI Gateway (requires credit card on file)',
    }
  )
}

export function formatCost(perMillion: number | null): string {
  if (perMillion === null) return '—'
  if (perMillion < 0.1) return `$${perMillion.toFixed(3)}/M`
  return `$${perMillion.toFixed(2)}/M`
}

export const TIER_LABELS: Record<PricingTier, string> = {
  'free': 'Free',
  'free-tier': 'Free tier',
  'paid': 'Pay',
  'gateway': 'Gateway',
}

export const TIER_TONE: Record<PricingTier, string> = {
  'free': 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
  'free-tier':
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  'paid':
    'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
  'gateway':
    'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
}
