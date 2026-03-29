import Link from 'next/link'

export function DemoBanner() {
  return (
    <div className="bg-primary-600 px-4 py-2 text-center text-sm text-white" role="status">
      You&apos;re viewing a demo. Data resets at midnight.{' '}
      <Link href="/signup" className="font-semibold underline hover:no-underline">
        Sign up for your own account &rarr;
      </Link>
    </div>
  )
}
