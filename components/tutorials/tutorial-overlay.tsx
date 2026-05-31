'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import {
  markTutorialCompleted,
  markTutorialSkipped,
  updateTutorialStep,
} from '@/lib/tutorials/actions'

export interface TutorialStep {
  step_number: number
  title: string
  content: string
}

interface TutorialOverlayProps {
  moduleId: string
  moduleName: string
  steps: TutorialStep[]
  initialStep?: number
  /**
   * When true, the overlay opens immediately on mount (first-access flow).
   * When false, it stays closed until `open` flips to true (replay flow,
   * controlled by `<ReplayTutorialButton>`).
   */
  autoOpen?: boolean
}

export function TutorialOverlay({
  moduleId,
  moduleName,
  steps,
  initialStep = 0,
  autoOpen = true,
}: TutorialOverlayProps) {
  const router = useRouter()
  const [open, setOpen] = useState(autoOpen)
  const [index, setIndex] = useState(
    Math.min(initialStep, Math.max(steps.length - 1, 0)),
  )
  const [, startTransition] = useTransition()

  // Close on Escape key for accessibility — Escape == skip.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') skip()
      if (e.key === 'ArrowRight' && index < steps.length - 1) goNext()
      if (e.key === 'ArrowLeft' && index > 0) goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // We intentionally re-run when index or open changes so the
    // arrow-key handlers see the current index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index])

  if (!open || steps.length === 0) return null

  const step = steps[index]
  const isLast = index === steps.length - 1
  const isFirst = index === 0

  function goNext() {
    const next = Math.min(index + 1, steps.length - 1)
    setIndex(next)
    startTransition(() => {
      updateTutorialStep(moduleId, next)
    })
  }
  function goPrev() {
    setIndex(Math.max(index - 1, 0))
  }
  function finish() {
    setOpen(false)
    startTransition(async () => {
      await markTutorialCompleted(moduleId)
      router.refresh()
    })
  }
  function skip() {
    setOpen(false)
    startTransition(async () => {
      await markTutorialSkipped(moduleId)
      router.refresh()
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border-default bg-surface-raised p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
              {moduleName} &middot; Step {index + 1} of {steps.length}
            </p>
            <h2 id="tutorial-title" className="mt-1 text-lg font-semibold">
              {step.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={skip}
            aria-label="Skip tutorial"
            className="rounded-md p-1 text-text-muted hover:bg-surface-alt hover:text-text-secondary"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
          {step.content}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={skip}
            className="text-xs font-medium text-text-muted hover:text-text-secondary"
          >
            Skip walkthrough
          </button>
          <div className="flex gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex items-center gap-1 rounded-md border border-border-default px-3 py-1.5 text-xs font-medium hover:bg-surface-alt"
              >
                <ChevronLeft className="size-3" aria-hidden /> Back
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
              >
                Next <ChevronRight className="size-3" aria-hidden />
              </button>
            )}
            {isLast && (
              <button
                type="button"
                onClick={finish}
                className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
              >
                <Check className="size-3" aria-hidden /> Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
