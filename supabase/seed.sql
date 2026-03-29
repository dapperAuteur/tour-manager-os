-- ============================================================
-- DEMO SEED DATA
-- "The Roadwell Family" — a 5-member family band
-- Demo email: demo.tour.wit.us@awews.com
--
-- Run with: psql <connection_string> -f supabase/seed.sql
-- ============================================================

-- Create demo organization
INSERT INTO organizations (id, name, slug, subscription_tier, subscription_status, created_by)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'The Roadwell Family',
  'the-roadwell-family',
  'pro',
  'active',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Enable all modules for demo org
INSERT INTO org_modules (org_id, module_id, enabled)
SELECT '00000000-0000-0000-0000-000000000001', id, true
FROM modules
ON CONFLICT (org_id, module_id) DO UPDATE SET enabled = true;

-- ============================================================
-- DEMO TOURS
-- ============================================================

-- Tour 1: Active summer tour
INSERT INTO tours (id, name, artist_name, description, start_date, end_date, status, created_by)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Summer Soul Revival 2026',
  'The Roadwell Family',
  'East coast summer tour — 8 cities, theaters and festivals',
  '2026-06-15',
  '2026-07-20',
  'active',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- Tour 2: Completed spring tour
INSERT INTO tours (id, name, artist_name, description, start_date, end_date, status, created_by)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Spring Kickoff 2026',
  'The Roadwell Family',
  'Quick southeast run to warm up for summer',
  '2026-03-01',
  '2026-03-15',
  'completed',
  NULL
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SHOWS — Summer Soul Revival 2026
-- ============================================================
INSERT INTO shows (id, tour_id, date, city, state, venue_name, status, timezone) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-06-15', 'Atlanta', 'GA', 'The Fox Theatre', 'confirmed', 'America/New_York'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '2026-06-18', 'Nashville', 'TN', 'Ryman Auditorium', 'confirmed', 'America/Chicago'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '2026-06-21', 'Charlotte', 'NC', 'Ovens Auditorium', 'advance_sent', 'America/New_York'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '2026-06-25', 'Washington', 'DC', 'The Anthem', 'confirmed', 'America/New_York'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '2026-06-28', 'Philadelphia', 'PA', 'The Met Philadelphia', 'advance_sent', 'America/New_York'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001', '2026-07-02', 'New York', 'NY', 'SummerStage Central Park', 'draft', 'America/New_York'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', '2026-07-10', 'Boston', 'MA', 'Blue Hills Bank Pavilion', 'draft', 'America/New_York'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000001', '2026-07-15', 'Kannapolis', 'NC', 'Village Park', 'confirmed', 'America/New_York')
ON CONFLICT (id) DO NOTHING;

-- Shows — Spring Kickoff 2026
INSERT INTO shows (id, tour_id, date, city, state, venue_name, status, timezone) VALUES
  ('20000000-0000-0000-0000-000000000101', '10000000-0000-0000-0000-000000000002', '2026-03-01', 'Jacksonville', 'FL', 'Florida Theatre', 'completed', 'America/New_York'),
  ('20000000-0000-0000-0000-000000000102', '10000000-0000-0000-0000-000000000002', '2026-03-04', 'Natchitoches', 'LA', 'The Blue Parrot', 'completed', 'America/Chicago'),
  ('20000000-0000-0000-0000-000000000103', '10000000-0000-0000-0000-000000000002', '2026-03-08', 'Birmingham', 'AL', 'Iron City', 'completed', 'America/Chicago'),
  ('20000000-0000-0000-0000-000000000104', '10000000-0000-0000-0000-000000000002', '2026-03-12', 'Savannah', 'GA', 'Lucas Theatre', 'completed', 'America/New_York')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ADVANCE SHEETS (for confirmed shows)
-- ============================================================

-- Atlanta — Fox Theatre (fully filled out)
INSERT INTO advance_sheets (id, show_id, token, status, venue_type, venue_capacity, venue_address, venue_phone,
  dressing_room_count, dressing_room_location, dressing_room_lockable, dressing_room_washbasin, dressing_room_toilet, dressing_room_shower,
  caterer_name, caterer_phone, meal_times, per_diem_contact_name,
  stage_width, stage_depth, stage_height, pa_system, has_stage_door, has_rear_door, has_backstage_parking,
  soundcheck_time, doors_time, stage_time, curfew_time, performance_length_minutes, show_format,
  ticket_price, total_gross, smoking_allowed,
  merch_area_description, sound_company_name, sound_company_phone,
  submitted_at)
