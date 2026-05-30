import { streamText, type ModelMessage } from 'ai'
import { traceable } from 'langsmith/traceable'

const DEFAULT_CHAT_MODEL = 'cerebras/llama-3.3-70b'

export function getChatModel(): string {
  return process.env.AI_CHAT_MODEL || DEFAULT_CHAT_MODEL
}

interface ChatStreamArgs {
  system: string
  messages: ModelMessage[]
  temperature?: number
}

// Internal — no tracing wrapper here.
function _streamChat(args: ChatStreamArgs) {
  return streamText({
    model: getChatModel(),
    system: args.system,
    messages: args.messages,
    temperature: args.temperature ?? 0.3,
  })
}

// Public — LangSmith-traced. The returned object is the AI SDK stream
// result (.toUIMessageStreamResponse(), .textStream, etc).
export const streamChat = traceable(_streamChat, {
  name: 'streamChat',
  run_type: 'llm',
})
