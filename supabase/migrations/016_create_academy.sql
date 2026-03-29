-- ============================================================
-- COURSES
-- ============================================================
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  thumbnail_url text,
  category text not null,
  difficulty text default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_minutes int,
  sort_order int default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index courses_slug_idx on courses(slug);
create index courses_category_idx on courses(category);

create trigger courses_updated_at
  before update on courses
  for each row execute function extensions.moddatetime(updated_at);

alter table courses enable row level security;

create policy "courses_public_read"
  on courses for select
  using (published = true);

-- ============================================================
-- LESSONS
-- ============================================================
create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade not null,
  title text not null,
  slug text not null,
  content text not null,
  video_url text,
  sort_order int default 0,
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(course_id, slug)
);

create index lessons_course_id_idx on lessons(course_id);

create trigger lessons_updated_at
  before update on lessons
  for each row execute function extensions.moddatetime(updated_at);

alter table lessons enable row level security;

create policy "lessons_public_read"
  on lessons for select
  using (published = true);

-- ============================================================
-- LESSON QUIZZES
-- ============================================================
create table lesson_quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references lessons(id) on delete cascade not null,
  question text not null,
  options jsonb not null,  -- ["Option A", "Option B", ...]
  correct_answer int not null,  -- index into options array
  explanation text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index lesson_quizzes_lesson_id_idx on lesson_quizzes(lesson_id);

alter table lesson_quizzes enable row level security;

create policy "lesson_quizzes_public_read"
  on lesson_quizzes for select
  using (true);

-- ============================================================
-- USER COURSE PROGRESS
-- ============================================================
create table user_course_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  unique(user_id, course_id)
);

create index user_course_progress_user_idx on user_course_progress(user_id);

alter table user_course_progress enable row level security;

create policy "user_course_progress_own"
  on user_course_progress for select
  using (user_id = auth.uid());

create policy "user_course_progress_insert"
  on user_course_progress for insert
  with check (user_id = auth.uid());

create policy "user_course_progress_update"
  on user_course_progress for update
  using (user_id = auth.uid());

-- ============================================================
-- USER LESSON PROGRESS
-- ============================================================
create table user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id uuid references lessons(id) on delete cascade not null,
  completed boolean default false,
  completed_at timestamptz,
  quiz_score int,
  unique(user_id, lesson_id)
);

create index user_lesson_progress_user_idx on user_lesson_progress(user_id);

alter table user_lesson_progress enable row level security;

create policy "user_lesson_progress_own"
  on user_lesson_progress for select
  using (user_id = auth.uid());

create policy "user_lesson_progress_insert"
  on user_lesson_progress for insert
  with check (user_id = auth.uid());

create policy "user_lesson_progress_update"
  on user_lesson_progress for update
  using (user_id = auth.uid());

-- ============================================================
-- SEED COURSES & LESSONS
-- ============================================================

