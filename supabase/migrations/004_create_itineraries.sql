-- ============================================================
-- ITINERARY DAYS
-- One row per day of the tour (travel, show, or off day).
-- ============================================================
create table itinerary_days (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references tours(id) on delete cascade not null,
  show_id uuid references shows(id) on delete set null,
  date date not null,
  day_type text not null default 'show' check (day_type in ('travel', 'show', 'off')),

  -- Travel
  distance_miles numeric(8,1),
  drive_time_hours numeric(4,1),
  driver_name text,
  driver_phone text,
  bus_call_time time,

  -- Hotel
  hotel_name text,
  hotel_address text,
  hotel_phone text,
  hotel_fax text,
  hotel_confirmation text,
  hotel_amenities text,
  hotel_room_count int,
  hotel_doubles int,
  hotel_singles int,
  hotel_distance_to_venue text,

  -- Departure
  depart_time time,
  next_destination text,
  next_distance_miles numeric(8,1),
  next_arrive_time time,

  -- Weather (cached from API)
  weather_temp_high int,
  weather_temp_low int,
  weather_description text,

  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tour_id, date)
);

create index itinerary_days_tour_id_idx on itinerary_days(tour_id);
create index itinerary_days_date_idx on itinerary_days(date);
create index itinerary_days_show_id_idx on itinerary_days(show_id);

create trigger itinerary_days_updated_at
  before update on itinerary_days
  for each row execute function extensions.moddatetime(updated_at);

alter table itinerary_days enable row level security;

-- Members can read itinerary days for their tours
create policy "itinerary_days_members_select"
  on itinerary_days for select
  using (
    tour_id in (select tour_id from tour_members where user_id = auth.uid())
  );

-- Managers can manage itinerary days
create policy "itinerary_days_managers_insert"
  on itinerary_days for insert
  with check (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

create policy "itinerary_days_managers_update"
  on itinerary_days for update
  using (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

create policy "itinerary_days_managers_delete"
  on itinerary_days for delete
  using (
    tour_id in (
      select tour_id from tour_members
      where user_id = auth.uid() and role = 'manager'
    )
  );

-- ============================================================
-- SCHEDULE ITEMS
-- Individual time blocks within an itinerary day.
-- ============================================================
create table schedule_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_day_id uuid references itinerary_days(id) on delete cascade not null,
  time time,
  label text not null,
  category text check (category in ('travel', 'meal', 'soundcheck', 'meet_greet', 'show', 'load_in', 'load_out', 'doors', 'free_time', 'other')),
  location text,
  notes text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index schedule_items_day_id_idx on schedule_items(itinerary_day_id);

alter table schedule_items enable row level security;

-- Members can read schedule items for their tours
create policy "schedule_items_members_select"
  on schedule_items for select
  using (
    itinerary_day_id in (
      select id.id from itinerary_days id
      join tour_members tm on tm.tour_id = id.tour_id
      where tm.user_id = auth.uid()
    )
  );

-- Managers can manage schedule items
create policy "schedule_items_managers_all"
  on schedule_items for all
  using (
    itinerary_day_id in (
      select id.id from itinerary_days id
      join tour_members tm on tm.tour_id = id.tour_id
      where tm.user_id = auth.uid() and tm.role = 'manager'
    )
  );

-- ============================================================
-- FLIGHT INFO
-- ============================================================
create table flights (
  id uuid primary key default gen_random_uuid(),
  itinerary_day_id uuid references itinerary_days(id) on delete cascade not null,
  airline text,
  flight_number text,
  departure_city text,
  departure_time time,
  arrival_city text,
  arrival_time time,
  confirmation_number text,
  reserved_by text,
  connecting_airline text,
  connecting_flight_number text,
  connecting_departure_time time,
  connecting_arrival_city text,
  connecting_arrival_time time,
  notes text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index flights_day_id_idx on flights(itinerary_day_id);

alter table flights enable row level security;

create policy "flights_members_select"
  on flights for select
  using (
    itinerary_day_id in (
      select id.id from itinerary_days id
      join tour_members tm on tm.tour_id = id.tour_id
      where tm.user_id = auth.uid()
    )
  );

create policy "flights_managers_all"
  on flights for all
  using (
    itinerary_day_id in (
      select id.id from itinerary_days id
      join tour_members tm on tm.tour_id = id.tour_id
      where tm.user_id = auth.uid() and tm.role = 'manager'
    )
  );