VALUES (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'complete',
  'theater', 4678, '660 Peachtree St NE, Atlanta, GA 30308', '404-881-2100',
  3, 'Stage level, behind house right', true, true, true, true,
  'Southern Provisions Catering', '404-555-0123', 'Lunch 1:00 PM, Dinner 5:30 PM', 'Marcus Johnson',
  50, 30, 25, 'L-Acoustics K2', true, true, true,
  '14:00', '19:00', '20:30', '23:00', 90, 'live',
  45.00, 210510.00, false,
  'Lobby area, 3 tables provided, split 85/15', 'Clearwing Productions', '404-555-0456',
  '2026-05-20T10:00:00Z'
) ON CONFLICT (id) DO NOTHING;

-- Nashville — Ryman
INSERT INTO advance_sheets (id, show_id, token, status, venue_type, venue_capacity, venue_address, venue_phone,
  dressing_room_count, dressing_room_location, dressing_room_lockable,
  caterer_name, meal_times,
  stage_width, stage_depth, pa_system, has_backstage_parking,
  soundcheck_time, doors_time, stage_time, curfew_time, performance_length_minutes, show_format,
  ticket_price, total_gross, smoking_allowed,
  sound_company_name, sound_company_phone,
  submitted_at)
VALUES (
  '30000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  'complete',
  'theater', 2362, '116 5th Ave N, Nashville, TN 37219', '615-889-3060',
  2, 'Backstage, second floor', true,
  'Nashville Nosh', 'Dinner 5:00 PM',
  44, 28, 'JBL VTX Series', false,
  '15:00', '19:30', '21:00', '23:30', 90, 'live',
  55.00, 129910.00, false,
  'Sound Image Nashville', '615-555-0789',
  '2026-05-25T14:00:00Z'
) ON CONFLICT (id) DO NOTHING;

-- Kannapolis — Village Park
INSERT INTO advance_sheets (id, show_id, token, status, venue_type, venue_capacity, venue_address, venue_phone,
  dressing_room_count, dressing_room_lockable,
  stage_width, stage_depth, pa_system, has_backstage_parking,
  soundcheck_time, doors_time, stage_time, performance_length_minutes, show_format,
  ticket_price, total_gross, smoking_allowed,
  merch_area_description,
  submitted_at)
VALUES (
  '30000000-0000-0000-0000-000000000008',
  '20000000-0000-0000-0000-000000000008',
  'a0000000-0000-0000-0000-000000000008',
  'complete',
  'outdoor', 5000, '800 West C St, Kannapolis, NC 28081', '704-920-4343',
  1, false,
  40, 24, 'QSC WideLine', true,
  '14:00', '18:00', '19:30', 90, 'live',
  20.00, 100000.00, false,
  'Merch area in middle of park, venue provides table and electricity, split 85/15 90/10 CDs',
  '2026-06-01T09:00:00Z'
) ON CONFLICT (id) DO NOTHING;

-- DC — The Anthem
INSERT INTO advance_sheets (id, show_id, token, status, venue_type, venue_capacity, venue_address, venue_phone,
  soundcheck_time, doors_time, stage_time, performance_length_minutes, show_format,
  ticket_price, total_gross,
  submitted_at)
VALUES (
  '30000000-0000-0000-0000-000000000004',
  '20000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000004',
  'complete',
  'theater', 6000, '901 Wharf St SW, Washington, DC 20024', '202-888-0020',
  '15:00', '19:00', '20:30', 90, 'live',
  50.00, 300000.00,
  '2026-06-10T12:00:00Z'
) ON CONFLICT (id) DO NOTHING;

