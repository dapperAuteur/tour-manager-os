import Link from 'next/link'

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

        <RiseWellnessCallout />

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

// Rise Wellness callout — canonical copy. The non-affiliation disclaimer
// is vetted with the partner; DO NOT paraphrase. The only swap targets
// here are container border/bg and accent colors — wired to design tokens.
function RiseWellnessCallout() {
  return (
    <section
      aria-labelledby="rise-wellness-heading"
      className="mb-8 rounded-lg border border-primary-500/30 bg-primary-500/5 p-5 text-sm"
    >
      <header className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-400">
          Mental health support
        </p>
        <h2 id="rise-wellness-heading" className="text-base font-semibold text-text-primary">
          Rise Wellness of Indiana
        </h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Independent mental health provider &middot; Not affiliated with Tour Manager OS
        </p>
      </header>

      <p className="leading-relaxed text-text-secondary">
        Rise Wellness of Indiana provides compassionate, personalized,
        holistic mental health care: evidence-based medicine, trauma-informed
        care, and a whole-person approach to help you heal, grow, and thrive
        in mind, body, and spirit.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Services
          </p>
          <ul className="space-y-0.5 text-xs text-text-secondary">
            <li>ADHD testing &amp; management (in-person and from home)</li>
            <li>Anxiety &amp; depression</li>
            <li>Maternal mental health</li>
            <li>Medication management</li>
            <li>GeneSight&reg; genetic testing</li>
            <li>Behavioral therapy &amp; coaching</li>
            <li>Routine lab testing</li>
          </ul>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Visit or call
          </p>
          <address className="not-italic text-xs leading-relaxed text-text-secondary">
            320 North Meridian Street<br />
            Indianapolis, IN 46204<br />
            Mon&ndash;Sat by appointment &middot; Sun closed
          </address>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs">
            <a
              href="tel:+13179650299"
              className="inline-flex min-h-7 items-center rounded font-medium text-primary-700 hover:underline focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-primary-400"
            >
              317-965-0299
            </a>
            <span aria-hidden="true" className="text-text-muted">&middot;</span>
            <a
              href="https://risewellnessofindiana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-7 items-center rounded font-medium text-primary-700 hover:underline focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-primary-400"
            >
              risewellnessofindiana.com
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <span aria-hidden="true" className="text-text-muted">&middot;</span>
            <a
              href="https://www.centenarianos.com/safety#rise-wellness"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-7 items-center rounded font-medium text-primary-700 hover:underline focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-primary-400"
            >
              Full safety page
              <span className="sr-only"> on centenarianos.com (opens in new tab)</span>
            </a>
          </div>
        </div>
      </div>

      <blockquote className="mt-4 border-l-2 border-primary-500/50 pl-3 text-xs italic text-text-secondary">
        &ldquo;At Rise Wellness, we believe everyone has the capacity to rise
        above challenges and live a fulfilling, healthy life. Our care is
        guided by the belief that healing is personal, holistic, and rooted
        in compassion.&rdquo;
        <span className="mt-1 block not-italic text-text-muted">
          Rise Wellness of Indiana
        </span>
      </blockquote>

      {/* === NON-NEGOTIABLE DISCLAIMER ===
           Edit ONLY the app name token. Don't paraphrase. Don't trim.
           Don't reorder. This was vetted with the partner. */}
      <p className="mt-4 text-[11px] leading-relaxed text-text-muted">
        Rise Wellness of Indiana is an independent organization. They are
        not affiliated with, employed by, or endorsed by Tour Manager OS,
        CentenarianOS, B4C LLC, AwesomeWebStore.com, or Anthony McDonald.
        We are grateful for their collaboration on mental health safety
        resources for our community.
      </p>
    </section>
  )
}
