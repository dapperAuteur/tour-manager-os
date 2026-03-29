import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { ThemeScript } from '@/lib/theme/theme-script'
import { SkipToMain } from '@/components/ui/skip-to-main'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Tour Manager OS',
    template: '%s | Tour Manager OS',
  },
  description:
    'Comprehensive tour management platform for touring musicians. Digital advance sheets, itineraries, finances, merch, and more.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-surface text-text-primary antialiased">
        <ThemeProvider>
          <SkipToMain />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
