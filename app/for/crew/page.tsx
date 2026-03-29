import type { Metadata } from 'next'
import { LandingPage } from '@/components/layout/landing-page'

export const metadata: Metadata = {
  title: 'Tour Manager OS for Crew',
  description: 'Every load-in detail. Every production spec. One app. Stage dimensions, PA specs, contacts, and schedules — organized per show.',
  openGraph: {
    title: 'Tour Manager OS for Crew',
    description: 'Every load-in detail. Every production spec. One app.',
  },
}

export default function CrewPage() {
  return (
    <LandingPage
      title="Every load-in detail. Every production spec. One app."
      subtitle="For Crew"
      description="Stage dimensions, PA specs, load-in times, contacts, and schedules — organized per show. No more digging through email chains."
      benefits={[
        { title: 'Production Info', description: 'Stage dimensions, PA system, smoke machines, rear door access, backstage parking — all from the advance sheet.' },
        { title: 'Daily Schedule', description: 'Load-in, soundcheck, doors, show — your timeline for the day with exact times and timezone labels.' },
        { title: 'Key Contacts', description: 'Promoter, production manager, sound company, caterer — tap to call directly from the app.' },
        { title: 'Venue Details', description: 'Address with tap-to-navigate, dressing room info, parking, and backstage layout notes.' },
        { title: 'Documents', description: 'Rider, contracts, stage plots, input lists — all accessible per show. No more searching your inbox.' },
        { title: 'Works Offline', description: 'Cached locally for when you\'re in a venue basement with no signal.' },
      ]}
      demoRole="crew"
      demoLabel="Try as Crew"
      modules={['Show Day', 'Production Bible', 'Document Hub', 'Itineraries']}
    />
  )
}
