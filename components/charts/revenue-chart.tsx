'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: { date: string; revenue: number; expenses: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) return null

  return (
    <div className="h-64 w-full" aria-label="Revenue vs expenses chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" tickFormatter={(v) => `$${v}`} />
          <Tooltip
            formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Expenses']}
            contentStyle={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border-default)', borderRadius: '8px', fontSize: '12px' }}
          />
          <Line type="monotone" dataKey="revenue" stroke="var(--color-success-500)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="expenses" stroke="var(--color-error-500)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
