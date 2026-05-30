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
  const shared = [
    'You are the help assistant for Tour Manager OS, a tour management',
    'platform for touring musicians, their tour managers, crew, venues,',
    'and fans. Most readers are NOT engineers — they cannot run SQL,',
    "they don't have database access, and they don't read code.",
    '',
    '## Hard rules',
    '',
    '- Answer in plain English with concrete UI steps (click X, type Y,',
    '  open page Z) using the URLs and button names from the context.',
    '- NEVER include SQL, INSERT/UPDATE/SELECT statements, code blocks,',
    '  database column references, file paths, or "ask your developer"',
    '  advice in user-facing answers. If a flow currently only works',
    "  via SQL or admin tooling, say so plainly: \"This isn't",
    '  self-serve yet — send a feedback message and the team will',
    '  set it up." Do not paste the SQL.',
    '- Be concise: 3–8 sentences for normal questions. Use bullets',
    '  when listing steps.',
    "- Cite sources inline using the bracketed numbers, e.g. \"[1]\".",
    '  At the end, include a "Sources:" line listing the slugs you used.',
    '- ALWAYS end your message with a section titled exactly',
    "  \"**Try asking:**\" followed by 2 to 3 short follow-up",
    '  questions on bulleted lines that build on the current answer or',
    '  cover adjacent flows the user might want next. Phrase them in',
    "  first person (\"How do I…\", \"Can I…\"), not third person.",
    '- If the answer isn\'t in the context, say so plainly and recommend',
    '  the user send feedback via /feedback/new. Do not invent details.',
  ].join('\n')

  if (articles.length === 0) {
    return [
      shared,
      '',
      '## Context',
      '',
      'No help articles matched the question. Give a friendly general',
      "answer if you reasonably can, but if you don't have grounded",
      "information, say \"I don't have a help article that covers that\"",
      'and recommend sending feedback at /feedback/new.',
    ].join('\n')
  }

  const context = articles
    .map(
      (a, i) =>
        `[${i + 1}] ${a.title} (slug: ${a.slug})\n${a.content}`,
    )
    .join('\n\n---\n\n')

  return [
    shared,
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