-- Advance sheets for pending shows (Charlotte, Philly)
INSERT INTO advance_sheets (id, show_id, token, status) VALUES
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'pending'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000005', 'pending')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ADVANCE CONTACTS
-- ============================================================
INSERT INTO advance_contacts (advance_sheet_id, role, company_name, contact_name, phone, email) VALUES
  ('30000000-0000-0000-0000-000000000001', 'promoter', 'Live Nation Southeast', 'Angela Davis', '404-555-1001', 'angela@livenation.example'),
  ('30000000-0000-0000-0000-000000000001', 'production', 'Fox Theatre Productions', 'Derek Williams', '404-555-1002', 'derek@foxtheatre.example'),
  ('30000000-0000-0000-0000-000000000001', 'catering', 'Southern Provisions', 'Chef Lisa', '404-555-1003', null),
  ('30000000-0000-0000-0000-000000000001', 'sound', 'Clearwing Productions', 'Mike Chen', '404-555-0456', 'mike@clearwing.example'),
  ('30000000-0000-0000-0000-000000000002', 'promoter', 'Ryman Presents', 'Sarah Mitchell', '615-555-2001', 'sarah@ryman.example'),
  ('30000000-0000-0000-0000-000000000002', 'sound', 'Sound Image Nashville', 'Tom Banks', '615-555-0789', 'tom@soundimage.example'),
  ('30000000-0000-0000-0000-000000000008', 'promoter', 'City of Kannapolis', 'James Parker', '704-555-3001', 'jparker@kannapolis.example')
ON CONFLICT DO NOTHING;

-- ============================================================
-- ITINERARY DAYS (with hotel info)
-- ============================================================
INSERT INTO itinerary_days (tour_id, show_id, date, day_type,
  hotel_name, hotel_address, hotel_phone, hotel_confirmation, hotel_amenities,
  distance_miles, drive_time_hours, driver_name, driver_phone, bus_call_time,
  depart_time, next_destination, next_distance_miles)
VALUES
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2026-06-15', 'show',
   'The Georgian Terrace Hotel', '659 Peachtree St NE, Atlanta, GA 30308', '404-897-1991', 'GTH-88291', 'Pool, Fitness Center, Valet Parking',
   null, null, null, null, null,
   '23:30', 'Nashville, TN', 250),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '2026-06-18', 'show',
   'Thompson Nashville', '401 11th Ave S, Nashville, TN 37203', '615-262-6000', 'TN-44102', 'Rooftop bar, Fitness Center',
   250, 3.5, 'Steve Jobs', '615-444-4444', '08:00',
   '23:45', 'Charlotte, NC', 530),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '2026-06-25', 'show',
   'The Watergate Hotel', '2650 Virginia Ave NW, Washington, DC 20037', '202-827-1600', 'WG-77503', 'Spa, Pool, Fitness',
   280, 4.5, 'Marcus Bell', '202-555-0100', '09:00',
   '23:30', 'Philadelphia, PA', 140),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', '2026-07-15', 'show',
   'Hampton Inn Kannapolis', '1300 S University Blvd, Kannapolis, NC 28081', '704-555-8100', 'HI-991045', 'Free breakfast, Pool, WiFi',
   350, 5.0, 'Steve Jobs', '615-444-4444', '07:00',
   null, null, null)
ON CONFLICT DO NOTHING;

