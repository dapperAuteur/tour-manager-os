'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ModuleChartProps {
  data: { name: string; count: number }[]
}

const COLORS = ['#5b72f5', '#22c55e', '#f59e0b', '#ef4444', '#6b7280', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16']

export function ModuleChart({ data }: ModuleChartProps) {
  if (data.length === 0) return null

  return (
    <div className="h-64 w-full" aria-label="Module adoption chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="name">
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [Number(value), 'Users']}
            contentStyle={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border-default)', borderRadius: '8px', fontSize: '12px' }}
          />
          <Legend fontSize={11} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
