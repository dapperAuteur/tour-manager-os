# Style Guide

Code conventions and patterns for Tour Manager OS. Follow these to keep the codebase consistent and reviewable.

## TypeScript

### General Rules

- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` — use `unknown` and narrow, or define a proper type
- No non-null assertions (`!`) — handle the null case
- Prefer `interface` for object shapes, `type` for unions and intersections
- Export types from the module that owns them (e.g., `lib/merch/types.ts`)

### Naming

```typescript
// PascalCase: components, interfaces, types, enums
interface TourMember { ... }
type ShowStatus = 'draft' | 'advance_sent' | 'confirmed'
function AdvanceSheetForm() { ... }

// camelCase: variables, functions, props, hooks
const tourMembers = await getTourMembers(tourId)
function calculateTourPnL(tourId: string) { ... }
const [isLoading, setIsLoading] = useState(false)

// SCREAMING_SNAKE_CASE: constants
const MAX_FILE_SIZE_MB = 10
const DEFAULT_PER_DIEM = 50

// snake_case: database columns (matches Supabase/Postgres convention)
// Use camelCase in TypeScript, snake_case only in SQL and raw queries
```

### File Naming

```
# Components: kebab-case matching the component name
advance-sheet-form.tsx    → export function AdvanceSheetForm()
tour-stats-card.tsx       → export function TourStatsCard()

# Utilities and libs: kebab-case
module-access.ts
pdf-templates.ts

# Pages: page.tsx (Next.js convention)
app/(auth)/tours/[id]/page.tsx

# Types: types.ts within the feature directory
lib/merch/types.ts
```

## React / Next.js

### Component Structure

```typescript
// 1. Imports (external, then internal, then types)
import { useState } from 'react'
import { MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getVenueDetails } from '@/lib/venues/queries'

import type { Venue } from '@/lib/venues/types'

// 2. Types (if component-specific, otherwise import)
interface VenueCardProps {
  venue: Venue
  onSelect?: (venueId: string) => void
}

// 3. Component (named export, not default)
export function VenueCard({ venue, onSelect }: VenueCardProps) {
  // hooks first
  const [isExpanded, setIsExpanded] = useState(false)

  // handlers
  function handleSelect() {
    onSelect?.(venue.id)
  }

  // render
  return (
    <article
      className="rounded-lg border p-4 dark:border-neutral-700"
      aria-label={`Venue: ${venue.name}`}
    >
      {/* ... */}
    </article>
  )
}
```

### Rules

- Named exports only — no `export default`
- Server Components by default. Add `'use client'` only when you need interactivity, hooks, or browser APIs
- Co-locate server actions in `lib/<module>/actions.ts`, not inline in components
- Use `loading.tsx` and `error.tsx` for route-level loading and error states
- Prefer server-side data fetching in page components, pass data down as props

### Import Aliases

```typescript
// Use @ alias for project root
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

// Never use relative paths that go up more than one level
// Bad:  import { Button } from '../../../components/ui/button'
// Good: import { Button } from '@/components/ui/button'
```

## Tailwind CSS

### Class Ordering

Follow this order within `className`:

1. Layout (`flex`, `grid`, `block`, `hidden`)
2. Position (`relative`, `absolute`, `sticky`)
3. Sizing (`w-full`, `h-12`, `max-w-md`)
4. Spacing (`p-4`, `mx-auto`, `gap-3`)
5. Typography (`text-sm`, `font-medium`, `leading-relaxed`)
6. Colors (`text-neutral-900`, `bg-white`)
7. Borders (`border`, `rounded-lg`)
8. Effects (`shadow-sm`, `opacity-50`)
9. Transitions (`transition-colors`, `duration-200`)
10. Dark mode (`dark:bg-neutral-900`, `dark:text-white`)
11. Responsive (`sm:`, `md:`, `lg:`)
12. States (`hover:`, `focus:`, `active:`, `disabled:`)

### Color System

Use neutral tones as the base. Define semantic colors in Tailwind config:

```
text-primary     / dark:text-primary
text-secondary   / dark:text-secondary
bg-surface       / dark:bg-surface
bg-surface-alt   / dark:bg-surface-alt
border-default   / dark:border-default
accent-*         / dark:accent-*
success-*
warning-*
error-*
```

### Dark Mode

- Always provide dark variants for backgrounds, text, and borders
- Test every component in both modes
- Use `dark:` variant, not conditional classes
- System preference detected via `prefers-color-scheme`, overridable by user setting

### Responsive Breakpoints

Design mobile-first. Add breakpoints to scale up:

```
default (mobile)  → 0px+
sm                → 640px+
md                → 768px+
lg                → 1024px+
xl                → 1280px+
```

Touch targets: minimum 44x44px on mobile.

## Supabase / Database

### Migration Files

```sql
-- supabase/migrations/001_create_tours.sql

