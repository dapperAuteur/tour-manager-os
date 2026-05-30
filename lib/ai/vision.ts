import { generateObject } from 'ai'
import { z } from 'zod'
import { traceable } from 'langsmith/traceable'
import { getVisionModel } from './config'
import { resolveChatModel } from './providers'
import { logError } from '@/lib/observability/logger'

// Expense categories must match the enum used by lib/finances/actions
// and the dropdown in add-expense-form.tsx. Kept here as a literal
// so the model returns only valid values.
const EXPENSE_CATEGORIES = [
  'travel',
  'hotel',
  'per_diem',
  'meals',
  'equipment',
  'crew',
  'merch',
  'marketing',
  'insurance',
  'other',
] as const

const ReceiptSchema = z.object({
  amount: z
    .number()
    .nullable()
    .describe('Total amount paid in USD. If a non-USD currency is shown, do best-effort conversion. Null if not readable.'),
  vendor: z
    .string()
    .nullable()
    .describe('Business / merchant name as shown on the receipt (e.g. "Starbucks").'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .describe('Transaction date in YYYY-MM-DD. Null if not readable.'),
  category: z
    .enum(EXPENSE_CATEGORIES)
    .nullable()
    .describe('Best-fit tour expense category. Use "other" only when nothing else fits; null if no category is inferable.'),
  description: z
    .string()
    .nullable()
    .describe('Short 1-line summary of what was purchased (e.g. "Dinner for 4 at Casa Vega"). Skip the amount and date — they have their own fields.'),
  is_tax_deductible: z
    .boolean()
    .nullable()
    .describe('True if this looks like a business expense for a touring musician (travel/hotel/meals/equipment/crew/marketing). False for personal-looking items. Null if unsure.'),
})

export type ExtractedReceipt = z.infer<typeof ReceiptSchema>

const SYSTEM_PROMPT = [
  'You are a careful expense-receipt parser for a touring-musician',
  'finance app. Given a receipt image, extract the structured fields.',
  '',
  'Rules:',
  '- Return null for any field you cannot read or infer confidently.',
  '- Total amount means the final amount paid (incl. tax + tip), not the',
  '  subtotal.',
  '- Date is the transaction date, not the print/expiry date.',
  '- Category is the tour-finance bucket the expense maps to.',
  '- description should be a short human-readable summary, not a',
  '  copy of the receipt line items.',
  '- Never invent details that are not in the image.',
].join('\n')

async function _extractReceiptOnce(
  imageUrl: string,
): Promise<ExtractedReceipt | null> {
  const modelString = await getVisionModel()
  const model = resolveChatModel(modelString)
  try {
    const result = await generateObject({
      model,
      schema: ReceiptSchema,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract expense data from this receipt image.',
            },
            { type: 'image', image: new URL(imageUrl) },
          ],
        },
      ],
    })
    return result.object
  } catch (err) {
    logError('ai.vision.extract_failed', err, {
      model: modelString,
      image_url: imageUrl,
    })
    return null
  }
}

export const extractReceipt = traceable(_extractReceiptOnce, {
  name: 'extractReceipt',
  run_type: 'llm',
})
