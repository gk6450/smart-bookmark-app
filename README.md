# Smart Bookmark App

Private bookmark manager for storing URLs.

## Live URL

- Vercel: `ADD_YOUR_VERCEL_URL_HERE`

## Features

- Google OAuth login/logout only (no email/password)
- Private bookmarks per user with Supabase RLS
- Create, update, and delete bookmarks (`title + url`)
- Realtime sync across tabs (insert, update, delete)
- Arctic Glass UI (icons, subtle motion, skeleton states, empty/error states)

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4
- Supabase (Auth, Postgres, Realtime, RLS)
- `@supabase/ssr` for server/client auth handling
- `zod` for validation
- `motion` + `lucide-react` + `sonner`
- Vitest (tests under `tests/`)

## Architecture

### Folder Structure

```txt
src/
  app/
    (auth)/login/page.tsx
    auth/callback/route.ts
    (dashboard)/bookmarks/page.tsx
    (dashboard)/loading.tsx
    layout.tsx
    globals.css
  components/
    bookmarks/
    layout/
    ui/
  features/
    auth/actions.ts
    bookmarks/actions.ts
    bookmarks/hooks/use-bookmark-realtime.ts
    bookmarks/mappers.ts
    bookmarks/schemas.ts
  lib/
    supabase/client.ts
    supabase/server.ts
    supabase/middleware.ts
    utils/url.ts
    utils/cn.ts
  types/
    bookmark.ts
    supabase.ts
supabase/
  schema.sql
  policies.sql
tests/
  unit/
```

### Layer Responsibilities

- `app/`: routes, server rendering, auth gating, loading/error boundaries.
- `components/`: UI rendering + local interaction state.
- `features/*/actions.ts`: server actions for mutation logic.
- `features/bookmarks/schemas.ts`: input validation and URL normalization.
- `lib/supabase/*`: Supabase client factories for browser/server/middleware.
- `supabase/*.sql`: schema + RLS policies + realtime publication setup.

## Workflow

### Auth Flow

1. User opens app and is redirected to `/bookmarks`.
2. If unauthenticated, server redirects to `/login`.
3. `signInWithGoogleAction` starts OAuth with callback `/auth/callback`.
4. Callback exchanges auth code for session and redirects back to `/bookmarks`.

### Bookmark CRUD + Realtime Flow

1. Initial bookmark list is fetched server-side in `bookmarks/page.tsx`.
2. Client subscribes to Supabase `postgres_changes` for `INSERT`, `UPDATE`, `DELETE` filtered by `user_id`.
3. Create/update/delete calls server actions.
4. UI applies optimistic state; server action response and realtime events converge via upsert-by-id.

## Database Setup (Supabase Cloud)

Run in SQL Editor, in order:

1. `supabase/schema.sql`
2. `supabase/policies.sql`

This creates:

- Table: `public.bookmarks`
- RLS enabled
- Policies: `SELECT`, `INSERT`, `UPDATE`, `DELETE` scoped to `auth.uid() = user_id`
- Realtime publication registration for `bookmarks`

## Environment Setup

Create `.env.local` (do not use only `.env.example`):

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Google OAuth Setup

1. In Supabase: `Authentication -> Providers -> Google` and copy Supabase callback URL:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
2. In Google Cloud Console, configure OAuth consent screen first.
3. Create OAuth Client ID (Web application):
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://<your-vercel-domain>`
   - Authorized redirect URI:
     - Supabase callback URL from step 1
4. Copy Google Client ID/Secret into Supabase Google provider and enable.
5. In Supabase `Authentication -> URL Configuration` set:
   - Site URL: `http://localhost:3000`
   - Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `https://<your-vercel-domain>/auth/callback`

## Problems Faced and Solutions

1. **Google Cloud permissions/project access blocked OAuth setup**
   - **Problem:** `You need additional access to the project ...` in Google Cloud Console.
   - **Solution:** Switched to a project where IAM permissions were available (or requested admin role), then created OAuth credentials there.

2. **OAuth client creation blocked by missing consent screen**
   - **Problem:** Google requires consent screen before creating OAuth Client ID.
   - **Solution:** Configured consent screen first (External app in testing mode, added test users), then created OAuth credentials.

3. **Wrong env file caused runtime auth failures**
   - **Problem:** App showed missing Supabase env variables while values were in `.env.example`.
   - **Solution:** Moved runtime values to `.env.local` and restarted dev server.

4. **Realtime channel subscribed without auth token in some sessions**
   - **Problem:** Cross-tab updates did not appear until refresh.
   - **Solution:** Set realtime auth token from current session before channel subscription and handled insert/update/delete events.

## Local Development

```bash
npm install
npm run dev
```

## Commands

- `npm run dev` - start local dev server
- `npm run lint` - lint checks
- `npm run typecheck` - TypeScript checks
- `npm test` - run tests once and exit
- `npm run test:run` - run tests once and exit
- `npm run build` - production build

## Manual QA Checklist

- Login with Google and land on `/bookmarks`
- Add bookmark and verify it appears immediately
- Update bookmark title/url and verify changes persist
- Delete bookmark and verify it disappears
- Open second tab with same account and verify realtime insert/update/delete
- Verify user B cannot view or mutate user A bookmarks
- Run lint/typecheck/build before submission