-- Table
create table tours (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  artist_name text not null,
  start_date date,
  end_date date,
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index tours_created_by_idx on tours(created_by);

-- RLS
alter table tours enable row level security;

create policy "tour_members_read"
  on tours for select
  using (
    id in (
      select tour_id from tour_members
      where user_id = auth.uid()
    )
  );

create policy "tour_managers_write"
  on tours for all
  using (
    id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

-- Updated_at trigger
create trigger tours_updated_at
  before update on tours
  for each row execute function moddatetime(updated_at);
```

### Query Patterns

```typescript
// lib/tours/queries.ts — server-side queries
import { createClient } from '@/lib/supabase/server'

export async function getTour(tourId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tours')
    .select('*, tour_members(*), shows(*)')
    .eq('id', tourId)
    .single()

  if (error) throw error
  return data
}
```

### Naming Conventions

- Tables: plural snake_case (`tours`, `tour_members`, `advance_sheets`)
- Columns: snake_case (`created_at`, `tour_id`, `stage_width`)
- Foreign keys: `<referenced_table_singular>_id` (`tour_id`, `show_id`, `member_id`)
- RLS policies: `<table>_<role>_<action>` (`tours_members_read`, `shows_managers_write`)
- Migrations: `NNN_description.sql` (`001_create_tours.sql`, `002_create_shows.sql`)

## Accessibility Patterns

### Interactive Elements

```tsx
// Buttons — always use <button>, never <div onClick>
<button
  type="button"
  onClick={handleAction}
  aria-label="Delete show"       // when text isn't descriptive enough
  disabled={isLoading}
  className="... focus:ring-2 focus:ring-offset-2"
>
  <Trash2 className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Delete show</span>  {/* or visible text */}
</button>

// Links — use Next.js <Link> for navigation
<Link href={`/tours/${tour.id}`} aria-label={`View tour: ${tour.name}`}>
  {tour.name}
</Link>

// Forms — always associate labels
<div>
  <label htmlFor="venue-name" className="...">Venue Name</label>
  <input
    id="venue-name"
    type="text"
    required
    aria-required="true"
    aria-describedby="venue-name-error"
  />
  {error && (
    <p id="venue-name-error" role="alert" className="text-error-600">
      {error}
    </p>
  )}
</div>
```

### Live Regions

```tsx
// Announce dynamic changes to screen readers
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {statusMessage}
</div>
```

### Focus Management

```typescript
// After modal open, focus the first interactive element
// After modal close, return focus to the trigger
// After route change, focus the main heading
```

## PDF Templates

Use `@react-pdf/renderer` with consistent styling:

- Match the existing itinerary template layout (reference: `Itinerarry Template 030211.jpg`)
- Include tour/show branding (artist name, logo)
- Use consistent fonts and spacing
- Export function naming: `generate<DocumentType>Pdf` (e.g., `generateItineraryPdf`)

## Error Handling

- Server actions: return `{ error: string }` or `{ data: T }` — never throw to the client
- API routes: return appropriate HTTP status codes with `{ error: string }` body
- Client components: use error boundaries and `error.tsx` for unexpected errors
- Form validation: validate client-side for UX, server-side for security
- Network errors: show offline indicator and queue for retry

## Environment Variables

```
# Prefix with NEXT_PUBLIC_ only if needed in the browser
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only (no prefix)
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
STRIPE_SECRET_KEY=
GEMINI_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
