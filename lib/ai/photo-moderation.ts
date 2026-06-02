import { generateObject } from 'ai'
import { z } from 'zod'
import { traceable } from 'langsmith/traceable'
import { getVisionModel } from './config'
import { resolveChatModel } from './providers'
import { logError } from '@/lib/observability/logger'

const PhotoVerdictSchema = z.object({
  nsfw_likely: z
    .boolean()
    .describe('True when the image shows explicit nudity, sexual content, or graphic genital exposure.'),
  violence_likely: z
    .boolean()
    .describe('True when the image shows graphic injury, blood, weapons being used aggressively, or imminent violence.'),
  off_topic_likely: z
    .boolean()
    .describe('True when the image clearly is not from a live music event (no stage, audience, venue, instruments, performers, or backstage context).'),
  confidence: z
    .enum(['low', 'medium', 'high'])
    .describe('How sure the model is overall.'),
  reason: z
    .string()
    .max(240)
    .describe('Short, neutral description of what is in the image — used to explain a rejection to the poster.'),
})

export type PhotoVerdict = z.infer<typeof PhotoVerdictSchema>

const SYSTEM_PROMPT = [
  'You are a content-safety reviewer for a touring-musician fan-photo',
  'wall. Each image is supposed to be a snapshot a paying fan took of a',
  'live music event: the band on stage, the crowd, the marquee, a',
  'merch table, a candid backstage shot.',
  '',
  'Return a structured verdict only. Be conservative about NSFW and',
  'violence — anything explicit should be flagged. Be liberal about',
  'off_topic — a fan selfie in a parking lot or a band-shirt photo is',
  'still on-topic. Empty rooms, blurry abstract shots, and bathroom',
  'mirror selfies are off-topic.',
  '',
  'Reason should be a single short sentence describing the image',
  'neutrally, not a moral judgment. It is shown back to the poster if',
  'the photo is auto-rejected.',
].join('\n')

async function _moderatePhotoOnce(
  imageUrl: string,
): Promise<PhotoVerdict | null> {
  const modelString = await getVisionModel()
  const model = resolveChatModel(modelString)
  try {
    const result = await generateObject({
      model,
      schema: PhotoVerdictSchema,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Review this fan-submitted photo from a live music event.',
            },
            { type: 'image', image: new URL(imageUrl) },
          ],
        },
      ],
    })
    return result.object
  } catch (err) {
    logError('ai.photo_moderation.failed', err, {
      model: modelString,
      image_url: imageUrl,
    })
    return null
  }
}

export const moderatePhoto = traceable(_moderatePhotoOnce, {
  name: 'moderatePhoto',
  run_type: 'llm',
})

/**
 * Returns true when the verdict warrants auto-rejection. Two-strike
 * rule: high-confidence NSFW or violence flips the row to rejected
 * straight away. Medium-confidence + a positive flag puts it in the
 * human queue with a verdict attached. Off-topic alone never auto-
 * rejects — that judgement belongs to the band, not the model.
 */
export function shouldAutoReject(verdict: PhotoVerdict): boolean {
  if (verdict.confidence !== 'high') return false
  return verdict.nsfw_likely || verdict.violence_likely
}

export function shortRejectionReason(verdict: PhotoVerdict): string {
  const parts: string[] = []
  if (verdict.nsfw_likely) parts.push('NSFW content')
  if (verdict.violence_likely) parts.push('graphic violence')
  if (verdict.off_topic_likely) parts.push('off-topic')
  return parts.length > 0
    ? `Auto-rejected: ${parts.join(', ')}.`
    : 'Auto-rejected by content review.'
}
