-- ============================================================
-- PHASE 3 CLOSEOUT: Per-module tutorials (first-access walkthrough)
-- Adds:
--   * user_tutorial_progress table (one row per user/module — tracks
--     whether they've completed or skipped the walkthrough; allows
--     replay via reset).
--   * Seed `module_tutorials` rows for the highest-traffic modules.
--     3-5 steps each, plain English, no SQL, references real UI.
-- ============================================================

create table if not exists user_tutorial_progress (
  user_id uuid references auth.users(id) on delete cascade not null,
  module_id text references modules(id) on delete cascade not null,
  completed_at timestamptz,
  skipped_at timestamptz,
  last_step int default 0,
  updated_at timestamptz default now(),
  primary key (user_id, module_id)
);

alter table user_tutorial_progress enable row level security;

create policy "user_tutorial_progress_self_read"
  on user_tutorial_progress for select
  using (user_id = auth.uid());

create policy "user_tutorial_progress_self_write"
  on user_tutorial_progress for insert
  with check (user_id = auth.uid());

create policy "user_tutorial_progress_self_update"
  on user_tutorial_progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_tutorial_progress_self_delete"
  on user_tutorial_progress for delete
  using (user_id = auth.uid());

create index if not exists user_tutorial_progress_module_idx
  on user_tutorial_progress(module_id);

-- ============================================================
-- SEED TUTORIAL STEPS
-- Each step has a short title + 2-4 sentence body referencing the
-- actual UI paths. No SQL, no jargon — written for end users.
-- ============================================================

-- Wipe any previous seed data for the modules we're seeding so the
-- migration is idempotent across reruns.
delete from module_tutorials
where module_id in (
  'advance-sheets', 'finances', 'show-day', 'merch', 'ticketing'
);

insert into module_tutorials (module_id, step_number, title, content) values
  -- ADVANCE SHEETS ---------------------------------------------
  ('advance-sheets', 1,
    'Create a tour first',
    'Advance sheets attach to a tour''s shows. From /tours click "New Tour", give it a name and date range, then add each show (date, venue name, city, status).'),
  ('advance-sheets', 2,
    'Generate a public advance link',
    'Open a show and click "Send advance sheet". You''ll get a token-protected URL — paste it into the venue''s reply email. They don''t need an account.'),
  ('advance-sheets', 3,
    'Review the submission',
    'When the venue submits, the show page fills in automatically: load-in time, capacity, dressing rooms, catering, sound, and contacts. Edit anything that looks off.'),
  ('advance-sheets', 4,
    'See it in the itinerary',
    'Open /today (or the show page) — the schedule pulls straight from advance-sheet times. Print or share the daily PDF from there.'),

  -- FINANCES ---------------------------------------------------
  ('finances', 1,
    'Add your first expense',
    'Go to /finances → Expenses → "Add expense". Pick a category, enter the amount, and (optional) snap a receipt — the AI will pre-fill vendor/date/category for you.'),
  ('finances', 2,
    'Tag it tax-deductible',
    'Check "Tax deductible" on any expense that qualifies. The Tax Center (/tax) totals them by category with IRS guidance.'),
  ('finances', 3,
    'Track revenue per show',
    'On a show page, fill in guarantee, ticket sales, and merch revenue. The tour P&L updates in real time.'),
  ('finances', 4,
    'See your cut',
    'Open /me/finances. You see only what you''re owed, what you spent, and what''s tax-deductible — nobody else''s numbers.'),
  ('finances', 5,
    'Export for your CPA',
    'From /finances click "Export CSV" — you''ll get every expense with category, date, deductible flag, and receipt URL.'),

  -- SHOW DAY ---------------------------------------------------
  ('show-day', 1,
    'Open Today',
    'Bookmark /today on your phone. It always shows the current show: schedule, venue address (tap to open in Maps), hotel, contacts, and weather.'),
  ('show-day', 2,
    'Navigate between days',
    'Use the prev/next arrows to look ahead or back. The off-day view shows when there''s no show — handy for routing decisions.'),
  ('show-day', 3,
    'Tap to call or navigate',
    'Every phone number is a tap-to-call link. Every address opens in Google Maps. Times always show the local timezone abbreviation.'),

  -- MERCH ------------------------------------------------------
  ('merch', 1,
    'Add products to your catalog',
    'Open /merch → Products → "Add product". Enter SKU, category, sell price, and cost basis. Cost basis lets the dashboard compute real margins.'),
  ('merch', 2,
    'Stock a tour',
    'On the tour page, set starting inventory per product. The remaining count auto-decrements as you record show sales.'),
  ('merch', 3,
    'Record a show''s sales',
    'After load-out, open the show, click "Record merch sales", and enter how many of each item sold. Inventory and P&L update immediately.'),
  ('merch', 4,
    'Read the P&L',
    '/merch shows revenue, cost, profit, units sold, and top sellers across the whole tour. Use it to decide what to reorder.'),

  -- TICKETING --------------------------------------------------
  ('ticketing', 1,
    'Add a ticket type',
    'Open the show → Tickets → "Add ticket type". Pick General/VIP/Reserved/Comp, set price and quantity (or unlimited), and toggle "Visible on the public buy page".'),
  ('ticketing', 2,
    'Share the buy link',
    'The public buy page is at /shows/<show-id>/tickets. Share that link in emails, on socials, or as a QR poster — no account needed to buy.'),
  ('ticketing', 3,
    'Scan at the door',
    'Open the show → Door scanner. Allow camera, tap "Start camera", and scan QR codes. Green = admit. Orange = already used. Red = forged or wrong show.'),
  ('ticketing', 4,
    'Watch sales in real time',
    'The show''s Tickets tab shows sold/remaining per type. Stripe sends webhooks immediately — counts update without a refresh.');
