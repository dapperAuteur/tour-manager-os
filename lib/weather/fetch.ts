'use server'

import { createAdminClient } from '@/lib/supabase/admin'

interface WeatherData {
  temp_high_f: number
  temp_low_f: number
  description: string
  precipitation_pct: number
  wind_mph: number
}

export async function getWeatherForShow(showId: string, city: string, state: string | null, date: string): Promise<WeatherData | null> {
  const supabase = createAdminClient()

  // Check cache first
  const { data: cached } = await supabase
    .from('weather_cache')
    .select('*')
    .eq('show_id', showId)
    .single()

  if (cached) {
    return {
      temp_high_f: cached.temp_high_f || 0,
      temp_low_f: cached.temp_low_f || 0,
      description: cached.description || '',
      precipitation_pct: cached.precipitation_pct || 0,
      wind_mph: cached.wind_mph || 0,
    }
  }

  // Fetch from Open-Meteo (free, no API key needed)
  try {
    const location = `${city}${state ? `, ${state}` : ''}, US`
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`, { next: { revalidate: 86400 } })
    const geoData = await geoRes.json()

    if (!geoData.results?.[0]) return null

    const { latitude, longitude } = geoData.results[0]

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,weather_code&temperature_unit=fahrenheit&start_date=${date}&end_date=${date}`,
      { next: { revalidate: 3600 } }
    )
    const weatherData = await weatherRes.json()

    if (!weatherData.daily) return null

    const weatherCodes: Record<number, string> = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
      55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
      80: 'Rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
      95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
    }

    const result: WeatherData = {
      temp_high_f: Math.round(weatherData.daily.temperature_2m_max[0]),
      temp_low_f: Math.round(weatherData.daily.temperature_2m_min[0]),
      description: weatherCodes[weatherData.daily.weather_code[0]] || 'Unknown',
      precipitation_pct: weatherData.daily.precipitation_probability_max[0] || 0,
      wind_mph: Math.round((weatherData.daily.wind_speed_10m_max[0] || 0) * 0.621371),
    }

    // Cache it
    await supabase.from('weather_cache').upsert({
      show_id: showId,
      city,
      state,
      date,
      ...result,
    })

    return result
  } catch {
    return null
  }
}
