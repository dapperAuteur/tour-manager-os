import type {
  EmbeddingModelV3,
  LanguageModelV3,
} from '@ai-sdk/provider'
import { mistral } from '@ai-sdk/mistral'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

// Bypass the Vercel AI Gateway by resolving "provider/model" strings
// to direct provider SDKs that use the customer's own API keys. The
// Gateway is a free routing layer that requires a credit card on
// file even for the included free credits (commit history /
// plans/bugs/backfill-help-articles-failed.md), so we prefer direct
// routing whenever a provider key is set.
//
// Strings unknown to this resolver fall through as-is and will go to
// the Gateway (and fail without a card). Add a case here when you
// onboard a new provider.

const cerebras = process.env.CEREBRAS_API_KEY
  ? createOpenAICompatible({
      name: 'cerebras',
      baseURL: 'https://api.cerebras.ai/v1',
      apiKey: process.env.CEREBRAS_API_KEY,
    })
  : null

const openrouter = process.env.OPENROUTER_API_KEY
  ? createOpenAICompatible({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    })
  : null

const together = process.env.TOGETHER_API_KEY
  ? createOpenAICompatible({
      name: 'together',
      baseURL: 'https://api.together.xyz/v1',
      apiKey: process.env.TOGETHER_API_KEY,
    })
  : null

function splitModelString(s: string): { provider: string; model: string } {
  const slash = s.indexOf('/')
  if (slash < 0) return { provider: '', model: s }
  return { provider: s.slice(0, slash), model: s.slice(slash + 1) }
}

export function resolveChatModel(
  modelString: string,
): LanguageModelV3 | string {
  const { provider, model } = splitModelString(modelString)
  switch (provider) {
    case 'mistral':
      if (process.env.MISTRAL_API_KEY) return mistral(model)
      return modelString
    case 'cerebras':
      if (cerebras) return cerebras.chatModel(model)
      return modelString
    case 'openrouter':
      if (openrouter) return openrouter.chatModel(model)
      return modelString
    case 'together':
      if (together) return together.chatModel(model)
      return modelString
    default:
      return modelString
  }
}

export function resolveEmbeddingModel(
  modelString: string,
): EmbeddingModelV3 | string {
  const { provider, model } = splitModelString(modelString)
  switch (provider) {
    case 'mistral':
      if (process.env.MISTRAL_API_KEY) return mistral.textEmbeddingModel(model)
      return modelString
    case 'together':
      if (together) return together.textEmbeddingModel(model)
      return modelString
    default:
      return modelString
  }
}
