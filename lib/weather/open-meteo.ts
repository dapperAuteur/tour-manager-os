// Open-Meteo is a free, no-API-key forecast service. Two endpoints:
//   - Geocoding:  https://geocoding-api.open-meteo.com/v1/search
//   - Forecast:   https://api.open-meteo.com/v1/forecast
// Forecast horizon is 16 days; beyond that returns no data for the date.

export interface DailyForecast {
  date: string
  tempHighF: number
  tempLowF: number
  precipitationPct: number
  windMph: number
  description: string
  icon: string
}

interface GeocodeResult {
  latitude: number
  longitude: number
}

// WMO weather codes — https://open-meteo.com/en/docs#weathervariables
// Mapping to a short label + a Lucide icon name. Keep small; we render
// only daily summaries.
const WMO_MAP: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear', icon: 'Sun' },
  1: { description: 'Mostly clear', icon: 'Sun' },
  2: { description: 'Partly cloudy', icon: 'CloudSun' },
  3: { description: 'Overcast', icon: 'Cloud' },
  45: { description: 'Fog', icon: 'CloudFog' },
  48: { description: 'Freezing fog', icon: 'CloudFog' },
  51: { description: 'Light drizzle', icon: 'CloudDrizzle' },
  53: { description: 'Drizzle', icon: 'CloudDrizzle' },
  55: { description: 'Heavy drizzle', icon: 'CloudDrizzle' },
  56: { description: 'Freezing drizzle', icon: 'CloudDrizzle' },
  57: { description: 'Freezing drizzle', icon: 'CloudDrizzle' },
  61: { description: 'Light rain', icon: 'CloudRain' },
  63: { description: 'Rain', icon: 'CloudRain' },
  65: { description: 'Heavy rain', icon: 'CloudRainWind' },
  66: { description: 'Freezing rain', icon: 'CloudRain' },
  67: { description: 'Freezing rain', icon: 'CloudRain' },
  71: { description: 'Light snow', icon: 'CloudSnow' },
  73: { description: 'Snow', icon: 'CloudSnow' },
  75: { description: 'Heavy snow', icon: 'CloudSnow' },
  77: { description: 'Snow grains', icon: 'CloudSnow' },
  80: { description: 'Rain showers', icon: 'CloudRain' },
  81: { description: 'Rain showers', icon: 'CloudRain' },
  82: { description: 'Violent rain showers', icon: 'CloudRainWind' },
  85: { description: 'Snow showers', icon: 'CloudSnow' },
  86: { description: 'Snow showers', icon: 'CloudSnow' },
  95: { description: 'Thunderstorm', icon: 'CloudLightning' },
  96: { description: 'Thunderstorm with hail', icon: 'CloudLightning' },
  99: { description: 'Severe thunderstorm', icon: 'CloudLightning' },
}

function describeCode(code: number): { description: string; icon: string } {
  return WMO_MAP[code] || { description: 'Weather', icon: 'Cloud' }
}

export async function geocode(
  city: string,
  state: string | null,
  country = 'US',
): Promise<GeocodeResult | null> {
  const query = state ? `${city}, ${state}` : city
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', query)
  url.searchParams.set('count', '1')
  url.searchParams.set('country', country)

  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    next: { revalidate: 60 * 60 * 24 * 7 }, // 7-day Next.js fetch cache
  })
  if (!res.ok) return null
  const json = (await res.json()) as {
    results?: { latitude: number; longitude: number }[]
  }
  const hit = json.results?.[0]
  if (!hit) return null
  return { latitude: hit.latitude, longitude: hit.longitude }
}

export async function fetchForecast(
  lat: number,
  lon: number,
  date: string, // YYYY-MM-DD
): Promise<DailyForecast | null> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('daily', [
    'temperature_2m_max',
    'temperature_2m_min',
    'weather_code',
    'precipitation_probability_max',
    'wind_speed_10m_max',
  ].join(','))
  url.searchParams.set('temperature_unit', 'fahrenheit')
  url.searchParams.set('wind_speed_unit', 'mph')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('start_date', date)
  url.searchParams.set('end_date', date)

  const res = await fetch(url, {
    headers: { accept: 'application/json' },
    next: { revalidate: 60 * 60 }, // 1-hour Next.js fetch cache (we also cache in DB)
  })
  if (!res.ok) return null

  const json = (await res.json()) as {
    daily?: {
      time?: string[]
      temperature_2m_max?: number[]
      temperature_2m_min?: number[]
      weather_code?: number[]
      precipitation_probability_max?: number[]
      wind_speed_10m_max?: number[]
    }
  }
  const daily = json.daily
  if (!daily?.time || daily.time.length === 0) return null

  const i = daily.time.indexOf(date)
  if (i < 0) return null

  const high = daily.temperature_2m_max?.[i]
  const low = daily.temperature_2m_min?.[i]
  const code = daily.weather_code?.[i]
  const precip = daily.precipitation_probability_max?.[i]
  const wind = daily.wind_speed_10m_max?.[i]
  if (typeof high !== 'number' || typeof low !== 'number' || typeof code !== 'number') {
    return null
  }
  const { description, icon } = describeCode(code)
  return {
    date,
    tempHighF: Math.round(high),
    tempLowF: Math.round(low),
    precipitationPct: typeof precip === 'number' ? Math.round(precip) : 0,
    windMph: typeof wind === 'number' ? Math.round(wind) : 0,
    description,
    icon,
  }
}

// Open-Meteo's free forecast window. Past dates return null.
export const FORECAST_HORIZON_DAYS = 16

export function isWithinForecastHorizon(date: string): boolean {
  const target = new Date(date + 'T00:00:00Z').getTime()
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const future = target - now
  if (future < -dayMs) return false // past
  if (future > FORECAST_HORIZON_DAYS * dayMs) return false // too far
  return true
}
