import type { Metadata } from 'next'
import { LandingPage } from '@/components/layout/landing-page'

export const metadata: Metadata = {
  title: 'Tour Manager OS for Musicians',
  description: 'Know your day. Know your money. Focus on the music. Open your phone, see your schedule, track your finances, connect with fans.',
  openGraph: {
    title: 'Tour Manager OS for Musicians',
    description: 'Know your day. Know your money. Focus on the music.',
  },
}

export default function MusiciansPage() {
  return (
    <LandingPage
      title="Know your day. Know your money. Focus on the music."
      subtitle="For Musicians"
      description="Open your phone and see your whole day — soundcheck at 3, doors at 7, you're on at 9:15. Track your personal finances. Connect with fans."
      benefits={[
        { title: 'Show Day Companion', description: 'Your daily schedule, venue info, hotel details, and contacts — all on one screen. Tap to navigate or call.' },
        { title: 'Personal Finances', description: 'See your share, per diem balance, and expenses across all tours. Know exactly what you\'re earning.' },
        { title: 'Tax-Ready Tracking', description: 'Every expense flagged as tax-deductible. Export CSV for your accountant at tax time. No more shoebox receipts.' },
        { title: 'Stay Connected', description: 'Tour announcements, schedule changes, and team communication — all in one place.' },
        { title: 'Timezone Aware', description: 'Times display in your timezone with clear labels. Never miss soundcheck because of a timezone mix-up.' },
        { title: 'Works Offline', description: 'View your schedule, venue info, and hotel details even without internet. Perfect for rural venues.' },
      ]}
      demoRole="member"
      demoLabel="Try as Band Member"
      modules={['Show Day', 'Tour Finances', 'Merch Management', 'Community', 'Academy']}
    />
  )
}
