import { Heart, MapPin, Phone, ExternalLink } from 'lucide-react'

export function RiseWellnessCard() {
  return (
    <section
      aria-label="Mental health support resources"
      className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-5"
    >
      <div className="mb-2 flex items-center gap-2">
        <Heart className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-primary-700 dark:text-primary-300">Mental Health Support</h2>
      </div>
      <p className="mb-4 text-sm text-text-secondary leading-relaxed">
        Rise Wellness of Indiana provides compassionate, personalized, holistic mental health
        care — helping you heal, grow, and thrive in mind, body, and spirit.
      </p>
      <address className="not-italic space-y-2">
        <div className="flex items-start gap-2 text-sm text-text-secondary">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
          <span>320 N Meridian St, Indianapolis, IN 46204</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <a href="tel:+13179650299" aria-label="Call Rise Wellness of Indiana" className="text-primary-600 hover:underline dark:text-primary-400">
            317-965-0299
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ExternalLink className="h-4 w-4 text-text-muted" aria-hidden="true" />
          <a href="https://risewellnessofindiana.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline dark:text-primary-400">
            risewellnessofindiana.com
          </a>
        </div>
      </address>
    </section>
  )
}
