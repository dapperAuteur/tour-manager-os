-- ============================================================
-- EMAIL LISTS
-- ============================================================
create table email_lists (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index email_lists_org_id_idx on email_lists(org_id);

create trigger email_lists_updated_at
  before update on email_lists
  for each row execute function extensions.moddatetime(updated_at);

alter table email_lists enable row level security;

create policy "email_lists_org_select"
  on email_lists for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "email_lists_org_manage"
  on email_lists for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- EMAIL SUBSCRIBERS
-- ============================================================
create table email_subscribers (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references email_lists(id) on delete cascade not null,
  email text not null,
  name text,
  city text,
  source text check (source in ('merch', 'check_in', 'signup', 'import', 'manual')),
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz,
  unique(list_id, email)
);

create index email_subscribers_list_id_idx on email_subscribers(list_id);
create index email_subscribers_email_idx on email_subscribers(email);

alter table email_subscribers enable row level security;

create policy "email_subscribers_org_select"
  on email_subscribers for select
  using (
    list_id in (
      select id from email_lists
      where org_id in (select org_id from org_members where user_id = auth.uid())
    )
  );

create policy "email_subscribers_org_manage"
  on email_subscribers for all
  using (
    list_id in (
      select id from email_lists
      where org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin'))
    )
  );

-- ============================================================
-- EMAIL CAMPAIGNS
-- ============================================================
create table email_campaigns (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  list_id uuid references email_lists(id) on delete set null,
  subject text not null,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients_count int default 0,
  opened_count int default 0,
  clicked_count int default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index email_campaigns_org_id_idx on email_campaigns(org_id);
create index email_campaigns_status_idx on email_campaigns(status);

create trigger email_campaigns_updated_at
  before update on email_campaigns
  for each row execute function extensions.moddatetime(updated_at);

alter table email_campaigns enable row level security;

create policy "email_campaigns_org_select"
  on email_campaigns for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "email_campaigns_org_manage"
  on email_campaigns for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- COMMUNITY CATEGORIES
-- ============================================================
create table community_categories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  description text,
  slug text not null,
  sort_order int default 0,
  access_level text default 'public' check (access_level in ('public', 'members', 'vip')),
  created_at timestamptz default now(),
  unique(org_id, slug)
);

create index community_categories_org_id_idx on community_categories(org_id);

alter table community_categories enable row level security;

create policy "community_categories_select"
  on community_categories for select
  using (org_id in (select org_id from org_members where user_id = auth.uid()));

create policy "community_categories_manage"
  on community_categories for all
  using (org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin')));

-- ============================================================
-- COMMUNITY POSTS
-- ============================================================
create table community_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references community_categories(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  pinned boolean default false,
  locked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index community_posts_category_id_idx on community_posts(category_id);
create index community_posts_author_id_idx on community_posts(author_id);

create trigger community_posts_updated_at
  before update on community_posts
  for each row execute function extensions.moddatetime(updated_at);

alter table community_posts enable row level security;

create policy "community_posts_select"
  on community_posts for select
  using (
    category_id in (
      select id from community_categories
      where org_id in (select org_id from org_members where user_id = auth.uid())
    )
  );

create policy "community_posts_insert"
  on community_posts for insert
  with check (
    author_id = auth.uid() and
    category_id in (
      select id from community_categories
      where org_id in (select org_id from org_members where user_id = auth.uid())
    )
  );

-- Authors can update their own posts
create policy "community_posts_update_own"
  on community_posts for update
  using (author_id = auth.uid());

-- Admins can update any post (pin, lock, moderate)
create policy "community_posts_update_admin"
  on community_posts for update
  using (
    category_id in (
      select id from community_categories
      where org_id in (select org_id from org_members where user_id = auth.uid() and role in ('owner', 'admin'))
    )
  );

-- Authors can delete their own posts
create policy "community_posts_delete_own"
  on community_posts for delete
  using (author_id = auth.uid());

-- ============================================================
-- COMMUNITY REPLIES
-- ============================================================
create table community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade not null,
  author_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index community_replies_post_id_idx on community_replies(post_id);

create trigger community_replies_updated_at
  before update on community_replies
  for each row execute function extensions.moddatetime(updated_at);

alter table community_replies enable row level security;

create policy "community_replies_select"
  on community_replies for select
  using (
    post_id in (
      select id from community_posts
      where category_id in (
        select id from community_categories
        where org_id in (select org_id from org_members where user_id = auth.uid())
      )
    )
  );

create policy "community_replies_insert"
  on community_replies for insert
  with check (author_id = auth.uid());

create policy "community_replies_update_own"
  on community_replies for update
  using (author_id = auth.uid());

create policy "community_replies_delete_own"
  on community_replies for delete
  using (author_id = auth.uid());
