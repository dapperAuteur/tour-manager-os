# Code Rules

Architectural rules and constraints for Tour Manager OS. These are non-negotiable guardrails that keep the codebase safe, consistent, and maintainable.

## Security

### Authentication & Authorization

- Every authenticated route must be protected by middleware that validates the Supabase session
- Every database table must have RLS policies — no table should be accessible without a policy
- Never trust client-side role checks alone; always enforce access on the server via RLS or server-side checks
- Venue advance sheet forms use token-based access (UUID in URL), not authentication
- API keys for the public API are hashed before storage (`api_keys.key_hash`)
- Never log or expose secrets, tokens, or API keys in client-side code or error messages

### Password Policy

Enforced both in Supabase (server-side) and in the signup form (client-side):

- Minimum **16 characters**
- Must contain at least one **uppercase letter** (A-Z)
- Must contain at least one **lowercase letter** (a-z)
- Must contain at least one **number** (0-9)
- Must contain at least one **symbol** (!@#$%^&*...)
- No more than **3 repeated characters** in a row (e.g., `aaaa` fails)

The signup form shows a real-time checklist as the user types. The submit button is disabled until all requirements pass.

### OTP Login

- 6-digit numeric code sent to email
- Configured in Supabase Dashboard (Authentication → Providers → Email)
- Code expires in 10 minutes

### Data Protection

- Never store passwords — Supabase Auth handles this
- Sanitize all user input before rendering (XSS prevention)
- Use parameterized queries only — never concatenate user input into SQL
- File uploads must be validated for type and size before storage
- Demo accounts cannot modify seed data in production (read-only demo mode)

### Environment Variables

- Server-only secrets must never be prefixed with `NEXT_PUBLIC_`
- All secrets come from environment variables, never hardcoded
- `.env.local` is gitignored — never commit secrets

## Architecture

### Module Gating

- Every module's pages, API routes, and nav items must check module access before rendering
- Module access is checked via `org_modules` (org-level toggle) AND `member_module_access` (member opt-in)
- If a module is disabled, return 404 for pages and 403 for API routes — do not leak that the module exists
- Cache module access client-side for offline support, but re-validate on reconnect

### Data Flow

```
Browser → Middleware (auth check) → Page/Route (module check) → Supabase (RLS)
```

- Pages fetch data in Server Components via `createClient()` from `lib/supabase/server.ts`
- Mutations go through Server Actions in `lib/<module>/actions.ts`
- Client components subscribe to realtime changes via `lib/supabase/client.ts`
- Admin operations use `lib/supabase/admin.ts` (service role, bypasses RLS)

### Server vs Client

- **Server Components** (default): data fetching, rendering static content, SEO
- **Client Components** (`'use client'`): interactivity, hooks, browser APIs, real-time subscriptions, form state
- Never fetch data in client components if it can be done in a server component and passed as props
- Never import server-only modules (`lib/supabase/server.ts`, `lib/supabase/admin.ts`) in client components

### Database

- Every table must have `created_at timestamptz default now()`
- Every mutable table must have `updated_at timestamptz` with a `moddatetime` trigger
- Every table must have RLS enabled with at least one policy
- Foreign keys must have `on delete cascade` or `on delete set null` — never leave orphaned rows possible
- Use `uuid` for primary keys (Supabase default)
- Use `JSONB` columns for flexible metadata — not for core relational data
- Index foreign key columns and any column used in WHERE clauses

### Offline Support

- Offline-capable features must work without network using IndexedDB
- Writes made offline are queued and synced when connectivity returns
- Conflict resolution strategy: last-write-wins for most data, user-prompt for critical data (financial entries)
- Always show an offline indicator in the UI when the app detects no connectivity
- Cached data must be encrypted at rest if it contains sensitive information (financial data, personal info)

## Quality

### No Dead Code

- Do not leave commented-out code in the codebase
- Do not leave unused imports, variables, or functions
- Do not leave `TODO` comments without a linked issue or task

### No Console Logs

- Remove all `console.log` statements before committing
- Use a proper logging utility for server-side logging if needed
- `console.error` is acceptable in error boundaries and catch blocks

### Type Safety

- No `any` type — use `unknown` and type narrow, or define proper types
- No type assertions (`as`) unless absolutely necessary with a comment explaining why
- Generated Supabase types (`database.types.ts`) are the source of truth for database shapes
- Re-run `npm run db:types` after every migration

### Testing

- Business logic and data transformations must have unit tests
- Module access checks must have integration tests
- Critical user flows (advance sheet submission, demo login, expense entry) must have end-to-end tests
- Accessibility must be tested with axe-core in automated tests

## Performance

### Bundle Size

- No heavy libraries for things that can be done with native APIs or lightweight alternatives
- Lazy load modules that are behind feature gates (dynamic imports)
- Images must use Next.js `<Image>` component with proper `width`, `height`, and `sizes`

### Data Fetching

- Use Supabase's `select` to fetch only the columns you need — no `select('*')` unless you genuinely need every column
- Paginate lists — never load unbounded data
- Use Supabase Realtime subscriptions instead of polling

### Rendering

- Use Server Components for data-heavy pages to reduce client-side JavaScript
- Use `loading.tsx` for route-level suspense boundaries
- Use `React.Suspense` for component-level loading states

## Accessibility (Enforcement)

These are enforced, not optional:

- Every `<img>` must have an `alt` attribute
- Every icon-only button must have `aria-label` or a visually hidden text label
- Every form input must have an associated `<label>`
- Every modal/dialog must trap focus and return focus on close
- Every page must have exactly one `<h1>`
- Color must never be the only means of conveying information
- All interactive elements must be reachable via keyboard (Tab, Enter, Escape, Arrow keys where appropriate)
- Focus indicators must be visible in both light and dark modes
- Minimum touch target size: 44x44px on mobile

## Git

- Never commit directly to `main`
- Never force push to `main`
- Never commit `.env` files, secrets, or credentials
- Never commit `node_modules/`
- Every commit must pass linting and type checking
- Feature branches are deleted after merge
