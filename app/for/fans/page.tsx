import type { Metadata } from 'next'
import { LandingPage } from '@/components/layout/landing-page'

export const metadata: Metadata = {
  title: 'Tour Manager OS for Fans',
  description: 'Get closer to the music. Exclusive content, merch, community, and show notifications from your favorite touring artists.',
  openGraph: {
    title: 'Tour Manager OS for Fans',
    description: 'Get closer to the music. Exclusive content, merch, and community.',
  },
}

export default function FansPage() {
  return (
    <LandingPage
      title="Get closer to the music you love."
      subtitle="For Fans"
      description="Exclusive content, merch drops, community forums, and show notifications from your favorite touring artists."
      benefits={[
        { title: 'Exclusive Content', description: 'Behind-the-scenes photos, videos, and stories posted directly by the artists during tour.' },
        { title: 'Merch Store', description: 'Shop tour merch online. Tour-exclusive items tied to specific shows. Never miss a limited drop.' },
        { title: 'Community', description: 'Join discussions with other fans. Talk about shows, share experiences, and connect around the music.' },
        { title: 'Show Notifications', description: 'Get notified when your favorite artist announces a show in your city. Never miss a tour date.' },
        { title: 'Event Pages', description: 'See upcoming shows with venue info, ticket links, and other artists on the bill.' },
        { title: 'Concert History', description: 'Check in at shows and build your concert history. See every show you\'ve attended.' },
      ]}
      demoRole="readonly"
      demoLabel="Explore as a Fan"
      modules={['Community', 'Fan Engagement', 'Merch Management']}
    />
  )
}
