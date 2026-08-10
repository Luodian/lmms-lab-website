# Supabase setup for the community blog

This guide sets up the Supabase project that powers the community features on the LMMs-Lab website: sign-in with Google or GitHub, member profiles, community posts and notes, subscriptions, and collaboration requests. Follow the steps in order. No prior Supabase experience is needed.

The production site is `https://www.lmms-lab.com`. If you deploy under a different domain, replace it everywhere below.

## 1. Create the Supabase project

1. Go to `https://supabase.com/dashboard` and sign in.
2. Click `New project` and pick your organization. Fill in:
   - Name: `lmms-lab-website` (any name works)
   - Database password: generate a strong one and store it in your password manager, you need it again in step 2
   - Region: pick one close to your users
3. Wait for provisioning to finish, it takes a minute or two.
4. Collect the two values the app needs, under `Project Settings`:
   - Project URL: on the `Data API` page (older dashboards: the `API` page), it looks like `https://abcdefghijkl.supabase.co`
   - Anon key: on the `API Keys` page, the `anon` `public` key (newer projects call it the `publishable` key)

The subdomain of the Project URL (`abcdefghijkl` in the example) is your project ref. Steps 2, 3, and 4 use it.

## 2. Apply the database migration

The migration lives at `supabase/migrations/0001_blog_system.sql` in this repo. It creates the tables, triggers, row level security policies, and admin functions. It is safe to run more than once. Pick one of the two paths.

Path A, SQL Editor, no local tools needed:

1. In the Supabase dashboard, open `SQL Editor`.
2. Click `New query`.
3. Paste the full contents of `supabase/migrations/0001_blog_system.sql`.
4. Click `Run`. You should see `Success. No rows returned`.

Path B, Supabase CLI:

1. Install the CLI, for example `brew install supabase/tap/supabase` on macOS.
2. From the repo root, run:
   - `supabase login`
   - `supabase link --project-ref <project-ref>`
   - `supabase db push`
3. Enter the database password from step 1 when asked. The CLI applies every file in `supabase/migrations/`.

## 3. Configure Google OAuth

1. Go to `https://console.cloud.google.com` and create a project (or select an existing one).
2. Set up the consent screen: `APIs & Services` -> `OAuth consent screen` (newer console: `Google Auth Platform` -> `Branding`).
   - User type: `External`
   - Fill in the app name, support email, and developer contact email, then save.
   - While the app is in `Testing` status only listed test users can sign in. Add yourself as a test user, or publish the app to allow everyone.
3. Create the credentials: `APIs & Services` -> `Credentials` -> `Create credentials` -> `OAuth client ID`.
   - Application type: `Web application`
   - Under `Authorized redirect URIs`, add exactly: `https://<project-ref>.supabase.co/auth/v1/callback`
4. Click `Create` and copy the `Client ID` and `Client secret`.
5. In the Supabase dashboard, open `Authentication` -> `Sign In / Providers` (older dashboards: `Providers`), select `Google`, turn it on, paste the client ID and client secret, and save.

## 4. Configure GitHub OAuth

1. Go to GitHub -> `Settings` -> `Developer settings` -> `OAuth Apps` -> `New OAuth App`.
2. Fill in:
   - Application name: `LMMs-Lab Website` (any name works)
   - Homepage URL: `https://www.lmms-lab.com`
   - Authorization callback URL: `https://<project-ref>.supabase.co/auth/v1/callback` (the same Supabase callback URL as in step 3)
3. Click `Register application`, then `Generate a new client secret`. Copy the client ID and the secret right away, GitHub shows the secret only once.
4. In the Supabase dashboard, open `Authentication` -> `Sign In / Providers`, select `GitHub`, turn it on, paste the client ID and client secret, and save.

## 5. Configure auth URLs in Supabase

1. In the Supabase dashboard, open `Authentication` -> `URL Configuration`.
2. Set `Site URL` to the production domain: `https://www.lmms-lab.com`
3. Add both of these to `Additional Redirect URLs`:
   - `http://localhost:3000/auth/callback/`
   - `https://www.lmms-lab.com/auth/callback/`

Keep the trailing slashes. This app sets `trailingSlash: true` in `next.config.mjs`, so the real callback route lives at `/auth/callback/`. If you register the URL without the final `/`, Supabase rejects the redirect and users land on the Site URL without a session.

## 6. Set the environment variables

The app reads two values, both collected in step 1:

- `NEXT_PUBLIC_SUPABASE_URL`: the Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the `anon` / `publishable` key

For local development, create `.env.local` in the repo root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

For production, set the same two variables in Vercel: project -> `Settings` -> `Environment Variables`, then redeploy.

Both values are safe to expose to the browser, row level security protects the data. If the variables are missing, the site still builds and runs, but the community features stay disabled.

## 7. Bootstrap the first admin

Every new account starts with the `reader` role. The first `admin` is promoted by hand.

1. Open the site and sign in once with Google or GitHub. This creates your profile row.
2. In the Supabase dashboard, open `SQL Editor` and run the snippet below with your own email:

```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
```

3. Verify it worked: run `select display_name, role from public.profiles;` and check that your row shows `admin`.

The same snippet sits, commented out, at the bottom of the migration file.

## 8. How roles work

- `reader`: the default for every new account. Readers can subscribe to posts and notes and can send a collaboration request.
- `editor`: everything a reader can do, plus write and publish posts and notes.
- `admin`: everything an editor can do, plus approve or decline collaboration requests and edit any entry or profile.

The path from reader to editor: a reader sends a collaboration request on the site, and an admin approves it on the `/admin` page. Approval promotes that reader to `editor` automatically. Admins are only ever created by hand, with the SQL snippet from step 7.
