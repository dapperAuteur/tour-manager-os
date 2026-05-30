import { convertToModelMessages, type UIMessage } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { streamChat } from '@/lib/ai/chat'
import { retrieveHelpArticles, type RetrievedArticle } from '@/lib/help/retrieve'
import { logError } from '@/lib/observability/logger'

interface AskBody {
  messages: UIMessage[]
}

function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== 'user') continue
    for (const part of m.parts ?? []) {
      if (part.type === 'text') return part.text
    }
  }
  return ''
}

function buildSystemPrompt(
  articles: { title: string; content: string; slug: string }[],
): string {
  if (articles.length === 0) {
    return [
      'You are the help assistant for Tour Manager OS, a tour management',
      'platform for touring musicians. Be friendly and concise.',
      '',
      'No help articles matched the user\'s question — answer in a',
      'general way using common sense, but recommend they search the',
      'help center for the exact term or send feedback if they need a',
      'specific feature.',
    ].join('\n')
  }

  const context = articles
    .map(
      (a, i) =>
        `[${i + 1}] ${a.title} (slug: ${a.slug})\n${a.content}`,
    )
    .join('\n\n---\n\n')

  return [
    'You are the help assistant for Tour Manager OS, a tour management',
    'platform for touring musicians. Answer the user\'s question using',
    'ONLY the context below. Be concise and actionable.',
    '',
    'Cite sources inline using the bracketed numbers, e.g. "[1]".',
    'At the end, include a "Sources:" line listing the slugs you used.',
    'If the context doesn\'t contain the answer, say so plainly and',
    'suggest they send feedback rather than inventing details.',
    '',
    '## Context',
    '',
    context,
  ].join('\n')
}

export async function POST(request: Request) {
  // Authn: must be signed in to use the agent (it touches the help
  // module + costs us tokens).
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: AskBody
  try {
    body = (await request.json()) as AskBody
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: 'messages required' }, { status: 400 })
  }

  const question = lastUserText(body.messages)
  if (!question.trim()) {
    return Response.json({ error: 'empty question' }, { status: 400 })
  }

  const startedAt = Date.now()
  const articles = await retrieveHelpArticles(question, 5, 0.45)

  try {
    const modelMessages = await convertToModelMessages(body.messages)
    const result = await streamChat({
      system: buildSystemPrompt(articles),
      messages: modelMessages,
      temperature: 0.3,
      onFinish: async ({ usage, model }) => {
        await logChat({
          userId: user.id,
          question,
          articles,
          model,
          promptTokens: usage?.inputTokens ?? null,
          completionTokens: usage?.outputTokens ?? null,
          responseTimeMs: Date.now() - startedAt,
          error: null,
        })
      },
    })
    return result.toUIMessageStreamResponse()
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'unknown'
    logError('help.ask.stream_failed', err, {
      question_length: question.length,
      articles_count: articles.length,
    })
    await logChat({
      userId: user.id,
      question,
      articles,
      model: '',
      promptTokens: null,
      completionTokens: null,
      responseTimeMs: Date.now() - startedAt,
      error: errMsg,
    }).catch(() => {})
    return Response.json({ error: 'agent unavailable' }, { status: 502 })
  }
}

interface LogChatArgs {
  userId: string
  question: string
  articles: RetrievedArticle[]
  model: string
  promptTokens: number | null
  completionTokens: number | null
  responseTimeMs: number
  error: string | null
}

async function logChat(args: LogChatArgs): Promise<void> {
  const admin = createAdminClient()
  await admin.from('ai_chat_logs').insert({
    user_id: args.userId,
    question: args.question.slice(0, 4000),
    retrieved_article_ids: args.articles.map((a) => a.id),
    top_similarity: args.articles[0]?.similarity ?? null,
    model: args.model,
    prompt_tokens: args.promptTokens,
    completion_tokens: args.completionTokens,
    response_time_ms: args.responseTimeMs,
    error: args.error,
  })
}
