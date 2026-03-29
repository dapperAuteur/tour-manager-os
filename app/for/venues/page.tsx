import type { Metadata } from 'next'
import { LandingPage } from '@/components/layout/landing-page'

export const metadata: Metadata = {
  title: 'Tour Manager OS for Venues',
  description: 'Fill out one form. Never fax an advance sheet again. A simple web form replaces the Excel questionnaire — no login required.',
  openGraph: {
    title: 'Tour Manager OS for Venues',
    description: 'Fill out one form. Never fax an advance sheet again.',
  },
}

export default function VenuesPage() {
  return (
    <LandingPage
      title="Fill out one form. Never fax an advance sheet again."
      subtitle="For Venues"
      description="You'll receive a link from the tour manager. Fill out the web form with your venue details — no account needed. That's it."
      benefits={[
        { title: 'No Login Required', description: 'You get a unique link. Click it, fill out the form, submit. No account, no password, no app to download.' },
        { title: 'Structured Form', description: 'Clear sections for venue details, dressing rooms, catering, production, show times, and contacts. No guessing what\'s needed.' },
        { title: 'Save Your Data', description: 'Your venue info is saved for future shows. When the same artist returns, your data pre-populates.' },
        { title: 'Mobile Friendly', description: 'Fill it out from your phone between load-ins. Works on any device, any browser.' },
        { title: 'Instant Confirmation', description: 'Submit the form and the tour manager is notified immediately. No email back-and-forth.' },
        { title: 'Contact Organization', description: 'All your key contacts (promoter, production, catering, sound) captured in one form for the touring team.' },
      ]}
      demoRole="manager"
      demoLabel="See the Venue Form"
      modules={['Advance Sheets']}
    />
  )
}
