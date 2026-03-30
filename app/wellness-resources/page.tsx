import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart, Dumbbell, Activity, Brain, ExternalLink } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { RiseWellnessCard } from '@/components/ui/rise-wellness-card'

export const metadata: Metadata = {
  title: 'Wellness Resources',
  description: 'Free exercise library, warmup routines, and mental health resources for touring musicians.',
  openGraph: {
    title: 'Wellness Resources — Tour Manager OS',
    description: 'Free exercise library, warmup routines, and mental health resources for touring musicians.',
  },
}

export default function WellnessResourcesPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-12 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-error-500" aria-hidden="true" />
          <h1 className="text-3xl font-bold">Wellness Resources</h1>
          <p className="mt-2 text-text-secondary">Free tools for staying healthy on the road.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* CentenarianOS */}
          <section className="rounded-xl border border-border-default bg-surface-raised p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success-500/10">
              <Dumbbell className="h-6 w-6 text-success-600 dark:text-success-500" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-xl font-bold">CentenarianOS Exercise Library</h2>
            <p className="mb-4 text-sm text-text-secondary">
              Browse 110+ free exercises with step-by-step instructions, muscle diagrams, and video guides.
              Built for longevity-focused fitness — perfect for staying strong on the road.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> Free — no account required</li>
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> Step-by-step instructions</li>
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> Muscle group targeting</li>
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-success-600 dark:text-success-500" aria-hidden="true" /> Beginner to advanced</li>
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="https://centenarianos.com/exercises"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-success-600 px-6 py-3 text-sm font-medium text-white hover:bg-success-600/90"
              >
                <Dumbbell className="h-4 w-4" aria-hidden="true" />
                Browse Exercises
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              <a
                href="https://centenarianos.com/workouts"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-default px-6 py-3 text-sm font-medium hover:bg-surface-alt"
              >
                Browse Workouts
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          </section>

          {/* CentenarianOS Platform */}
          <section className="rounded-xl border border-border-default bg-surface-raised p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10">
              <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-xl font-bold">CentenarianOS Platform</h2>
            <p className="mb-4 text-sm text-text-secondary">
              The full CentenarianOS platform goes beyond exercises — track health metrics, connect wearables (Garmin, Oura, WHOOP),
              log workouts, and get AI-powered insights for longevity-focused living.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-text-secondary">
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" /> Health metrics tracking</li>
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" /> Wearable integrations</li>
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" /> Workout logging & templates</li>
              <li className="flex items-center gap-2"><Activity className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" /> Body composition tracking</li>
            </ul>
            <a
              href="https://centenarianos.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700"
            >
              Learn More About CentenarianOS
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </section>
        </div>

        {/* Rise Wellness */}
        <div className="mt-8">
          <RiseWellnessCard />
        </div>

        {/* Medical disclaimer */}
        <div className="mt-8 rounded-xl border border-warning-500/20 bg-warning-500/5 p-4 text-xs text-text-muted">
          <p className="font-semibold text-warning-600 dark:text-warning-500">Medical Disclaimer</p>
          <p className="mt-1">
            The wellness content and exercise information provided is for general educational purposes only. It is not intended as a substitute
            for professional medical advice, diagnosis, or treatment. Always consult your physician or qualified health provider before starting
            any new exercise program, especially while on tour with demanding schedules.
          </p>
        </div>

        <footer className="mt-12 border-t border-border-default py-8 text-center text-sm text-text-muted">
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="hover:text-text-secondary">Home</Link>
            <Link href="/roadmap" className="hover:text-text-secondary">Roadmap</Link>
            <Link href="/login" className="hover:text-text-secondary">Log In</Link>
          </div>
        </footer>
      </main>
    </>
  )
}
