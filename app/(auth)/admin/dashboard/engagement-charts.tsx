'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const TOKEN = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  muted: '#94a3b8',
  purple: '#8b5cf6',
  pink: '#ec4899',
  teal: '#14b8a6',
}
const PIE_COLORS = [
  TOKEN.primary,
  TOKEN.success,
  TOKEN.warning,
  TOKEN.purple,
  TOKEN.pink,
  TOKEN.teal,
  TOKEN.error,
  TOKEN.muted,
]

export function ModuleAdoptionBar({
  data,
}: {
  data: { moduleName: string; adoptionPercent: number; activeMembers: number }[]
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">
        Module adoption
      </h2>
      <p className="mb-4 text-xs text-text-muted">
        % of orgs with each module enabled and the count of members
        actively opted in.
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 16, left: -8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.2)" />
            <XAxis
              dataKey="moduleName"
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              interval={0}
              angle={-30}
              textAnchor="end"
              height={70}
              className="text-text-muted"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              width={36}
              className="text-text-muted"
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-raised, #fff)',
                border: '1px solid rgba(120,120,120,0.3)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="adoptionPercent" name="Org adoption (%)" fill={TOKEN.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="activeMembers" name="Active members" fill={TOKEN.success} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function UserTypePie({
  data,
}: {
  data: { name: string; value: number }[]
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">
        User types
      </h2>
      <p className="mb-4 text-xs text-text-muted">
        Distribution of profile user_type across the platform.
      </p>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-raised, #fff)',
                border: '1px solid rgba(120,120,120,0.3)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={2}
              label={(entry) => `${entry.name} (${entry.value})`}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function DauTrend({
  data,
}: {
  data: { date: string; dau: number }[]
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-raised p-5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">
        Daily active users (30 days)
      </h2>
      <p className="mb-4 text-xs text-text-muted">
        Distinct users with at least one logged action that day.
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.2)" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => {
                const date = new Date(d as string)
                return `${date.getMonth() + 1}/${date.getDate()}`
              }}
              tick={{ fontSize: 10 }}
              stroke="currentColor"
              className="text-text-muted"
              interval={3}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11 }}
              stroke="currentColor"
              width={32}
              className="text-text-muted"
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
            <Bar dataKey="dau" name="DAU" fill={TOKEN.warning} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
