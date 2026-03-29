-- ============================================================
-- FEEDBACK THREADS
-- Conversational feedback between users and admin.
-- ============================================================
create table feedback_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  org_id uuid references organizations(id) on delete set null,
  subject text not null,
  category text not null check (category in ('bug', 'feature', 'question', 'praise', 'other')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index feedback_threads_user_id_idx on feedback_threads(user_id);
create index feedback_threads_status_idx on feedback_threads(status);

create trigger feedback_threads_updated_at
  before update on feedback_threads
  for each row execute function extensions.moddatetime(updated_at);

alter table feedback_threads enable row level security;

-- Users can see their own threads
create policy "feedback_threads_own_select"
  on feedback_threads for select
  using (user_id = auth.uid());

-- Users can create threads
create policy "feedback_threads_insert"
  on feedback_threads for insert
  with check (user_id = auth.uid());

-- Users can update their own open threads
create policy "feedback_threads_own_update"
  on feedback_threads for update
  using (user_id = auth.uid());

-- ============================================================
-- FEEDBACK MESSAGES
-- Individual messages within a thread.
-- ============================================================
create table feedback_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references feedback_threads(id) on delete cascade not null,
  sender_id uuid references auth.users(id) on delete set null,
  sender_role text not null default 'user' check (sender_role in ('user', 'admin')),
  content text not null,
  attachments jsonb default '[]',
  created_at timestamptz default now()
);

create index feedback_messages_thread_id_idx on feedback_messages(thread_id);

alter table feedback_messages enable row level security;

-- Users can see messages in their own threads
create policy "feedback_messages_own_select"
  on feedback_messages for select
  using (
    thread_id in (select id from feedback_threads where user_id = auth.uid())
  );

-- Users can add messages to their own threads
create policy "feedback_messages_insert"
  on feedback_messages for insert
  with check (
    sender_id = auth.uid() and
    thread_id in (select id from feedback_threads where user_id = auth.uid())
  );

-- ============================================================
-- FEEDBACK NOTIFICATIONS
-- ============================================================
create table feedback_notifications (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references feedback_threads(id) on delete cascade not null,
  recipient_id uuid references auth.users(id) on delete cascade not null,
  read boolean default false,
  created_at timestamptz default now()
);

create index feedback_notifications_recipient_idx on feedback_notifications(recipient_id);

alter table feedback_notifications enable row level security;

create policy "feedback_notifications_own"
  on feedback_notifications for select
  using (recipient_id = auth.uid());

create policy "feedback_notifications_update_own"
  on feedback_notifications for update
  using (recipient_id = auth.uid());

-- ============================================================
-- HELP ARTICLES
-- Static help content searchable by users.
-- ============================================================
create table help_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  category text not null,
  module_id text references modules(id) on delete set null,
  tags text[] default '{}',
  published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index help_articles_slug_idx on help_articles(slug);
create index help_articles_category_idx on help_articles(category);
create index help_articles_module_id_idx on help_articles(module_id);

create trigger help_articles_updated_at
  before update on help_articles
  for each row execute function extensions.moddatetime(updated_at);

alter table help_articles enable row level security;

-- Everyone can read published help articles
create policy "help_articles_public_read"
  on help_articles for select
  using (published = true);

