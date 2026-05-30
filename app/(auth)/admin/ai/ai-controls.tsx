'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Database,
  KeyRound,
  Loader2,
  Save,
  Stethoscope,
  Undo2,
  X,
} from 'lucide-react'
import {
  type AiConfigKey,
  type ResolvedConfig,
} from '@/lib/ai/config'
import {
  type ProviderHealth,
  clearAiModelOverrideAction,
  runProviderHealthChecks,
  updateAiModelAction,
} from '@/lib/admin/ai'
import {
  TIER_LABELS,
  TIER_TONE,
  formatCost,
  getModelPricing,
} from '@/lib/ai/pricing'

interface EmbeddingsStats {
  total: number
  embedded: number
  staleModel: number
  unembedded: number
  currentModel: string
}

interface ProviderKeyStatus {
  envVar: string
  present: boolean
}

interface LangSmithStatus {
  project: string | null
  tracingEnabled: boolean
  apiKeyPresent: boolean
}

interface AiControlsProps {
  initial: ResolvedConfig[]
  embeddings: EmbeddingsStats
  providerKeys: ProviderKeyStatus[]
  langsmith: LangSmithStatus
  keyLabels: Record<string, string>
  sourceTone: Record<string, string>
}

const MODEL_PRESETS: Record<AiConfigKey, { value: string; label: string }[]> = {
  chat_model: [
    { value: 'cerebras/gpt-oss-120b', label: 'Cerebras GPT-OSS 120B (fast, with reasoning)' },
    { value: 'cerebras/zai-glm-4.7', label: 'Cerebras ZAI GLM 4.7 (fast, with reasoning)' },
    {
      value: 'openrouter/anthropic/claude-sonnet-4.6',
      label: 'OpenRouter → Claude Sonnet 4.6 (highest quality)',
    },
    {
      value: 'openrouter/anthropic/claude-sonnet-4.5',
      label: 'OpenRouter → Claude Sonnet 4.5',
    },
    {
      value: 'openrouter/anthropic/claude-3.5-haiku',
      label: 'OpenRouter → Claude 3.5 Haiku (fast Anthropic)',
    },
    { value: 'openrouter/openai/gpt-4o-mini', label: 'OpenRouter → GPT-4o mini' },
    { value: 'mistral/mistral-large-latest', label: 'Mistral Large (balanced)' },
    { value: 'mistral/mistral-small-latest', label: 'Mistral Small (cheap, reliable)' },
    {
      value: 'together/meta-llama/Llama-3.3-70B-Instruct-Turbo',
      label: 'Together → Llama 3.3 70B Turbo',
    },
  ],
  embedding_model: [
    {
      value: 'mistral/mistral-embed',
      label: 'Mistral mistral-embed (1024 dims — matches schema)',
    },
  ],
  vision_model: [
    {
      value: 'openrouter/anthropic/claude-sonnet-4.6',
      label: 'OpenRouter → Claude Sonnet 4.6 (vision)',
    },
    {
      value: 'openrouter/anthropic/claude-sonnet-4.5',
      label: 'OpenRouter → Claude Sonnet 4.5 (vision)',
    },
    {
      value: 'together/nim/meta/llama-3.2-90b-vision-instruct',
      label: 'Together → Llama 3.2 90B Vision (NIM)',
    },
    {
      value: 'together/nim/meta/llama-3.2-11b-vision-instruct',
      label: 'Together → Llama 3.2 11B Vision (NIM, cheaper)',
    },
  ],
}

