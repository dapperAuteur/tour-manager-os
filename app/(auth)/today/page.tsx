import type { Metadata } from 'next'
import { getShowDayForDate, getUserTourDates } from '@/lib/showday/queries'
import { getWeatherForShow } from '@/lib/weather/fetch'
import { DayView } from './day-view'
import { DayNav } from './day-nav'
import { NoShowDay } from './no-show-day'

export const metadata: Metadata = {
  title: 'Today',
  robots: { index: false },
}

interface TodayPageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const { date } = await searchParams
  const dateStr = date || new Date().toISOString().split('T')[0]
  const data = await getShowDayForDate(dateStr)
  const allDates = await getUserTourDates()

  let weather = null
  if (data) {
    weather = await getWeatherForShow(data.show.id, data.show.city, data.show.state, dateStr)
  }

  return (
    <main id="main-content" className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <DayNav currentDate={dateStr} allDates={allDates} />

      {data ? (
        <DayView data={data} weather={weather} />
      ) : (
        <NoShowDay date={dateStr} />
      )}
    </main>
  )
}
