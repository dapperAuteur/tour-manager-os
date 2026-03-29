import { Resend } from 'resend'

let resendClient: Resend | null = null

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key') {
    return null
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }

  return resendClient
}

export const DEFAULT_FROM = 'Tour Manager OS <noreply@tour.witus.online>'
