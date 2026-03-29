# SWOT Analysis: Supabase (PostgreSQL) vs MongoDB for Tour Manager OS

## Recommendation: Supabase. It is not close.

The data model is fundamentally relational, the team has proven patterns, and Supabase's integrated auth/storage/realtime/RLS eliminates weeks of boilerplate. MongoDB's only advantage (schema flexibility) is handled by PostgreSQL's JSONB columns.

---

## Supabase (PostgreSQL)

### Strengths

**S1. Data model is fundamentally relational.**
`tours -> shows -> advance_sheets -> advance_contacts -> itinerary_days -> schedule_blocks` is a classic relational graph. 8+ tables with foreign keys, join requirements, and integrity constraints. PostgreSQL enforces this at the database level. MongoDB pushes all integrity enforcement into application code.

**S2. Row Level Security is a near-perfect fit.**
The access model has 4 roles:
- **Managers** see all tours they manage
- **Members** see tours they belong to
- **Crew** sees relevant show data
- **Venue contacts** see only the advance sheet form for their show (token-based, no login)

Supabase RLS handles all of this declaratively in SQL. With MongoDB, you'd need middleware-level auth checks in every API route.

**S3. Supabase Realtime is purpose-built for live updates.**
Live schedule changes, collaborative advance sheet editing, real-time announcements — one line: `supabase.channel('tour-123').on('postgres_changes', ...)`. MongoDB Change Streams require a replica set + custom WebSocket relay.

**S4. Integrated auth, storage, and edge functions.**
One dashboard, one SDK, one billing relationship. Auth handles signup/login/magic-links. Storage handles receipts/contracts/photos with the same RLS policies. With MongoDB: NextAuth + S3/Cloudinary + WebSocket server = 3-4 separate services.

**S5. Team expertise and established patterns.**
Contractor-os has 170+ migrations, mature RLS patterns, admin/server/client Supabase wrappers, middleware auth guards, typed `database.types.ts`. Starting with MongoDB means relearning patterns the team already owns.

**S6. Financial queries are SQL's home turf.**
P&L reports, expense aggregations, tax summaries, merch sales by SKU — all native `GROUP BY`, `SUM`, `JOIN`. MongoDB's aggregation pipeline is verbose and harder to debug.

### Weaknesses

**W1. Advance sheet field flexibility.**
Adding a column means a migration. Mitigated by using `JSONB` for flexible metadata (same pattern as contractor-os: `metadata JSONB DEFAULT '{}'`). Structured columns for core fields, JSONB for the long tail.

**W2. Offline sync is not built-in.**
Custom IndexedDB + sync queue + conflict resolution needed. Equally hard with MongoDB unless using Atlas Device Sync (which targets native mobile, not PWAs).

**W3. Free tier limits.**
500MB database, 1GB storage, 2GB bandwidth. Pro plan at $25/month is reasonable for a family band.

**W4. Vendor lock-in to Supabase specifically.**
RLS policies, auth tokens, and realtime are coupled to Supabase's platform. However, the database is standard PostgreSQL (portable). Auth and realtime would need replacement if migrating.

### Opportunities

**O1. PostgREST auto-generates the API.**
No need to write API routes for basic CRUD. Client SDK talks directly to PostgREST, filtered by RLS.

**O2. Full-text search for venue/contact lookup.**
PostgreSQL `tsvector` search gives venue search without a separate service (important for the Venue Network vision).

**O3. Views and functions for complex reports.**
Tax summaries, per-state income, tour P&L as SQL views queried directly by the frontend.

**O4. Database branching for development.**
Supabase branching for preview deployments matches the feature-branch Git workflow.

### Threats

**T1. Offline sync complexity.**
Hardest technical challenge regardless of database. Must be architected well early to avoid tech debt.

**T2. Advance sheet schema evolution.**
If venues need radically different form layouts (festival vs. club), a rigid schema could slow things down. Mitigation: `form_template` JSONB for schema definition, `responses` JSONB for answers.

---

## MongoDB

### Strengths

**S1. Document shape matches some data naturally.**
An advance sheet is conceptually a "document" — a bag of fields. Itinerary days with nested schedule blocks fit the document model.

**S2. Flexible schema for evolving forms.**
Adding fields requires no migrations.

**S3. Atlas Search is powerful.**
Lucene-powered full-text search out of the box if venue search becomes primary.

### Weaknesses

**W1. Data model screams relational.**
Tours -> members -> shows -> expenses -> settlements is a web of foreign keys. MongoDB: denormalize (data duplication, inconsistency risk) or use `$lookup` (slow, awkward joins).

**W2. No Row Level Security.**
Every API route needs manual authorization checks. Every new route is a potential authorization bypass.

**W3. No integrated auth, storage, or realtime.**
Need NextAuth + S3/Cloudinary + WebSocket server. 3-4 additional services to configure and maintain.

**W4. Financial reporting is painful.**
"Total expenses by category for tour X, grouped by tax-deductible status, with per-member subtotals" = 30+ lines of aggregation pipeline vs. 5-line SQL query.

**W5. No existing team patterns.**
Only flashlearn-ai uses MongoDB with raw MongoClient + Mongoose. Boilerplate-heavy compared to Supabase.

**W6. Higher pricing.**
Atlas M10 starts at $57/month and doesn't include auth/storage/realtime. Supabase Pro at $25/month includes everything.

### Opportunities

**O1. Atlas Device Sync for offline.**
Turnkey offline-sync, but targets React Native / mobile apps, not Next.js PWAs. Would not help here.

**O2. Schemaless advance sheets.**
Advantage only if advance sheets were truly unpredictable freeform documents. They are not — the Excel file proves a defined structure.

### Threats

**T1. Data integrity is your responsibility.**
No FK constraints means orphaned records are bugs you prevent in code. PostgreSQL prevents them automatically.

**T2. Context switching.**
All sibling projects use Supabase. Maintaining two database paradigms = cognitive overhead.

---

## Head-to-Head on Key Requirements

| Requirement | Supabase | MongoDB | Winner |
|---|---|---|---|
| Data relationships (tours/shows/members) | Native FKs, JOINs, cascading deletes | `$lookup`, no FK enforcement | **Supabase** by wide margin |
| Offline/sync | Custom IndexedDB + sync queue | Same (Atlas Device Sync doesn't fit PWAs) | **Tie** |
| Real-time updates | Built-in Realtime with RLS filtering | Change Streams + custom WebSocket | **Supabase** |
| Auth & role-based access | Supabase Auth + declarative RLS | NextAuth + per-route middleware | **Supabase** |
| CSV import/export | `COPY` command, SQL + `.csv()` export | `mongoimport`/`mongoexport` | **Supabase** slightly |
| PDF generation | SQL JOINs assemble data cleanly | Multiple queries or `$lookup` pipelines | **Supabase** slightly |
| File storage | Supabase Storage with RLS, same SDK | Separate S3/Cloudinary service | **Supabase** |
| Cost | Free tier → $25/mo Pro (all-inclusive) | Free tier → $57/mo+ (DB only) | **Supabase** |
| Next.js App Router DX | `@supabase/ssr`, server components, proven | Raw MongoClient, no integration story | **Supabase** |
| Team expertise | 2 mature projects, 170+ migrations | 1 project with basic setup | **Supabase** |

---

## Handling Flexibility Within Supabase

For advance sheet evolution, use this pattern:

```sql
-- Core structured fields
venue_type TEXT,
capacity INT,
stage_width NUMERIC,
stage_depth NUMERIC,
-- Flexible overflow for venue-specific fields
metadata JSONB DEFAULT '{}'
```

This gives relational integrity with document flexibility — best of both worlds.
