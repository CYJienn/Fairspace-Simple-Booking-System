# FairSpace

FairSpace is a university discussion room booking system for students and administrators. Students can find available rooms, book time slots, manage their own schedule, report issues, and use an AI assistant to get booking suggestions. Administrators get a separate control panel for room maintenance, pending approvals, reports, booking removals, and user restrictions.

The app is built as a realistic full-stack web project rather than a static prototype. It uses Supabase for authentication and data persistence, Next.js for the web app and API routes, and Gemini for the student AI booking assistant.

## Features

- Student and admin authentication with role-based portals.
- Calendar timetable for booking discussion rooms.
- Searchable rooms with capacity, amenities, and maintenance status.
- Standard booking limit of 2 hours per student per day.
- Longer booking requests that enter an admin approval queue.
- Student schedule view with edit and cancel actions for own bookings.
- Admin schedule and calendar view with booking removal reasons.
- Report flow for room misuse, booking issues, and hogging cases.
- Mailbox for admin follow-up messages and system notices.
- Room management for admins, including capacity, tags, and availability.
- Ban-user flow for admin moderation.
- Student-only AI assistant that can recommend slots and prepare booking actions.
- Responsive layout with mobile-specific header and action behavior.

## Tech Stack

- **Framework:** Next.js 16 App Router
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS, Radix UI, Lucide icons
- **Auth and database:** Supabase Auth and Supabase Postgres
- **AI:** Gemini 2.5 Flash through a Next.js API route
- **Deployment:** Vercel

## Project Structure

```txt
Simple-Booking-System/
+-- README.md
+-- docs/
|   +-- FairSpace_Shortcut_Asia_Brief_Documentation.docx
+-- fairspace/
    +-- backend/
    |   +-- scripts/
    |   |   +-- run-sql.mjs
    |   +-- sql/
    |   |   +-- ensure_profiles_role.sql
    |   |   +-- seed.sql
    |   +-- .env.example
    |   +-- package.json
    +-- frontend/
        +-- app/
        |   +-- api/ai-booking-chat/route.ts
        |   +-- login/
        |   +-- signup/
        |   +-- layout.tsx
        |   +-- page.tsx
        +-- components/
        +-- hooks/
        +-- lib/
        +-- public/
        +-- .env.example
        +-- package.json
```

## Architecture

```mermaid
flowchart TD
  Student["Student"] --> WebApp["Next.js frontend"]
  Admin["Admin"] --> WebApp
  WebApp --> SupabaseAuth["Supabase Auth"]
  WebApp --> SupabaseDB["Supabase Postgres"]
  WebApp --> AIRoute["/api/ai-booking-chat"]
  AIRoute --> Planner["Deterministic booking planner"]
  AIRoute --> Gemini["Gemini API"]
  SupabaseDB --> Profiles["fairspace_profiles"]
  SupabaseDB --> Rooms["fairspace_rooms"]
  SupabaseDB --> Bookings["fairspace_bookings"]
```

The frontend handles the booking interface, role-based rendering, profile updates, and admin workflows. Supabase stores profiles, rooms, bookings, and related booking state. The AI assistant calls a server-side API route so the Gemini API key is not exposed to the browser.

The AI route uses a hybrid approach:

- Gemini is used for natural chatbot-style responses when available.
- Deterministic planner logic is used for booking-critical actions such as slot recommendations, conflict checks, and booking button payloads.

This keeps the assistant more reliable for booking decisions while still allowing natural conversation.

## Main Data Model

The project seed SQL creates the core FairSpace tables:

- `fairspace_profiles`: user profile, role, matric ID, faculty, avatar URL.
- `fairspace_rooms`: discussion room name, location, capacity, status, and amenities.
- `fairspace_bookings`: room, date, start/end time, organizer, attendee count, status, and request message.

The current app is structured so it can keep growing with dedicated tables for reports, mailbox messages, bans, and notification delivery.

## Environment Variables

Create `fairspace/frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Create `fairspace/backend/.env.local` if you want to run the SQL seed script:

```env
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
```

For Vercel deployment, add the frontend variables in the Vercel project environment settings.

## Local Setup

Install dependencies and run the frontend:

```bash
cd fairspace/frontend
pnpm install
pnpm dev
```

Open the app:

```txt
http://localhost:3000
```

Seed the database:

```bash
cd fairspace/backend
pnpm install
pnpm db:run
```

By default, `pnpm db:run` runs:

```txt
sql/seed.sql
```

To run another SQL file:

```bash
pnpm db:run -- --file=sql/ensure_profiles_role.sql
```

## Build and Quality Checks

From `fairspace/frontend`:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

The production build creates the Next.js app and API route bundle used by Vercel.

## Common Commands

```bash
# Frontend dev server
cd fairspace/frontend
pnpm dev

# Frontend production build
cd fairspace/frontend
pnpm build

# Run Supabase seed SQL
cd fairspace/backend
pnpm db:run
```

## AI Assistant Notes

The student AI assistant is intentionally scoped to room booking tasks. It can:

- Suggest the best time for a requested date.
- Filter by group size and room needs such as display screen or projector.
- Prepare a booking confirmation card.
- Continue follow-up booking context in the same chat.

It should not disclose other students' private details. Admin AI features were intentionally removed for now so the product focuses on a clean student assistant.

## Deployment Notes

The app can be deployed on Vercel from the `fairspace/frontend` folder. Make sure the Vercel project has these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`

If Vercel shows a warning about `outputFileTracingRoot` and `turbopack.root`, it is safe to leave as long as the build completes. It is a configuration warning, not a runtime failure.

## Future Improvements

- Add Supabase Row Level Security policies for production-grade authorization.
- Store reports, mailbox messages, and bans in dedicated persisted tables.
- Add email reminders for booking confirmation and missed check-ins.
- Add automated tests for booking conflict logic and AI intent parsing.
- Add real-time updates when another user books a slot.