-- ============================================================
-- SEED HELP ARTICLES
-- ============================================================
insert into help_articles (title, slug, content, category, module_id, tags) values
  ('Getting Started with Tour Manager OS', 'getting-started', 'Welcome to Tour Manager OS! This guide will walk you through creating your first tour, adding shows, and sending advance sheets to venues.

## Step 1: Create an Organization
Go to the Modules page and create your organization. This is your band or management entity.

## Step 2: Create a Tour
From the Dashboard, click "New Tour" and fill in your tour name, artist name, and dates.

## Step 3: Add Shows
Open your tour and click "Add Show" for each date. Enter the city, state, venue name, and timezone.

## Step 4: Send Advance Sheets
Each show gets an advance sheet link. Share this link with the venue contact — they fill out the form online.

## Step 5: View Your Itinerary
As venues submit their advance sheets, your daily itinerary builds automatically. Click "View Itinerary" on your tour page.', 'getting-started', null, '{tour,setup,onboarding}'),

  ('How Advance Sheets Work', 'advance-sheets-guide', 'Advance sheets are digital questionnaires sent to venues before each show.

## For Tour Managers
When you add a show, an advance sheet is automatically created with a unique shareable link. Send this link to the venue contact (promoter, production manager, etc).

## For Venue Contacts
You''ll receive a link from the tour manager. Click it to open the advance sheet form. No login required. Fill in:
- Venue details (type, capacity, address)
- Dressing rooms
- Catering and hospitality
- Production specs (stage size, PA, etc)
- Show times (soundcheck, doors, stage time)
- Key contacts
- Sound company info

Once submitted, the tour manager is notified and the data flows into the daily itinerary.', 'features', 'advance-sheets', '{advance,venue,form}'),

  ('Understanding Tour Finances', 'tour-finances-guide', 'Track every dollar on tour — revenue, expenses, and profit.

## Tour P&L Dashboard
Navigate to any tour and click "Finances" to see:
- Total revenue (guarantees, ticket sales, merch)
- Total expenses by category
- Net profit

## Adding Expenses
Click "Add Expense" and select:
- Date and amount
- Category (travel, hotel, per diem, meals, equipment, etc)
- Associated show (optional)
- Tax deductible flag

## Personal Finances
Visit "My Finances" in the sidebar to see:
- Your personal expenses across all tours
- What you''re owed (payouts)
- Tax-deductible totals for tax time

## CSV Export
Click "Export CSV" on the finances page to download all expenses for your accountant.', 'features', 'finances', '{money,expenses,tax,csv}'),

  ('Using the Show Day View', 'show-day-guide', 'The Show Day view is your daily companion on tour.

## Today View
Click "Today" in the sidebar to see your current day:
- Schedule timeline with timezone labels
- Venue info with tap-to-navigate
- Hotel with confirmation number and tap-to-call
- Catering details
- Key contacts
- Next destination

## Day Navigation
Use the left/right arrows to browse between show days.

## Offline Access
The Show Day view is designed to work even with spotty internet. Key data is cached locally.', 'features', 'show-day', '{schedule,today,daily}'),

  ('Managing Merch', 'merch-guide', 'Track your merchandise from inventory to sales.

## Adding Products
Go to Merch → Add Product. Enter:
- Name, SKU, category
- Sale price and cost per unit (for profit tracking)

## Recording Sales
Click "Record Sale" to log merch sold at a show:
- Select the product and show
- Enter quantity (price auto-fills)
- Inventory updates automatically

## Merch P&L
The Merch dashboard shows:
- Total revenue, cost, and profit
- Units sold
- Top sellers by revenue', 'features', 'merch', '{merch,inventory,sales}'),

  ('Polls and Group Decisions', 'polls-guide', 'Use polls to get input from the whole group.

## Creating a Poll
Go to Family Hub → Polls → New Poll:
- Write your question
- Add options (minimum 2)
- Choose single or multi-select
- Set an optional closing time

## Voting
Click an option to vote. Results show as progress bars with percentages. Everyone can see who voted for what.

## Closing a Poll
The poll creator can close voting at any time.', 'features', null, '{polls,voting,decisions}'),

  ('Keyboard Shortcuts and Accessibility', 'accessibility', 'Tour Manager OS is built to be accessible to everyone.

## Keyboard Navigation
- Tab to move between interactive elements
- Enter or Space to activate buttons and links
- Escape to close modals and menus

## Screen Readers
All interactive elements have proper ARIA labels. Status changes are announced via live regions.

## Theme
Switch between Light, Dark, and System themes in Settings → Preferences.

## Skip to Main Content
Press Tab on any page to reveal the "Skip to main content" link.', 'general', null, '{a11y,keyboard,screen-reader}');
