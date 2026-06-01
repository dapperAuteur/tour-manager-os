import Link from 'next/link'
import { RiseWellnessCallout } from '@/components/wellness/rise-wellness-callout'

// Canonical sibling-product list — mirror with the ecosystem footer recipe
// at https://raw.githubusercontent.com/dapperAuteur/witus-online/main/public/brand/footer-recipe.md
// When the ecosystem changes, update here and in every sibling repo's footer.
const SIBLING_PRODUCTS: { name: string; href: string }[] = [
  { name: 'WitUS.online', href: 'https://witus.online' },
  { name: 'WitUS Inbox', href: 'https://inbox.witus.online' },
  { name: 'CentenarianOS', href: 'https://centenarianos.com' },
  { name: 'Work.WitUS', href: 'https://work.witus.online' },
  { name: 'Wanderlearn', href: 'https://wanderlearn.witus.online' },
  { name: 'Fly.WitUS', href: 'https://fly.witus.online' },
  { name: 'FlashLearnAI', href: 'https://flashlearnai.witus.online' },
  { name: 'Learn.WitUS', href: 'https://centenarianos.com/academy' },
  { name: 'AwesomeWebStore', href: 'https://awesomewebstore.com' },
]

const externalLinkClasses =
  'inline-flex min-h-7 items-center text-text-secondary transition-colors hover:text-primary-600 hover:underline focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:hover:text-primary-400 rounded'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-12 border-t border-border-default bg-surface"
      role="contentinfo"
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <p className="font-extrabold text-text-primary">Tour Manager OS</p>
          <p className="text-xs text-text-muted">
            Tour management for touring musicians &middot; tour.witus.online
          </p>
        </div>

        <RiseWellnessCallout className="mb-8" />

        <div className="grid grid-cols-1 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-2 font-semibold text-text-primary">Ecosystem</p>
            <ul className="space-y-1">
              {SIBLING_PRODUCTS.map((p) => (
                <li key={p.href}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={externalLinkClasses}
                  >
                    {p.name}
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 font-semibold text-text-primary">Tour Manager OS</p>
            <ul className="space-y-1">
              <li><Link href="/" className={externalLinkClasses}>Home</Link></li>
              <li><Link href="/pricing" className={externalLinkClasses}>Pricing</Link></li>
              <li><Link href="/roadmap" className={externalLinkClasses}>Roadmap</Link></li>
              <li><Link href="/features/academy" className={externalLinkClasses}>Academy</Link></li>
              <li><Link href="/login?demo=true" className={externalLinkClasses}>Try Demo</Link></li>
              <li><Link href="/login" className={externalLinkClasses}>Sign in</Link></li>
              <li><Link href="/signup" className={externalLinkClasses}>Sign up</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-2 font-semibold text-text-primary">Partners &amp; Legal</p>
            <ul className="space-y-1">
              <li>
                <a
                  href="https://www.centenarianos.com/safety#rise-wellness"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={externalLinkClasses}
                >
                  Rise Wellness
                  <span className="sr-only"> (mental-health partner &mdash; opens in new tab)</span>
                </a>
                <p className="text-xs leading-tight text-text-muted">
                  Mental-health partner
                </p>
              </li>
              <li className="pt-2">
                <a
                  href="https://witus.online/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={externalLinkClasses}
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="https://witus.online/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={externalLinkClasses}
                >
                  Privacy
                </a>
              </li>
              <li>
                <a href="mailto:bam@awews.com" className={externalLinkClasses}>
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border-default pt-6 text-center text-xs text-text-muted">
          <p>
            &copy; {year} B4C LLC &mdash; A{' '}
            <a
              href="https://awesomewebstore.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-primary-600 hover:underline dark:hover:text-primary-400"
            >
              AwesomeWebStore.com
              <span className="sr-only"> (opens in new tab)</span>
            </a>{' '}
            brand
          </p>
        </div>
      </div>
    </footer>
  )
}
