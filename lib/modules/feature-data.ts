interface FeaturePageData {
  name: string
  tagline: string
  description: string
  benefits: { title: string; description: string }[]
  userTypes: string[]
  status: 'available' | 'coming-soon'
}

export const featurePages: Record<string, FeaturePageData> = {
  'advance-sheets': {
    name: 'Advance Sheets',
    tagline: 'Digital venue questionnaires that write your itinerary',
    description: 'Send venues a link. They fill out a web form with all the details you need — stage dimensions, contacts, catering, show times. The data flows into your itinerary automatically.',
    benefits: [
      { title: 'No More Excel', description: 'Replace emailed spreadsheets with a clean web form. Venues fill it out on any device, no login required.' },
      { title: 'Auto-Generated Itinerary', description: 'Advance sheet data flows directly into your daily itinerary. Zero re-entry.' },
      { title: 'Status Tracking', description: 'See which venues have submitted, which are pending, and which need follow-up — all at a glance.' },
      { title: 'Every Detail Covered', description: 'Venue type, dressing rooms, catering, production specs, show times, contacts, sound company — matching the industry-standard advance sheet format.' },
    ],
    userTypes: ['Tour Managers', 'Venue Contacts'],
    status: 'available',
  },
  'itineraries': {
    name: 'Itineraries',
    tagline: 'Daily schedules that build themselves',
    description: 'Auto-generated from advance sheet data with hotel info, travel details, contacts, and production specs. Print-friendly format matching the template your team already uses.',
    benefits: [
      { title: 'Auto-Generated', description: 'No manual data entry. Itineraries build themselves as venues submit advance sheets.' },
      { title: 'Print-Friendly', description: 'Matches the classic daily itinerary format — one page per day, everything at a glance.' },
      { title: 'Always Current', description: 'When advance sheet data updates, the itinerary updates automatically.' },
      { title: 'Travel Info', description: 'Distance, drive time, and driver info between shows. Hotel confirmation numbers and amenities.' },
    ],
    userTypes: ['Tour Managers', 'Musicians', 'Crew'],
    status: 'available',
  },
  'tour-finances': {
    name: 'Tour Finances',
    tagline: 'Are we making money on this tour?',
    description: 'Real-time P&L per show and per tour. Track expenses by category, capture receipts, see per-member financials, and export tax-ready CSV reports.',
    benefits: [
      { title: 'Tour P&L Dashboard', description: 'Total revenue, total expenses, net profit — big numbers at a glance for the whole tour.' },
      { title: 'Expense Tracking', description: '10 categories: travel, hotel, per diem, meals, equipment, crew, merch, marketing, insurance, other.' },
      { title: 'Personal Finance View', description: 'Each member sees their own expenses, payouts, what they\'re owed, and tax-deductible totals.' },
      { title: 'CSV Export', description: 'One click to export all expenses for your accountant. Tax-deductible flagging built in.' },
    ],
    userTypes: ['Tour Managers', 'Musicians'],
    status: 'available',
  },
  'show-day': {
    name: 'Show Day',
    tagline: 'Open your phone. See your whole day.',
    description: 'Mobile-first daily companion for every member. Schedule timeline, venue with tap-to-navigate, hotel with tap-to-call, contacts, catering, and timezone-aware times.',
    benefits: [
      { title: 'Schedule Timeline', description: 'Bus call, soundcheck, doors, stage time, curfew — displayed with timezone labels so there\'s no confusion.' },
      { title: 'Tap-to-Navigate', description: 'Venue and hotel addresses open directly in Google Maps. No copying and pasting.' },
      { title: 'Tap-to-Call', description: 'Every phone number is tappable. Call the venue, hotel, driver, or promoter instantly.' },
      { title: 'Day Navigation', description: 'Browse forward and back between show days. See the next destination and distance.' },
    ],
    userTypes: ['Musicians', 'Crew'],
    status: 'available',
  },
  'merch-management': {
    name: 'Merch Management',
    tagline: 'Track inventory, sales, and your online store',
    description: 'Manage merch inventory, track per-show sales, run an online store with Stripe, and see merch P&L separate from show revenue.',
    benefits: [
      { title: 'Inventory Tracking', description: 'SKUs, quantities, cost basis. Know exactly what you have before every show.' },
      { title: 'Per-Show Sales', description: 'Log sales at each show. Running inventory updates in real time.' },
      { title: 'Online Store', description: 'Sell merch online with Stripe payments. Tour-exclusive drops tied to specific shows.' },
      { title: 'Merch P&L', description: 'Separate merch financials from show revenue. See which items actually make money.' },
    ],
    userTypes: ['Tour Managers', 'Musicians'],
    status: 'coming-soon',
  },
  'fan-engagement': {
    name: 'Fan Engagement',
    tagline: 'Build your audience, show by show',
    description: 'Marketing emails with city-based segments, exclusive content drops, public event pages, and email list capture at every touchpoint.',
    benefits: [
      { title: 'Email Marketing', description: 'Build your fan email list from merch purchases, check-ins, and signups. Send segmented campaigns by city.' },
      { title: 'Exclusive Content', description: 'Post behind-the-scenes content for fans. Reward your most engaged supporters.' },
      { title: 'Event Pages', description: 'Public show pages with venue info, ticket links, and other artists on the bill.' },
      { title: 'List Growth', description: 'Capture emails at every touchpoint — merch sales, show check-ins, newsletter signups.' },
    ],
    userTypes: ['Tour Managers', 'Fans'],
    status: 'coming-soon',
  },
  'community': {
    name: 'Community',
    tagline: 'A home for your fans',
    description: 'Discussion boards, artist announcements, fan profiles, and VIP areas for subscribers and merch buyers.',
    benefits: [
      { title: 'Discussion Boards', description: 'Organized by topic — tour talk, music, merch, general. Fans connect around the music.' },
      { title: 'Artist Announcements', description: 'Pin important posts. Share tour updates directly with your community.' },
      { title: 'Fan Profiles', description: 'Concert history, merch collection, and badges. Reward your most dedicated fans.' },
      { title: 'Moderation', description: 'Admin and designated members can moderate discussions to keep the community healthy.' },
    ],
    userTypes: ['Fans', 'Musicians'],
    status: 'coming-soon',
  },
  'document-hub': {
    name: 'Document Hub',
    tagline: 'Every contract, rider, and W-9 — organized',
    description: 'Upload and organize documents per tour and per show. Contracts, riders, insurance, venue maps, press materials — all searchable and version-tracked.',
    benefits: [
      { title: 'Per Tour & Show', description: 'Documents organized by tour and by show. Find the rider for tonight\'s venue in seconds.' },
      { title: 'Categories', description: 'Contracts, riders, insurance, W-9s, venue maps, production specs, press materials.' },
      { title: 'Version History', description: 'Updated documents keep their history. See what changed and when.' },
      { title: 'Offline Access', description: 'Pin important documents for offline viewing. Available even without signal.' },
    ],
    userTypes: ['Tour Managers', 'Crew'],
    status: 'coming-soon',
  },
  'production-bible': {
    name: 'Production Bible',
    tagline: 'Stage plots, equipment, and crew call sheets',
    description: 'Drag-and-drop stage plot builder, equipment inventory, auto-generated crew call sheets, and historical production notes per venue.',
    benefits: [
      { title: 'Stage Plot Builder', description: 'Drag-and-drop stage plot linked to each venue\'s actual stage dimensions from the advance sheet.' },
      { title: 'Equipment Inventory', description: 'Track what travels with you vs. what the venue provides. Never forget a cable again.' },
      { title: 'Crew Call Sheets', description: 'Auto-generated from advance sheet data. Load-in time, soundcheck, changeover, show.' },
      { title: 'Venue Notes', description: '"The loading dock is around back, bring extra XLR cables." Notes that persist for return engagements.' },
    ],
    userTypes: ['Crew', 'Tour Managers'],
    status: 'coming-soon',
  },
  'academy': {
    name: 'Academy',
    tagline: 'Learn to get the most from every feature',
    description: 'Courses and lessons on using the platform — from getting started basics to advanced financial management and marketing strategies.',
    benefits: [
      { title: 'Structured Courses', description: 'Step-by-step lessons organized by topic. Getting Started, Tour Finances 101, Marketing Your Band.' },
      { title: 'Video + Rich Text', description: 'Lessons with embedded videos, rich text content, and interactive examples.' },
      { title: 'Progress Tracking', description: 'See which courses you\'ve completed. Pick up where you left off.' },
      { title: 'Quizzes', description: 'Test your knowledge with quizzes at the end of each lesson.' },
    ],
    userTypes: ['Tour Managers', 'Musicians', 'Crew'],
    status: 'coming-soon',
  },
  'wellness': {
    name: 'Wellness',
    tagline: 'Health and wellbeing on the road',
    description: 'Sleep tracking, warmup reminders, mood tracking, and burnout detection — designed for the unique challenges of touring life.',
    benefits: [
      { title: 'Sleep Tracking', description: 'Track sleep relative to timezone changes. See patterns across the tour.' },
      { title: 'Warmup Reminders', description: 'Vocal and physical warmup routines with reminders before soundcheck.' },
      { title: 'Mood & Energy', description: 'Self-reported energy and mood tracking. Correlate with show quality and schedule density.' },
      { title: 'Burnout Detection', description: 'Alerts when schedule density and self-reported energy suggest it\'s time for rest.' },
    ],
    userTypes: ['Musicians', 'Crew'],
    status: 'coming-soon',
  },
}

export function getFeaturePageData(slug: string): FeaturePageData | null {
  return featurePages[slug] || null
}

export function getAllFeatureSlugs(): string[] {
  return Object.keys(featurePages)
}
