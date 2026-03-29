export const DEMO_EMAIL = 'demo.tour.wit.us@awews.com'

export const DEMO_ROLES = [
  {
    id: 'manager',
    label: 'Tour Manager',
    description: 'Full admin experience — manage tours, shows, finances, team, and all modules.',
    orgRole: 'owner' as const,
    tourRole: 'manager' as const,
    email: `demo-manager@${DEMO_EMAIL.split('@')[1]}`,
    displayName: 'Demo Tour Manager',
    isPaid: true,
  },
  {
    id: 'member',
    label: 'Band Member',
    description: 'View your daily schedule, personal finances, and activate modules.',
    orgRole: 'member' as const,
    tourRole: 'member' as const,
    email: `demo-member@${DEMO_EMAIL.split('@')[1]}`,
    displayName: 'Demo Band Member',
    isPaid: true,
  },
  {
    id: 'crew',
    label: 'Crew Member',
    description: 'See production info, schedules, and show documents.',
    orgRole: 'member' as const,
    tourRole: 'crew' as const,
    email: `demo-crew@${DEMO_EMAIL.split('@')[1]}`,
    displayName: 'Demo Crew',
    isPaid: true,
  },
  {
    id: 'readonly',
    label: 'Free User (Read Only)',
    description: 'See what non-paying members can access — view only, no editing.',
    orgRole: 'member' as const,
    tourRole: 'member' as const,
    email: `demo-free@${DEMO_EMAIL.split('@')[1]}`,
    displayName: 'Demo Free User',
    isPaid: false,
  },
] as const

export type DemoRoleId = typeof DEMO_ROLES[number]['id']

export function getDemoRole(id: string) {
  return DEMO_ROLES.find((r) => r.id === id)
}

export function isDemoUser(email: string | undefined): boolean {
  if (!email) return false
  return DEMO_ROLES.some((r) => r.email === email)
}
