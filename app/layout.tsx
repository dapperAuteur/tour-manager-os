import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/lib/theme/theme-provider'
import { ThemeScript } from '@/lib/theme/theme-script'
import { SkipToMain } from '@/components/ui/skip-to-main'
import { HelpBubble } from '@/components/ui/help-bubble'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Tour Manager OS — Tour Management Built for Musicians',
    template: '%s | Tour Manager OS',
  },
  description:
    'Replace spreadsheets and fragmented tools with one platform. Digital advance sheets, auto-generated itineraries, tour finances, merch, and more — built for touring musicians.',
  metadataBase: new URL('https://tour.witus.online'),
  openGraph: {
    type: 'website',
    siteName: 'Tour Manager OS',
    title: 'Tour Manager OS — Tour Management Built for Musicians',
    description:
      'Replace spreadsheets and fragmented tools with one platform. Digital advance sheets, auto-generated itineraries, tour finances, merch, and more.',
    url: 'https://tour.witus.online',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tour Manager OS — Tour Management Built for Musicians',
    description:
      'Replace spreadsheets and fragmented tools with one platform. Digital advance sheets, auto-generated itineraries, tour finances, merch, and more.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
          <HelpBubble />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
