-- ============================================================
-- STATE INCOME RECORDS
-- Musicians owe taxes in every state they perform.
-- Auto-populated from show data + revenue.
-- ============================================================
create table state_income (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tour_id uuid references tours(id) on delete cascade not null,
  show_id uuid references shows(id) on delete set null,
  state text not null,
  country text default 'US',
  performance_date date not null,
  gross_income numeric(12,2) not null default 0,
  venue_name text,
  city text,
  notes text,
  tax_year int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index state_income_user_id_idx on state_income(user_id);
create index state_income_tax_year_idx on state_income(tax_year);
create index state_income_state_idx on state_income(state);

create trigger state_income_updated_at
  before update on state_income
  for each row execute function extensions.moddatetime(updated_at);

alter table state_income enable row level security;

create policy "state_income_own_select"
  on state_income for select
  using (user_id = auth.uid());

create policy "state_income_own_insert"
  on state_income for insert
  with check (user_id = auth.uid());

create policy "state_income_own_update"
  on state_income for update
  using (user_id = auth.uid());

-- ============================================================
-- DEDUCTION CATEGORIES
-- Common musician deductions with IRS guidance.
-- ============================================================
create table deduction_categories (
  id text primary key,
  name text not null,
  description text,
  irs_guidance text,
  sort_order int default 0
);

alter table deduction_categories enable row level security;

create policy "deduction_categories_public_read"
  on deduction_categories for select
  using (true);

-- Seed standard musician deductions
INSERT INTO deduction_categories (id, name, description, irs_guidance, sort_order) VALUES
  ('travel', 'Travel', 'Airfare, bus/van rental, gas, tolls, parking', 'Deductible when traveling away from your tax home for business purposes.', 1),
  ('lodging', 'Lodging', 'Hotels, short-term rentals while on tour', 'Deductible when traveling away from your tax home overnight.', 2),
  ('per_diem', 'Per Diem / Meals', 'Daily meal allowances while touring', 'Per diem rates set by IRS. Currently 50% deductible for meals.', 3),
  ('equipment', 'Equipment & Instruments', 'Instruments, amps, cables, in-ear monitors', 'Deductible as business equipment. Items over $2,500 may need depreciation.', 4),
  ('supplies', 'Supplies & Consumables', 'Strings, drumsticks, picks, batteries, tape', 'Fully deductible business supplies.', 5),
  ('wardrobe', 'Stage Wardrobe', 'Costumes and stage clothing not suitable for everyday wear', 'Deductible only if not suitable for everyday use and actually used for performances.', 6),
  ('merch', 'Merch Production', 'T-shirts, vinyl, posters, CDs, packaging', 'Cost of goods sold — deductible as business expense.', 7),
  ('marketing', 'Marketing & Promotion', 'Ads, website, social media, press photos', 'Fully deductible business marketing expenses.', 8),
  ('insurance', 'Insurance', 'Equipment insurance, liability insurance, health insurance', 'Business insurance is deductible. Self-employed health insurance may be deductible.', 9),
  ('commission', 'Agent/Manager Commission', 'Booking agent, manager, lawyer fees', 'Fully deductible as business professional services.', 10),
  ('education', 'Education & Training', 'Lessons, workshops, masterclasses, books', 'Deductible if it maintains or improves skills in your current profession.', 11),
  ('home_studio', 'Home Studio', 'Rent, utilities, internet for dedicated studio space', 'Home office deduction applies if space is used regularly and exclusively for business.', 12),
  ('union_dues', 'Union Dues', 'AFM, SAG-AFTRA, or other union memberships', 'Fully deductible for self-employed musicians.', 13),
  ('phone_internet', 'Phone & Internet', 'Cell phone and internet used for business', 'Deductible for the business-use percentage.', 14),
  ('vehicle', 'Vehicle / Mileage', 'Personal vehicle used for local gigs, rehearsals', 'Standard mileage rate or actual expenses for business use portion.', 15);

-- ============================================================
-- PER DIEM TRACKING
-- Track daily per diem against IRS rates.
-- ============================================================
create table per_diem_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tour_id uuid references tours(id) on delete cascade not null,
  date date not null,
  city text,
  state text,
  rate numeric(10,2) not null default 50.00,
  received boolean default false,
  received_amount numeric(10,2),
  notes text,
  tax_year int not null,
  created_at timestamptz default now(),
  unique(user_id, tour_id, date)
);

create index per_diem_log_user_idx on per_diem_log(user_id);
create index per_diem_log_tax_year_idx on per_diem_log(tax_year);

alter table per_diem_log enable row level security;

create policy "per_diem_log_own_select"
  on per_diem_log for select
  using (user_id = auth.uid());

create policy "per_diem_log_own_insert"
  on per_diem_log for insert
  with check (user_id = auth.uid());

create policy "per_diem_log_own_update"
  on per_diem_log for update
  using (user_id = auth.uid());
