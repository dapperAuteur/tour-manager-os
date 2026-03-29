'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DayNavProps {
  currentDate: string
  allDates: { date: string; city: string; state: string | null; venue_name: string | null }[]
}

export function DayNav({ currentDate, allDates }: DayNavProps) {
  const router = useRouter()
  const showDates = allDates.map((d) => d.date)
  const currentIdx = showDates.indexOf(currentDate)

  function goTo(date: string) {
    router.push(`/today?date=${date}`)
  }

  function goPrev() {
    if (currentIdx > 0) {
      goTo(showDates[currentIdx - 1])
    } else {
      // Go to previous calendar day
      const prev = new Date(currentDate)
      prev.setDate(prev.getDate() - 1)
      goTo(prev.toISOString().split('T')[0])
    }
  }

  function goNext() {
    if (currentIdx >= 0 && currentIdx < showDates.length - 1) {
      goTo(showDates[currentIdx + 1])
    } else {
      const next = new Date(currentDate)
      next.setDate(next.getDate() + 1)
      goTo(next.toISOString().split('T')[0])
    }
  }

  const dateObj = new Date(currentDate + 'T12:00:00')
  const isToday = currentDate === new Date().toISOString().split('T')[0]

  return (
    <div className="mb-6 flex items-center justify-between">
      <button
        type="button"
        onClick={goPrev}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-default transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Previous day"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="text-center">
        <p className="text-lg font-bold">
          {dateObj.toLocaleDateString('en-US', { weekday: 'long' })}
        </p>
        <p className="text-sm text-text-secondary">
          {dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        {isToday && (
          <span className="mt-1 inline-block rounded-full bg-primary-500/20 px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400">
            Today
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={goNext}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-default transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Next day"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}
