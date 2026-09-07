# FocusTrack

**Modern personal productivity and life management tracker.**

A production-ready full-stack SaaS application for organizing your day, tracking habits, managing tasks, measuring focus time, and understanding progress through statistics.

## Features

- **Authentication** — Sign up, login, logout, password reset, persistent sessions (Supabase Auth)
- **Dashboard** — Productivity score, tasks, habits, focus time, streaks, weekly overview
- **Task Manager** — Create/edit/delete/complete, priorities, due dates, tags, categories, recurring, filters
- **Habit Tracker** — Custom habits, frequencies, streaks, calendar view, completion stats
- **Focus Timer** — Pomodoro (25/50) + custom, link to tasks, session tracking
- **Calendar** — Month/Week/Day views for tasks, habits, focus sessions
- **My Day Planner** — Morning / Afternoon / Evening organization
- **Goals** — Long-term goals with progress and status
- **Notes** — Simple pinned notes with tags
- **Analytics** — 7/30/90 day productivity trends and scores
- **Settings** — Theme, timezone, preferences, account deletion
- **Responsive** — Desktop sidebar + mobile bottom navigation
- **Cloud Sync** — Real PostgreSQL database (Supabase). Data available across devices
- **Security** — User-isolated data, server-side validation, protected routes

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| UI           | Custom components (shadcn-inspired), Lucide icons, Recharts |
| Backend      | Next.js API Routes / Server Actions |
| Database     | PostgreSQL (Supabase) + Prisma ORM  |
| Auth         | Supabase Auth + SSR helpers         |
| Hosting      | Vercel                              |

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- Git

### 2. Clone & Install

```bash
git clone https://github.com/www60549-dotcom/focustrack.git
cd focustrack
npm install
```

### 3. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **anon public key** (Settings → API)
3. Note the **Database connection string** (Settings → Database → Connection string → URI)
4. Enable Email auth (Authentication → Providers → Email)

### 4. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"   # optional for admin ops

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Important**: Use the Transaction pooler (port 6543) for `DATABASE_URL` and Session/Direct (port 5432) for `DIRECT_URL`.

### 5. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 7. Deploy to Vercel

1. Push this repo to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add the same environment variables
4. Deploy

## Project Structure

```
src/
  app/
    (auth)/          # login, signup, reset-password
    (dashboard)/     # protected app routes
    api/tasks/       # Task CRUD API
  components/
    dashboard/       # Stats, today widgets
    layout/          # Sidebar, mobile nav, shell
    tasks/           # Task list, form, item
    ui/              # Shared UI primitives
  lib/
    auth.ts          # requireAuthUser + Prisma sync
    prisma.ts
    supabase/        # client, server, middleware
    validations/     # Zod schemas
  types/
prisma/
  schema.prisma      # Full data model
```

## License

MIT
