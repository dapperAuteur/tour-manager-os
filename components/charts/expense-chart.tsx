'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ExpenseChartProps {
  data: { category: string; amount: number }[]
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  if (data.length === 0) return null

  return (
    <div className="h-64 w-full" aria-label="Expenses by category chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-muted)" tickFormatter={(v) => `$${v}`} />
          <Tooltip
            formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']}
            contentStyle={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border-default)', borderRadius: '8px', fontSize: '12px' }}
          />
          <Bar dataKey="amount" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
