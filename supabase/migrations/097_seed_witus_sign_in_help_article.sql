-- ============================================================
-- HELP ARTICLE: Sign in with WitUS
-- ============================================================

insert into help_articles (id, title, slug, category, content, module_id, tags)
values (
  '80000000-0000-0000-0000-000000000020',
  'Sign in with WitUS',
  'sign-in-with-witus',
  'getting-started',
  '# Sign in with WitUS

WitUS is one account for every WitUS app, like Tour Manager OS,
CentenarianOS and WitUS Learn. If you have one, you can use it to
log in here.

## How to sign in

1. Go to the **Log In** page.
2. Click **Sign in with WitUS**.
3. If WitUS asks, enter your email and open the sign-in link it
   sends you.

You land back in Tour Manager OS, signed in.

If you are already signed in to another WitUS app in the same
browser, the Log In page may sign you in by itself. That is
normal.

## Which account do I get?

WitUS uses your email address. If you already have a Tour Manager
OS account with that same email, you get that account, with all
your tours. If you do not, a new account is made for you.

## Signing out

There are two buttons at the bottom of the side menu:

- **Sign out** signs you out of Tour Manager OS only. Your other
  WitUS apps stay signed in.
- **Sign out of WitUS everywhere** signs you out of Tour Manager
  OS and out of WitUS. Other WitUS apps you are signed in to stay
  signed in until you sign out of them.

## What if I get stuck

- **I do not see the WitUS button.** It only shows on
  tour.witus.online. On a band''s own web address, log in with your
  email instead.
- **"Your WitUS sign-in expired or was interrupted."** Click
  **Sign in with WitUS** again.
- **"WitUS could not confirm your account."** Try again, or log in
  with your email and password or email code.
- Ask the help agent on `/help`. It knows this article.',
  null,
  array['witus', 'sign in', 'login', 'log in', 'sign out', 'account', 'sso']
)
on conflict (slug) do update set
  title = excluded.title,
  category = excluded.category,
  content = excluded.content,
  module_id = excluded.module_id,
  tags = excluded.tags,
  updated_at = now();
