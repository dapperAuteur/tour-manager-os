import { streamText, type ModelMessage, type StreamTextResult, type ToolSet } from 'ai'
import { traceable } from 'langsmith/traceable'
import { getChatModel } from './config'
import { resolveChatModel } from './providers'

// Re-export so existing imports of `getChatModel` from this module
// keep working.
export { getChatModel } from './config'

interface ChatStreamArgs {
  system: string
  messages: ModelMessage[]
  temperature?: number
  onFinish?: (result: {
    usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number }
    model: string
  }) => void | Promise<void>
}

// Internal — no tracing wrapper here.
async function _streamChat(args: ChatStreamArgs): Promise<StreamTextResult<ToolSet, never>> {
  const modelString = await getChatModel()
  const model = resolveChatModel(modelString)
  return streamText({
    model,
    system: args.system,
    messages: args.messages,
    temperature: args.temperature ?? 0.3,
    onFinish: args.onFinish
      ? async (result) => {
          await args.onFinish!({
            usage: {
              inputTokens: result.usage?.inputTokens,
              outputTokens: result.usage?.outputTokens,
              totalTokens: result.usage?.totalTokens,
            },
            model: modelString,
          })
        }
      : undefined,
  })
}

// Public — LangSmith-traced. The returned object is the AI SDK stream
// result (.toUIMessageStreamResponse(), .textStream, etc).
export const streamChat = traceable(_streamChat, {
  name: 'streamChat',
  run_type: 'llm',
})
