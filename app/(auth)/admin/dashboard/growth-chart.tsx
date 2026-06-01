'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

export interface GrowthPoint {
  date: string
  users: number
  tours: number
  feedback: number
}

/**
 * Recharts line chart: 30-day daily growth for signups, new tours, and
 * new feedback threads. Tooltip + legend included. Colors are wired to
 * inline Tailwind tokens since recharts SVG doesn't pick up CSS classes.
 */
export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">
        Growth (last 30 days)
      </h2>
      <p className="mb-4 text-xs text-text-muted">
        New signups, new tours, and new feedback threads per day.
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 16, left: -8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.2)" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => {
                const date = new Date(d as string)
                return `${date.getMonth() + 1}/${date.getDate()}`
              }}
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-text-muted"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              className="text-text-muted"
              width={32}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-raised, #fff)',
                border: '1px solid rgba(120,120,120,0.3)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelFormatter={(d) => new Date(d as string).toLocaleDateString()}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="users"
              name="Signups"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="tours"
              name="Tours"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="feedback"
              name="Feedback"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
