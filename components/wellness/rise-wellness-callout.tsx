/**
 * Canonical Rise Wellness callout. Use this anywhere we surface mental
 * health resources — the SiteFooter mounts one, /wellness-resources
 * mounts one in-page, and the authenticated /wellness module page does
 * too. The non-affiliation disclaimer was vetted with the partner;
 * DO NOT paraphrase, trim, or reorder it. Edit only the app-name token.
 */
export function RiseWellnessCallout({
  className = '',
}: {
  className?: string
}) {
  return (
    <section
      aria-labelledby="rise-wellness-heading"
      className={`rounded-lg border border-primary-500/30 bg-primary-500/5 p-5 text-sm ${className}`}
    >
      <header className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-400">
          Mental health support
        </p>
        <h2
          id="rise-wellness-heading"
          className="text-base font-semibold text-text-primary"
        >
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
            <span aria-hidden="true" className="text-text-muted">
              &middot;
            </span>
            <a
              href="https://risewellnessofindiana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-7 items-center rounded font-medium text-primary-700 hover:underline focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 dark:text-primary-400"
            >
              risewellnessofindiana.com
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            <span aria-hidden="true" className="text-text-muted">
              &middot;
            </span>
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
