import type { Metadata } from 'next'
import { LandingPage } from '@/components/layout/landing-page'

export const metadata: Metadata = {
  title: 'Tour Manager OS for Tour Managers',
  description: 'Stop chasing spreadsheets. Digital advance sheets, auto-generated itineraries, financial oversight, and team management — all in one platform.',
  openGraph: {
    title: 'Tour Manager OS for Tour Managers',
    description: 'Stop chasing spreadsheets. Digital advance sheets, auto-generated itineraries, financial oversight, and team management.',
  },
}

export default function TourManagersPage() {
  return (
    <LandingPage
      title="Stop chasing spreadsheets. Start running tours."
      subtitle="For Tour Managers"
      description="Digital advance sheets, auto-generated itineraries, financial oversight, team management, and module control — all from one dashboard."
      benefits={[
        { title: 'Digital Advance Sheets', description: 'Send a link to venues. They fill out a web form. No more emailing Excel files and chasing responses.' },
        { title: 'Auto-Generated Itineraries', description: 'Daily schedules build themselves from advance sheet data. Print or share with the team instantly.' },
        { title: 'Financial Oversight', description: 'Real-time P&L per show and per tour. See exactly where money goes. Export for your accountant.' },
        { title: 'Team Management', description: 'Invite members, control module access, approve requests. Everyone sees what they need — nothing more.' },
        { title: 'Show Details at a Glance', description: 'Venue info, contacts, production specs, catering, dressing rooms — all organized on one page per show.' },
        { title: 'Works Offline', description: 'Touring through areas with bad signal? The app works offline and syncs when you reconnect.' },
      ]}
      demoRole="manager"
      demoLabel="Try as Tour Manager"
      modules={['Advance Sheets', 'Itineraries', 'Tour Finances', 'Show Day', 'Document Hub', 'Merch Management']}
    />
  )
}