export function AiControls({
  initial,
  embeddings,
  providerKeys,
  langsmith,
  keyLabels,
  sourceTone,
}: AiControlsProps) {
  const router = useRouter()
  const [resolved, setResolved] = useState<ResolvedConfig[]>(initial)
  const [drafts, setDrafts] = useState<Record<AiConfigKey, string>>(() => {
    const m: Partial<Record<AiConfigKey, string>> = {}
    for (const r of initial) m[r.key] = r.resolved
    return m as Record<AiConfigKey, string>
  })
  const [saving, setSaving] = useState<AiConfigKey | null>(null)
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [backfilling, setBackfilling] = useState(false)
  const [backfillResult, setBackfillResult] = useState<string | null>(null)

  const [running, setRunning] = useState(false)
  const [health, setHealth] = useState<ProviderHealth[] | null>(null)

  async function save(key: AiConfigKey) {
    const value = drafts[key]
    setSaving(key)
    setErrors((e) => ({ ...e, [key]: '' }))
    try {
      const result = await updateAiModelAction(key, value)
      if (!result.ok) {
        setErrors((e) => ({ ...e, [key]: result.error }))
      } else {
        setResolved(result.resolved)
        startTransition(() => router.refresh())
      }
    } finally {
      setSaving(null)
    }
  }

  async function clearOverride(key: AiConfigKey) {
    setSaving(key)
    setErrors((e) => ({ ...e, [key]: '' }))
    try {
      const result = await clearAiModelOverrideAction(key)
      if (!result.ok) {
        setErrors((e) => ({ ...e, [key]: result.error }))
      } else {
        setResolved(result.resolved)
        const newDrafts = { ...drafts }
        const updated = result.resolved.find((r) => r.key === key)
        if (updated) newDrafts[key] = updated.resolved
        setDrafts(newDrafts)
        startTransition(() => router.refresh())
      }
    } finally {
      setSaving(null)
    }
  }

  async function runHealth() {
    setRunning(true)
    setHealth(null)
    try {
      const result = await runProviderHealthChecks()
      setHealth(result)
    } finally {
      setRunning(false)
    }
  }

  async function runBackfill() {
    setBackfilling(true)
    setBackfillResult(null)
    try {
      const res = await fetch('/api/admin/help/backfill-embeddings', {
        method: 'POST',
      })
      const json = (await res.json().catch(() => ({}))) as {
        scanned?: number
        embedded?: number
        failed?: number
        skipped?: number
        error?: string
      }
      if (!res.ok) {
        setBackfillResult(`Error: ${json.error || res.status}`)
      } else {
        setBackfillResult(
          `Scanned ${json.scanned}, embedded ${json.embedded}, failed ${json.failed}, skipped ${json.skipped}`,
        )
        startTransition(() => router.refresh())
      }
    } catch (err) {
      setBackfillResult(
        err instanceof Error ? `Error: ${err.message}` : 'Network error',
      )
    } finally {
      setBackfilling(false)
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <section
        aria-label="Model configuration"
        className="rounded-2xl border border-border-default bg-surface-raised"
      >
        <header className="border-b border-border-default px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Model configuration
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            DB override wins over env var, env over default. Clearing the DB
            override falls back to env.
          </p>
        </header>
        <ul className="divide-y divide-border-default">
          {resolved.map((row) => {
            const presets = MODEL_PRESETS[row.key] || []
            const draftDiffers = drafts[row.key] !== row.resolved
            const isPreset = presets.some((p) => p.value === drafts[row.key])
            const draftPricing = getModelPricing(drafts[row.key])
            const resolvedPricing = getModelPricing(row.resolved)
            return (
              <li key={row.key} className="px-4 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div>
                    <h3 className="font-medium">
                      {keyLabels[row.key] || row.key}
                    </h3>
                    <p className="font-mono text-xs text-text-muted">
                      {row.key}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${sourceTone[row.source] || ''}`}
                  >
                    {row.source}
                  </span>
                </div>

                <div className="mt-2 rounded-md border border-border-default bg-surface-base p-2 text-xs">
                  <span className="text-text-muted">Currently using:</span>{' '}
                  <code className="font-mono">{row.resolved}</code>
                  <PricingBadge pricing={resolvedPricing} className="ml-2" />
                </div>

                <label className="mt-3 block">
                  <span className="block text-xs text-text-muted">
                    Choose model
                  </span>
                  <select
                    value={isPreset ? drafts[row.key] : ''}
                    onChange={(e) => {
                      const v = e.target.value
                      if (!v) return
                      setDrafts({ ...drafts, [row.key]: v })
                    }}
                    className="mt-1 w-full rounded-md border border-border-default bg-surface-base px-2 py-1.5 text-xs"
                  >
                    {!isPreset && (
                      <option value="">
                        — custom env value (not in preset list) —
                      </option>
                    )}
                    {presets.map((p) => {
                      const pricing = getModelPricing(p.value)
                      const cost = pricing.inputPerM
                        ? ` · ${formatCost(pricing.inputPerM)}${pricing.outputPerM ? ` in / ${formatCost(pricing.outputPerM)} out` : ''}`
                        : ''
                      return (
                        <option key={p.value} value={p.value}>
                          [{TIER_LABELS[pricing.tier]}] {p.label}
                          {cost}
                        </option>
                      )
                    })}
                  </select>
                </label>

                {isPreset && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <PricingBadge pricing={draftPricing} />
                    <span className="text-text-muted">{draftPricing.note}</span>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                  <span>
                    env (<code className="font-mono">{envFor(row.key)}</code>):{' '}
                    {row.envValue ? (
                      <code className="font-mono">{row.envValue}</code>
                    ) : (
                      <em>unset</em>
                    )}
                  </span>
                  <span>•</span>
                  <span>
                    default: <code className="font-mono">{row.defaultValue}</code>
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => save(row.key)}
                    disabled={!draftDiffers || saving === row.key || pending}
                    className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving === row.key ? (
                      <Loader2 className="size-3 animate-spin" aria-hidden />
                    ) : (
                      <Save className="size-3" aria-hidden />
                    )}{' '}
                    Save override
                  </button>
                  {row.source === 'db' && (
                    <button
                      type="button"
                      onClick={() => clearOverride(row.key)}
                      disabled={saving === row.key || pending}
                      className="inline-flex items-center gap-1 rounded-md border border-border-default px-3 py-1.5 text-xs font-semibold hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Undo2 className="size-3" aria-hidden /> Clear override
                    </button>
                  )}
                </div>
                {errors[row.key] && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    {errors[row.key]}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
        <p className="border-t border-border-default px-4 py-3 text-xs text-text-muted">
          Need a model not in this list? Add a new entry to{' '}
          <code className="font-mono">lib/ai/pricing.ts</code> and{' '}
          <code className="font-mono">MODEL_PRESETS</code> in this file, then deploy.
          We removed the free-text field so typos can&apos;t brick the agent.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section
          aria-label="Provider keys"
          className="rounded-2xl border border-border-default bg-surface-raised"
        >
          <header className="border-b border-border-default px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
              <KeyRound className="size-4" aria-hidden /> Provider keys
            </h2>
          </header>
          <ul className="divide-y divide-border-default">
            {providerKeys.map((p) => (
              <li
                key={p.envVar}
                className="flex items-center justify-between px-4 py-2 text-sm"
              >
                <code className="font-mono text-xs">{p.envVar}</code>
                {p.present ? (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-3" aria-hidden /> set
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                    <X className="size-3" aria-hidden /> unset
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="border-t border-border-default px-4 py-3 text-xs text-text-muted">
            LangSmith: project{' '}
            <code className="font-mono">{langsmith.project || 'unset'}</code> ·
            tracing{' '}
            {langsmith.tracingEnabled ? (
              <span className="text-green-600 dark:text-green-400">on</span>
            ) : (
              <span>off</span>
            )}{' '}
            · key{' '}
            {langsmith.apiKeyPresent ? (
              <span className="text-green-600 dark:text-green-400">present</span>
            ) : (
              <span className="text-orange-600 dark:text-orange-400">
                missing
              </span>
            )}
          </div>
        </section>

        <section
          aria-label="Embeddings"
          className="rounded-2xl border border-border-default bg-surface-raised"
        >
          <header className="border-b border-border-default px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
              <Database className="size-4" aria-hidden /> Embeddings
            </h2>
          </header>
          <div className="space-y-3 p-4 text-sm">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Stat label="Total" value={embeddings.total} />
              <Stat label="Embedded" value={embeddings.embedded} />
              <Stat label="Unembedded" value={embeddings.unembedded} />
              <Stat label="Stale model" value={embeddings.staleModel} />
            </div>
            <p className="text-xs text-text-muted">
              Current model:{' '}
              <code className="font-mono">{embeddings.currentModel}</code>
            </p>
            <button
              type="button"
              onClick={runBackfill}
              disabled={backfilling}
              className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {backfilling ? (
                <Loader2 className="size-3 animate-spin" aria-hidden />
              ) : (
                <Database className="size-3" aria-hidden />
              )}{' '}
              Backfill missing / stale
            </button>
            {backfillResult && (
              <p className="text-xs text-text-muted">{backfillResult}</p>
            )}
          </div>
        </section>
      </div>

      <section
        aria-label="Provider health"
        className="rounded-2xl border border-border-default bg-surface-raised"
      >
        <header className="flex items-center justify-between border-b border-border-default px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            <Stethoscope className="size-4" aria-hidden /> Provider health
          </h2>
          <button
            type="button"
            onClick={runHealth}
            disabled={running}
            className="inline-flex items-center gap-1 rounded-md border border-border-default px-3 py-1.5 text-xs font-semibold hover:bg-surface-alt disabled:opacity-50"
          >
            {running ? (
              <Loader2 className="size-3 animate-spin" aria-hidden />
            ) : null}
            Run checks
          </button>
        </header>
        {health ? (
          <ul className="divide-y divide-border-default">
            {health.map((h) => (
              <li
                key={h.provider}
                className="flex items-center justify-between px-4 py-2 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{h.provider}</div>
                  <code className="font-mono text-xs text-text-muted">
                    {h.model}
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  {h.latencyMs != null && (
                    <span className="text-xs text-text-muted">
                      {h.latencyMs} ms
                    </span>
                  )}
                  {h.ok ? (
                    <CheckCircle2
                      className="size-4 text-green-600 dark:text-green-400"
                      aria-hidden
                    />
                  ) : (
                    <X
                      className="size-4 text-red-600 dark:text-red-400"
                      aria-hidden
                    />
                  )}
                </div>
                {h.error && (
                  <p
                    className="basis-full pt-1 text-xs text-red-600 dark:text-red-400"
                  >
                    {h.error}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-text-muted">
            Click <strong>Run checks</strong> to ping each provider with a
            small probe. Costs a few tokens.
          </div>
        )}
      </section>
    </div>
  )
}

function envFor(key: AiConfigKey): string {
  switch (key) {
    case 'chat_model':
      return 'AI_CHAT_MODEL'
    case 'embedding_model':
      return 'AI_EMBEDDING_MODEL'
    case 'vision_model':
      return 'AI_VISION_MODEL'
  }
}

function PricingBadge({
  pricing,
  className = '',
}: {
  pricing: ReturnType<typeof getModelPricing>
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TIER_TONE[pricing.tier]} ${className}`}
      title={pricing.note}
    >
      {TIER_LABELS[pricing.tier]}
      {pricing.inputPerM !== null && (
        <span className="ml-1 font-normal normal-case opacity-75">
          {formatCost(pricing.inputPerM)}
          {pricing.outputPerM !== null && ` / ${formatCost(pricing.outputPerM)}`}
        </span>
      )}
    </span>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border-default bg-surface-base p-2">
      <div className="text-[10px] uppercase tracking-wide text-text-muted">
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold tabular-nums">{value}</div>
    </div>
  )
}
