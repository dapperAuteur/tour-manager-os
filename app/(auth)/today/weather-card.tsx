import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Droplets,
  Sun,
  Wind,
} from 'lucide-react'
import type { ShowWeather } from '@/lib/weather/actions'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudLightning,
}

interface WeatherCardProps {
  weather: ShowWeather
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const Icon = ICONS[weather.icon] || Cloud
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border-default bg-surface-raised p-4">
      <Icon
        className="h-10 w-10 shrink-0 text-primary-500"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums">
            {weather.tempHighF}&deg;
          </span>
          <span className="text-sm text-text-muted">
            / {weather.tempLowF}&deg;F
          </span>
        </div>
        <p className="truncate text-sm">{weather.description}</p>
      </div>
      <div className="hidden flex-col items-end gap-1 text-xs text-text-muted sm:flex">
        {weather.precipitationPct > 0 && (
          <span className="flex items-center gap-1" title="Precipitation chance">
            <Droplets className="h-3 w-3" aria-hidden="true" />
            {weather.precipitationPct}%
          </span>
        )}
        <span className="flex items-center gap-1" title="Max wind">
          <Wind className="h-3 w-3" aria-hidden="true" />
          {weather.windMph} mph
        </span>
        {weather.isStale && (
          <span className="text-[10px] uppercase tracking-wider text-text-muted">
            Cached
          </span>
        )}
      </div>
    </div>
  )
}
