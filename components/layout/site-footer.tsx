import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-border-default bg-surface" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/features/advance-sheets" className="hover:text-text-primary">Advance Sheets</Link></li>
              <li><Link href="/features/tour-finances" className="hover:text-text-primary">Tour Finances</Link></li>
              <li><Link href="/features/show-day" className="hover:text-text-primary">Show Day</Link></li>
              <li><Link href="/features/merch-management" className="hover:text-text-primary">Merch</Link></li>
              <li><Link href="/features/community" className="hover:text-text-primary">Community</Link></li>
              <li><Link href="/features/wellness" className="hover:text-text-primary">Wellness</Link></li>
            </ul>
          </div>

          {/* For */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">For</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/for/tour-managers" className="hover:text-text-primary">Tour Managers</Link></li>
              <li><Link href="/for/musicians" className="hover:text-text-primary">Musicians</Link></li>
              <li><Link href="/for/crew" className="hover:text-text-primary">Crew</Link></li>
              <li><Link href="/for/venues" className="hover:text-text-primary">Venues</Link></li>
              <li><Link href="/for/fans" className="hover:text-text-primary">Fans</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/pricing" className="hover:text-text-primary">Pricing</Link></li>
              <li><Link href="/roadmap" className="hover:text-text-primary">Roadmap</Link></li>
              <li><Link href="/wellness-resources" className="hover:text-text-primary">Wellness Resources</Link></li>
              <li><Link href="/login?demo=true" className="hover:text-text-primary">Try Demo</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="mb-3 text-sm font-semibold">Account</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/login" className="hover:text-text-primary">Log In</Link></li>
              <li><Link href="/signup" className="hover:text-text-primary">Sign Up</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border-default pt-6 text-center text-xs text-text-muted">
          <p>Tour Manager OS &mdash; Tour.WitUS.Online</p>
        </div>
      </div>
    </footer>
  )
}
