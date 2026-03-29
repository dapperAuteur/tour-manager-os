# Contributing to Tour Manager OS

Thank you for your interest in contributing. This document explains how we work and how you can participate effectively.

## Getting Started

1. Read the [README](README.md) for project overview and setup
2. Read the [Style Guide](STYLE_GUIDE.md) for code conventions
3. Read the [Code Rules](CODE_RULES.md) for architectural constraints
4. Read the [Code of Conduct](CODE_OF_CONDUCT.md) for community standards

## Development Workflow

### Branch Strategy

Every piece of work gets its own feature branch:

```
main                        # Production-ready code
├── foundation/project-docs # Example: foundation documents
├── feature/advance-sheets  # Example: new module
├── fix/timezone-display    # Example: bug fix
└── chore/update-deps       # Example: maintenance
```

**Branch naming convention:**
- `feature/<name>` — New features or modules
- `fix/<name>` — Bug fixes
- `chore/<name>` — Maintenance, dependencies, CI
- `docs/<name>` — Documentation changes
- `foundation/<name>` — Project scaffolding

### Commit Practices

**Small, atomic commits.** Each commit should be a single logical change that could be reverted independently without breaking anything.

**Commit message format:**
```
<type>: <short description>

<optional body explaining why, not what>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat: add advance sheet venue form with ARIA labels
fix: convert schedule times to user's local timezone
docs: add module system section to contributing guide
refactor: extract module access check into middleware
test: add integration tests for advance sheet submission
chore: update Supabase client to v2.49
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make small, incremental commits
3. Ensure all tests pass and linting is clean
4. Write a clear PR description explaining **what** and **why**
5. Request review
6. Address feedback
7. Squash and merge when approved

**PR description template:**
```markdown
## What
Brief description of the change.

## Why
What problem does this solve or what feature does this enable?

## How to Test
Steps to verify the change works correctly.

## Screenshots
If UI changes, include before/after screenshots.

## Checklist
- [ ] Accessible (ARIA labels, keyboard nav, screen reader tested)
- [ ] Responsive (tested on mobile viewport)
- [ ] Offline-capable (works without network if applicable)
- [ ] Light/dark mode verified
- [ ] Types are correct (no `any`)
- [ ] No console.log left behind
```

## Architecture Guidelines

### Module System

Every major feature is a **module**. When building a new module:

1. Register it in the `modules` table (migration)
2. Create the module's pages under the appropriate route group
3. Add module access checks in middleware and components
4. Create a 3-5 step tutorial for first-time users
5. Add the module to the nav component's module filter
6. Create a landing page at `/features/<module-slug>`

### File Organization

```
# New module example: "merch"
app/(auth)/merch/
├── page.tsx              # Module index page
├── inventory/
│   └── page.tsx          # Inventory management
├── sales/
│   └── page.tsx          # Sales tracking
└── store/
    └── page.tsx          # Online store settings

components/modules/merch/
├── inventory-table.tsx   # Module-specific components
├── sale-entry-form.tsx
└── merch-stats-card.tsx

lib/merch/
├── actions.ts            # Server actions
├── queries.ts            # Database queries
└── types.ts              # TypeScript types
```

### Database Changes

- Every schema change is a numbered migration in `supabase/migrations/`
- Migration naming: `XXX_description.sql` (e.g., `001_create_tours.sql`)
- Always include RLS policies in the same migration as the table
- Always update `supabase/seed.sql` with demo data for new tables
- Run `npm run db:types` after migrations to regenerate TypeScript types

### Accessibility Requirements

Every component and page must meet WCAG 2.1 AA:

- Semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<button>`, not `<div onClick>`)
- ARIA labels on interactive elements and icons
- Keyboard navigation (tab order, focus management, escape to close)
- Color contrast ratio of at least 4.5:1 for normal text, 3:1 for large text
- Focus indicators visible in both light and dark modes
- Form inputs have associated `<label>` elements
- Error messages are announced to screen readers via `aria-live`
- Images have alt text; decorative images use `alt=""`

### Offline Support

When adding a feature that should work offline:

1. Identify which data the feature needs
2. Add IndexedDB caching in `lib/offline/`
3. Implement optimistic local writes
4. Queue mutations for background sync
5. Handle sync conflicts (last-write-wins or user prompt)
6. Test by disabling network in DevTools

## Testing

- Write tests for business logic and data transformations
- Test accessibility with automated tools (axe-core) and manual screen reader testing
- Test offline behavior by disabling network
- Test both light and dark modes
- Test on mobile viewports (375px width minimum)

## Reporting Issues

- Use the in-app feedback tool for user-facing issues
- Use GitHub Issues for code-level bugs and feature requests
- Include steps to reproduce, expected behavior, and actual behavior
- Include browser/device info for UI issues

## Questions

If something in this guide is unclear, open an issue or use the feedback tool. We'd rather answer a question than review a PR that went in the wrong direction.
