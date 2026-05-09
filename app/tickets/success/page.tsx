import Link from 'next/link'
import { CheckCircle2, Mail } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { SiteFooter } from '@/components/layout/site-footer'

export const metadata = { title: 'Tickets — Confirmation' }

export default function TicketsSuccessPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 inline-flex rounded-full bg-green-100 p-3 dark:bg-green-950/40">
          <CheckCircle2 className="size-10 text-green-600 dark:text-green-400" aria-hidden />
        </div>
        <h1 className="text-3xl font-bold">You&apos;re in.</h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          Payment confirmed. Your ticket
          {' '}
          <span className="whitespace-nowrap">QR code{'(s) are'}</span> on the way.
        </p>
        <div className="mx-auto mt-8 flex max-w-md items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left dark:border-gray-800 dark:bg-gray-900">
          <Mail className="mt-0.5 size-5 text-gray-400" aria-hidden />
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Check your email for a message from{' '}
            <strong className="text-gray-900 dark:text-gray-100">Tour Manager OS</strong>.
            Each ticket has its own link — show the QR code at the door. If
            it doesn&apos;t arrive in 5 minutes, check spam.
          </div>
        </div>
        <Link
          href="/"
          className="mt-8 inline-block rounded-md bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Done
        </Link>
      </main>
      <SiteFooter />
    </div>
  )
}
