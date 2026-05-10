# FairSpace — Fair-use Study Room Booking System

Portfolio project for the **Shortcut Asia Internship Challenge 2026**.

## Tech stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (Auth + Postgres + RLS)

## Local development

From this folder:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Environment variables

Create `.env.local` (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Supabase schema

Run `supabase/001_init.sql` in the Supabase SQL editor to create:

- `profiles`, `rooms`, `bookings`, `booking_participants`
- RLS policies
- trigger to auto-create `profiles` rows on signup

