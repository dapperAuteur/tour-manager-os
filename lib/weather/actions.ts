'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  fetchForecast,
  geocode,
  isWithinForecastHorizon,
} from './open-meteo'

export interface ShowWeather {
  date: string
  tempHighF: number
  tempLowF: number
  precipitationPct: number
  windMph: number
  description: string
  icon: string
  fetchedAt: string
  isStale: boolean
}

// Cache freshness rules:
//   - Past dates: cached row is final, never refresh.
//   - Future <= 14 days: refresh if cached row is older than 4 hours.
//   - Future > 14 days: refresh if older than 24 hours.
// Forecasts beyond Open-Meteo's 16-day horizon return null.
function isCacheFresh(date: string, fetchedAt: string): boolean {
  const showMs = new Date(date + 'T00:00:00Z').getTime()
  const fetchedMs = new Date(fetchedAt).getTime()
  const ageMs = Date.now() - fetchedMs
  const isPast = showMs < Date.now() - 24 * 60 * 60 * 1000
  if (isPast) return true
  const daysOut = (showMs - Date.now()) / (24 * 60 * 60 * 1000)
  const maxAgeMs = daysOut <= 14 ? 4 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
  return ageMs < maxAgeMs
}

export async function getWeatherForShow(
  showId: string,
): Promise<ShowWeather | null> {
  const supabase = createAdminClient()

  // Fetch show context for geocoding.
  const { data: show } = await supabase
    .from('shows')
    .select('id, date, city, state, country')
    .eq('id', showId)
    .maybeSingle()
  if (!show?.date || !show.city) return null

  // Check existing cache row.
  const { data: cached } = await supabase
    .from('weather_cache')
    .select('*')
    .eq('show_id', showId)
    .maybeSingle()

  if (cached && cached.fetched_at && isCacheFresh(show.date, cached.fetched_at)) {
    return rowToWeather(cached, false)
  }

  // Past + no cache: nothing to do, Open-Meteo only forecasts forward.
  if (!isWithinForecastHorizon(show.date)) {
    return cached ? rowToWeather(cached, true) : null
  }

  // Fetch fresh.
  const coords = await geocode(show.city, show.state, show.country || 'US')
  if (!coords) return cached ? rowToWeather(cached, true) : null
  const forecast = await fetchForecast(coords.latitude, coords.longitude, show.date)
  if (!forecast) return cached ? rowToWeather(cached, true) : null

  const upsertRow = {
    show_id: showId,
    city: show.city,
    state: show.state,
    date: show.date,
    temp_high_f: forecast.tempHighF,
    temp_low_f: forecast.tempLowF,
    description: forecast.description,
    icon: forecast.icon,
    precipitation_pct: forecast.precipitationPct,
    wind_mph: forecast.windMph,
    fetched_at: new Date().toISOString(),
  }
  await supabase
    .from('weather_cache')
    .upsert(upsertRow, { onConflict: 'show_id' })

  return {
    date: show.date,
    tempHighF: forecast.tempHighF,
    tempLowF: forecast.tempLowF,
    precipitationPct: forecast.precipitationPct,
    windMph: forecast.windMph,
    description: forecast.description,
    icon: forecast.icon,
    fetchedAt: upsertRow.fetched_at,
    isStale: false,
  }
}

interface WeatherRow {
  date: string
  temp_high_f: number
  temp_low_f: number
  precipitation_pct: number | null
  wind_mph: number | null
  description: string | null
  icon: string | null
  fetched_at: string
}

function rowToWeather(row: WeatherRow, isStale: boolean): ShowWeather {
  return {
    date: row.date,
    tempHighF: row.temp_high_f,
    tempLowF: row.temp_low_f,
    precipitationPct: row.precipitation_pct ?? 0,
    windMph: row.wind_mph ?? 0,
    description: row.description || 'Weather',
    icon: row.icon || 'Cloud',
    fetchedAt: row.fetched_at,
    isStale,
  }
}