-- Course 1: Getting Started
INSERT INTO courses (id, title, slug, description, category, difficulty, estimated_minutes, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Getting Started with Tour Manager OS', 'getting-started', 'Learn the basics — create your first tour, add shows, and send advance sheets.', 'onboarding', 'beginner', 15, 1);

INSERT INTO lessons (id, course_id, title, slug, content, sort_order) VALUES
  ('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Create Your Organization', 'create-organization', 'Before you can manage tours, you need to create an organization. This represents your band or management entity.

## Steps

1. Click **Modules** in the sidebar
2. You''ll see the "Set Up Your Organization" banner
3. Enter your band/group name and click **Create**
4. Free modules will be automatically enabled

Your organization is the container for all your tours, members, and data.', 1),

  ('50000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Create Your First Tour', 'create-first-tour', 'Now let''s create a tour to organize your shows.

## Steps

1. Go to the **Dashboard**
2. Click **New Tour**
3. Enter the tour name (e.g., "Summer 2026 Tour")
4. Enter your artist/band name
5. Add optional start and end dates
6. Click **Create Tour**

You''ll be taken to your tour detail page where you can add shows.', 2),

  ('50000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'Add Shows and Send Advance Sheets', 'add-shows', 'Each show on your tour gets its own advance sheet — a digital questionnaire for the venue.

## Adding a Show

1. On your tour page, click **Add Show**
2. Enter the date, city, state, and venue name
3. An advance sheet is automatically created

## Sending the Advance Sheet

Each show has an **Advance** link. Copy this link and send it to the venue contact (promoter, production manager, etc). They fill out the form online — no login required.

When the venue submits, the show status changes to "confirmed" and data flows into your itinerary.', 3);

-- Course 2: Tour Finances 101
INSERT INTO courses (id, title, slug, description, category, difficulty, estimated_minutes, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000002', 'Tour Finances 101', 'tour-finances-101', 'Track expenses, revenue, and profit across your tours. Export for tax time.', 'features', 'beginner', 20, 2);

INSERT INTO lessons (id, course_id, title, slug, content, sort_order) VALUES
  ('50000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'Understanding the P&L Dashboard', 'pnl-dashboard', 'The Tour Finances page gives you a real-time view of your tour''s profitability.

## Key Metrics

- **Total Revenue** — Guarantees, ticket sales, and merch from all shows
- **Total Expenses** — Everything you''ve spent on the tour
- **Net Profit** — Revenue minus expenses

## Expenses by Category

Below the summary, you''ll see expenses grouped by category: travel, hotel, per diem, meals, equipment, crew, merch, marketing, insurance, and other.

Click **Finances** on any tour page to access the dashboard.', 1),

  ('50000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Tracking Expenses', 'tracking-expenses', 'Record every expense as it happens — on the bus, at the hotel, or at the venue.

## Adding an Expense

1. Go to your tour''s **Finances** page
2. Click **Add Expense**
3. Enter the date, amount, and category
4. Optionally link it to a specific show
5. Check "Tax deductible" if applicable

## Tax Tips

Mark expenses as tax-deductible as you go. At tax time, export everything as CSV and hand it to your accountant. Categories like travel, hotel, equipment, and per diem are typically deductible for touring musicians.', 2),

  ('50000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'Personal Finance View', 'personal-finances', 'Every member has a personal finance view showing their individual picture.

## My Finances

Click **My Finances** in the sidebar to see:

- **My Expenses** — Total you''ve submitted across all tours
- **Total Paid** — What you''ve been paid
- **Owed to Me** — Outstanding payouts
- **Tax Deductible** — Your deductible total for tax prep

This view works across all tours you belong to.', 3);

-- Course 3: Merch Management
INSERT INTO courses (id, title, slug, description, category, difficulty, estimated_minutes, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000003', 'Merch Management', 'merch-management', 'Set up products, track inventory, record sales, and see your merch P&L.', 'features', 'intermediate', 15, 3);

INSERT INTO lessons (id, course_id, title, slug, content, sort_order) VALUES
  ('50000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'Setting Up Products', 'setting-up-products', 'Add your merch catalog before the tour starts.

## Adding a Product

1. Go to **Merch** in the sidebar
2. Click **Add Product**
3. Enter: name, description, SKU, category, price, and cost per unit
4. Categories: apparel, vinyl, CD, poster, accessory, bundle, other

## Cost Basis

Enter your cost per unit so the merch P&L can calculate profit. For example, if a t-shirt costs $8.50 to make and sells for $35, the system tracks the $26.50 profit per unit.', 1),

  ('50000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000003', 'Recording Sales at Shows', 'recording-sales', 'Log merch sales as they happen at each show.

## Recording a Sale

1. Click **Record Sale** on the Merch page
2. Select the product
3. Select the show (or leave blank for online sales)
4. Enter quantity — price auto-fills from the product
5. Submit

Inventory updates automatically. The merch dashboard shows revenue, cost, profit, and top sellers.', 2);

-- Quiz for Getting Started course
INSERT INTO lesson_quizzes (lesson_id, question, options, correct_answer, explanation) VALUES
  ('50000000-0000-0000-0000-000000000001', 'What do you need to create before managing tours?', '["A tour", "An organization", "A show", "An advance sheet"]', 1, 'You need to create an organization first — it represents your band or management entity.'),
  ('50000000-0000-0000-0000-000000000003', 'Do venue contacts need a login to fill out the advance sheet?', '["Yes, they need to create an account", "No, they use a shared link", "Yes, but only a password", "No, but they need the app"]', 1, 'Venue contacts receive a unique link and fill out the form without any login.');
