const SUPER_ADMIN_EMAILS = [
  'bam@awews.com',
]

export function isSuperAdmin(email: string | undefined): boolean {
  if (!email) return false
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase())
}
