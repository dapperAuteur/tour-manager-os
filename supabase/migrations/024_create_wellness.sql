-- ============================================================
-- DAILY WELLNESS LOG
-- Track sleep, energy, mood, hydration for touring musicians.
-- ============================================================
create table wellness_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  show_id uuid references shows(id) on delete set null,

  -- Sleep
  sleep_hours numeric(4,1),
  sleep_quality int check (sleep_quality between 1 and 5),
  timezone_from text,
  timezone_to text,

  -- Energy & Mood
  energy_level int check (energy_level between 1 and 5),
  mood int check (mood between 1 and 5),
  stress_level int check (stress_level between 1 and 5),

  -- Physical
  hydration_glasses int,
  meals_eaten int,
  exercised boolean default false,
  warmup_completed boolean default false,

  -- Performance
  performance_rating int check (performance_rating between 1 and 5),
  voice_condition int check (voice_condition between 1 and 5),

  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date)
);

create index wellness_logs_user_id_idx on wellness_logs(user_id);
create index wellness_logs_date_idx on wellness_logs(date);

create trigger wellness_logs_updated_at
  before update on wellness_logs
  for each row execute function extensions.moddatetime(updated_at);

alter table wellness_logs enable row level security;

create policy "wellness_logs_own_select"
  on wellness_logs for select
  using (user_id = auth.uid());

create policy "wellness_logs_own_insert"
  on wellness_logs for insert
  with check (user_id = auth.uid());

create policy "wellness_logs_own_update"
  on wellness_logs for update
  using (user_id = auth.uid());

-- ============================================================
-- WARMUP ROUTINES
-- Pre-show vocal and physical warmups.
-- ============================================================
create table warmup_routines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  routine_type text not null check (routine_type in ('vocal', 'physical', 'breathing', 'stretching', 'combined')),
  duration_minutes int,
  steps jsonb default '[]',  -- [{title, description, duration_seconds}]
  difficulty text default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  is_system boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table warmup_routines enable row level security;

create policy "warmup_routines_read"
  on warmup_routines for select
  using (is_system = true or created_by = auth.uid());

create policy "warmup_routines_insert"
  on warmup_routines for insert
  with check (created_by = auth.uid());

-- ============================================================
-- FAMILY CHECK-INS
-- Group wellness check-ins during tour.
-- ============================================================
create table family_checkins (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  prompt text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create index family_checkins_org_id_idx on family_checkins(org_id);

alter table family_checkins enable row level security;

create policy "family_checkins_org_select"
  on family_checkins for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "family_checkins_org_insert"
  on family_checkins for insert
  with check (org_id in (select org_id from org_members where user_id = auth.uid()));

-- ============================================================
-- CHECK-IN RESPONSES
-- ============================================================
create table checkin_responses (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid references family_checkins(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  response text not null,
  mood int check (mood between 1 and 5),
  created_at timestamptz default now(),
  unique(checkin_id, user_id)
);

create index checkin_responses_checkin_id_idx on checkin_responses(checkin_id);

alter table checkin_responses enable row level security;

create policy "checkin_responses_org_select"
  on checkin_responses for select
  using (checkin_id in (select id from family_checkins where org_id in (select org_id from org_members where user_id = auth.uid())));

create policy "checkin_responses_own_insert"
  on checkin_responses for insert
  with check (user_id = auth.uid());

-- ============================================================
-- SEED SYSTEM WARMUP ROUTINES
-- ============================================================
INSERT INTO warmup_routines (title, description, routine_type, duration_minutes, difficulty, is_system, steps) VALUES
  ('Vocal Warmup — Basic', 'Essential vocal warmup for before soundcheck or performance.', 'vocal', 10, 'beginner', true,
   '[{"title":"Lip Trills","description":"Gently blow air through closed lips, sliding up and down your range.","duration_seconds":60},{"title":"Humming Scales","description":"Hum up and down a major scale, feeling the vibration in your face.","duration_seconds":90},{"title":"Vowel Slides","description":"Sing through each vowel (A-E-I-O-U) on a comfortable pitch, sliding up a 5th.","duration_seconds":120},{"title":"Sirens","description":"Slide from your lowest comfortable note to your highest and back, like a siren.","duration_seconds":90},{"title":"Tongue Trills","description":"Roll your tongue while singing scales to release tongue tension.","duration_seconds":60},{"title":"Dynamic Control","description":"Sing a sustained note, gradually getting louder then softer.","duration_seconds":90}]'),

  ('Physical Warmup — Stage Ready', 'Full body warmup for performers before a show.', 'physical', 15, 'beginner', true,
   '[{"title":"Neck Rolls","description":"Slowly roll your neck in circles, 5 times each direction.","duration_seconds":60},{"title":"Shoulder Shrugs","description":"Lift shoulders to ears, hold 3 seconds, release. Repeat 10x.","duration_seconds":60},{"title":"Arm Circles","description":"Large arm circles forward and backward, 10 each.","duration_seconds":60},{"title":"Torso Twists","description":"Feet planted, twist your upper body left and right. 10 each side.","duration_seconds":60},{"title":"Hip Circles","description":"Hands on hips, make large circles. 5 each direction.","duration_seconds":60},{"title":"Knee Bends","description":"Gentle squats, keeping weight in heels. 15 reps.","duration_seconds":90},{"title":"Calf Raises","description":"Rise onto toes and lower. 15 reps. Important if you perform in heels.","duration_seconds":60},{"title":"Jumping Jacks","description":"20 jumping jacks to get blood flowing.","duration_seconds":60},{"title":"Deep Breaths","description":"5 deep breaths — 4 count in, 7 count hold, 8 count out.","duration_seconds":90}]'),

  ('Breathing Exercises — Tour Recovery', 'Calm your nervous system after a high-energy show.', 'breathing', 8, 'beginner', true,
   '[{"title":"4-7-8 Breathing","description":"Inhale for 4 counts, hold for 7, exhale for 8. Repeat 4 cycles.","duration_seconds":120},{"title":"Box Breathing","description":"Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 5 cycles.","duration_seconds":120},{"title":"Belly Breathing","description":"Hand on belly. Breathe so your belly rises, not your chest. 2 minutes.","duration_seconds":120},{"title":"Progressive Relaxation","description":"Starting at toes, tense each muscle group for 5 seconds then release. Work up to your head.","duration_seconds":120}]');