-- ============================================================
-- EXPENSES (demo financial data)
-- ============================================================
-- Note: member_id is NULL for demo since we don't have demo auth users yet.
-- These will be associated with demo users when demo login is created.
INSERT INTO expenses (tour_id, show_id, date, category, amount, description, is_tax_deductible, status) VALUES
  -- Summer tour expenses
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2026-06-15', 'hotel', 1890.00, 'Georgian Terrace - 5 rooms x 2 nights', true, 'approved'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2026-06-15', 'per_diem', 250.00, 'Per diem - 5 members x $50', true, 'approved'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2026-06-14', 'travel', 450.00, 'Bus fuel - drive to Atlanta', true, 'approved'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '2026-06-18', 'hotel', 1250.00, 'Thompson Nashville - 5 rooms', true, 'approved'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '2026-06-18', 'per_diem', 250.00, 'Per diem - 5 members x $50', true, 'approved'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '2026-06-17', 'travel', 380.00, 'Bus fuel - Atlanta to Nashville', true, 'approved'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '2026-06-18', 'meals', 175.00, 'Pre-show dinner - whole team', true, 'approved'),
  ('10000000-0000-0000-0000-000000000001', null, '2026-06-10', 'equipment', 2400.00, 'New in-ear monitors x 5', true, 'approved'),
  ('10000000-0000-0000-0000-000000000001', null, '2026-06-01', 'insurance', 3200.00, 'Tour liability insurance', true, 'approved'),
  ('10000000-0000-0000-0000-000000000001', null, '2026-06-05', 'merch', 4500.00, 'T-shirts (500), posters (200), vinyl (100)', true, 'approved'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '2026-06-25', 'hotel', 2100.00, 'Watergate Hotel - 5 rooms', true, 'pending'),
  ('10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '2026-06-25', 'per_diem', 250.00, 'Per diem - 5 members x $50', true, 'pending'),
  -- Spring tour expenses
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000101', '2026-03-01', 'hotel', 680.00, 'Hampton Inn Jacksonville - 3 rooms', true, 'approved'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000102', '2026-03-04', 'hotel', 520.00, 'Holiday Inn Natchitoches - 3 rooms', true, 'approved'),
  ('10000000-0000-0000-0000-000000000002', null, '2026-02-28', 'travel', 1200.00, 'Flights - 5 members roundtrip', true, 'approved')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SHOW REVENUE
-- ============================================================
INSERT INTO show_revenue (show_id, guarantee, ticket_sales, merch_sales, other_revenue, other_revenue_description) VALUES
  ('20000000-0000-0000-0000-000000000001', 12000.00, 8500.00, 3200.00, null, null),
  ('20000000-0000-0000-0000-000000000002', 15000.00, 6800.00, 2100.00, 500.00, 'Meet & greet VIP packages'),
  ('20000000-0000-0000-0000-000000000004', 18000.00, null, null, null, null),
  ('20000000-0000-0000-0000-000000000008', 8000.00, 4200.00, 1800.00, null, null),
  ('20000000-0000-0000-0000-000000000101', 5000.00, 2100.00, 800.00, null, null),
  ('20000000-0000-0000-0000-000000000102', 4500.00, 1800.00, 650.00, null, null),
  ('20000000-0000-0000-0000-000000000103', 6000.00, 2800.00, 950.00, null, null),
  ('20000000-0000-0000-0000-000000000104', 5500.00, 2400.00, 1100.00, null, null)
ON CONFLICT DO NOTHING;

-- ============================================================
-- MERCH PRODUCTS
-- ============================================================
INSERT INTO merch_products (id, org_id, name, description, sku, category, price, cost_basis) VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Summer Soul Revival Tee', 'Black cotton tee with 2026 tour dates on back', 'TSHIRT-BLK-2026', 'apparel', 35.00, 8.50),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Greatest Hits Vinyl', '180g vinyl, gatefold sleeve', 'VINYL-GH-001', 'vinyl', 30.00, 12.00),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Tour Poster 2026', '18x24 full color poster', 'POSTER-2026', 'poster', 15.00, 2.50),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Live Album CD', 'Recorded at Fox Theatre Atlanta', 'CD-LIVE-001', 'cd', 12.00, 3.00),
  ('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Roadwell Tote Bag', 'Canvas tote with embroidered logo', 'TOTE-BLK-001', 'accessory', 20.00, 5.00)
ON CONFLICT (id) DO NOTHING;

-- Merch inventory for summer tour
INSERT INTO merch_inventory (product_id, tour_id, quantity_start, quantity_remaining) VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 500, 382),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 100, 72),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 200, 156),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 150, 118),
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 100, 79)
ON CONFLICT DO NOTHING;

-- Merch sales
INSERT INTO merch_sales (product_id, show_id, tour_id, quantity, unit_price) VALUES
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 45, 35.00),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 12, 30.00),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 22, 15.00),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 15, 12.00),
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 38, 35.00),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 8, 30.00),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 18, 15.00),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 11, 20.00),
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 35, 35.00),
  ('40000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 17, 12.00),
  ('40000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 10, 20.00)
ON CONFLICT DO NOTHING;
