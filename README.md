# FairSpace AI

FairSpace AI is a university discussion-room booking system built for the Shortcut Asia Internship Challenge 2026 under the **Simple Booking System** topic. It helps students find and reserve shared campus rooms, while giving admins tools to manage room availability, pending long-booking requests, reports, and user access.

The project is designed as a portfolio-ready product rather than a throwaway prototype: it includes authentication, role-based views, a calendar booking flow, booking conflict checks, profile photos, reports, admin actions, and a student AI assistant that can recommend and prepare room bookings.

## Live Demo

Add your deployed Vercel URL here before submission:

```txt
https://your-vercel-app-url.vercel.app
```

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **UI:** Tailwind CSS, Radix UI components, Lucide icons
- **Database/Auth:** Supabase Auth + Supabase Postgres
- **AI:** Gemini 2.5 Flash through a server-side Next.js API route
- **Deployment:** Vercel

## Core Features

1. **Student room booking calendar**
   - Students book rooms through a calendar timetable.
   - Empty slots open a booking form.
   - Occupied slots show booking details, attendee count, and booking owner profile information.
   - Standard bookings are limited to 2 hours.

2. **Booking management**
   - Students can view and manage their own schedule.
   - Students can edit/cancel their own bookings.
   - Admins can remove bookings, but must give a reason so the student can be notified.
   - Pending longer bookings appear in the admin queue.

3. **Admin control panel**
   - Admins have a different interface from students.
   - Admins can edit rooms, capacities, amenities, and maintenance status.
   - Admins can review reports, resolve tickets, approve/reject long booking requests, and ban users.

4. **Reports and mailbox**
   - Students can report room misuse, booking issues, hogging, and other problems.
   - Reports can include a photo attachment in the UI flow.
   - Admin replies and booking-removal messages appear in the mailbox.

5. **Student AI booking assistant**
   - The AI assistant is only available to students.
   - It can recommend the best slot for a requested date, group size, and requirement such as a screen/projector.
   - It remembers recent booking context in the chat, so follow-ups like "2 hours, can?" and "yes please" can continue the same booking flow.
   - It prepares a booking button, but the student must click to confirm.
   - It refuses to disclose other students' private booking details.

## Why I Built This

I chose the Simple Booking System topic because shared study rooms are a common student problem: people need to know what is free, avoid clashing bookings, request longer slots when necessary, and report misuse when rooms are occupied by the wrong group.

I wanted the project to feel realistic for a university environment, not just a CRUD demo. That is why the app includes student/admin roles, profile photos, maintenance states, admin approval, reports, and a chatbot-style AI assistant.

## Main Technical Decisions

- **Next.js App Router:** I used Next.js so the project can be deployed easily on Vercel and keep frontend pages plus API routes in one codebase.
- **Supabase:** Supabase gives authentication and Postgres quickly, which fits the challenge timeline while still being close to real production architecture.
- **Role-based UX:** Students and admins have different capabilities. For example, admins cannot book slots from the student flow, and students cannot access admin queue/report/ban features.
- **Calendar-first booking:** I removed the separate manual booking tab and made the calendar the main booking surface because it is easier for students to understand availability visually.
- **Hybrid AI logic:** The AI route uses Gemini when available, but deterministic planner logic handles booking recommendations and booking-button payloads. This avoids unsafe hallucinated bookings and keeps the core booking flow accurate even if the free Gemini quota is limited.

## Architecture Overview

```mermaid
flowchart TD
  Student["Student user"] --> Auth["Supabase Auth"]
  Admin["Admin user"] --> Auth
  Auth --> App["Next.js FairSpace UI"]
  App --> Calendar["Calendar + Schedule + Rooms"]
  App --> API["/api/ai-booking-chat"]
  API --> Planner["Booking planner logic"]
  API --> Gemini["Gemini API optional"]
  App --> DB["Supabase Postgres"]
  DB --> Rooms["fairspace_rooms"]
  DB --> Bookings["fairspace_bookings"]
  DB --> Profiles["fairspace_profiles"]
```

## Key Flow: Student Booking

```mermaid
flowchart TD
  A["Student opens calendar"] --> B["Select date"]
  B --> C["Click empty room/time slot"]
  C --> D["Fill title, attendees, duration"]
  D --> E{"Duration <= 2 hours?"}
  E -->|Yes| F["Create confirmed booking"]
  E -->|No| G["Send pending admin request"]
  F --> H["Booking appears in calendar and schedule"]
  G --> I["Admin reviews in Admin Queue"]
```

## Key Flow: AI Booking Assistant

```mermaid
flowchart TD
  A["Student asks for suggestion"] --> B["Parse date, group size, room needs"]
  B --> C["Check rooms, capacity, maintenance, conflicts"]
  C --> D["Recommend best slot"]
  D --> E["Student asks to book"]
  E --> F["Return booking confirmation card"]
  F --> G["Student clicks Book this slot"]
  G --> H["Booking is created"]
```

## Challenges Faced

- **Role confusion:** Early versions allowed a stored local role to make a student account appear as admin. I fixed this by checking Supabase metadata/profile role and rejecting mismatched portal logins.
- **AI felt too static:** The first chatbot fallback replied too quickly and repeated fixed messages. I added a typing delay, response typing effect, and better follow-up handling.
- **AI context drift:** The assistant accidentally read its own previous replies as booking context, which caused wrong attendee counts. I fixed this by using only recent user messages for memory.
- **Date parsing:** Natural dates such as "5th of June" and "June 5" needed careful parsing so the assistant would not fall back to the selected calendar date.
- **Mobile responsiveness:** Header actions needed mobile-specific sizing so the sign-out button would not overflow on phones.

## Current Limitations

- The AI assistant depends on `GEMINI_API_KEY`; if Gemini quota is exceeded, the local planner still handles booking suggestions and actions.
- Some admin features such as report replies and bans are currently implemented in the UI/demo flow and can be extended further with dedicated database tables.
- Email notifications are represented through an in-app mailbox flow; production email delivery would be a future improvement.

## Setup Instructions

### 1. Clone and install

```bash
git clone <your-github-repo-url>
cd Simple-Booking-System/fairspace/frontend
pnpm install
```

### 2. Configure environment variables

Create `fairspace/frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

For database seeding, create `fairspace/backend/.env.local`:

```env
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
```

### 3. Seed Supabase tables

```bash
cd ../backend
pnpm install
pnpm db:run
```

### 4. Run the app locally

```bash
cd ../frontend
pnpm dev
```

Open:

```txt
http://localhost:3000
```

### 5. Build checks

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

## Demo Video Guide

Recommended length: 3-5 minutes.

1. **Opening, 20 seconds**
   - Say: "This is FairSpace AI, a university discussion-room booking system for the Shortcut Asia Simple Booking System challenge."
   - Mention the target users: students and admins.

2. **Student signup/login, 30 seconds**
   - Show the student/admin portal choice.
   - Explain that students and admins have separate permissions.

3. **Calendar booking, 60 seconds**
   - Go to the Calendar tab.
   - Select a date.
   - Click an empty slot.
   - Create a normal booking under 2 hours.
   - Show the booking appearing in the calendar/schedule.

4. **AI assistant, 60-90 seconds**
   - Ask: "Can you suggest me some booking slots on June 6 with 5 people and a big screen?"
   - Show the AI recommending rooms with screens/projectors.
   - Ask: "Book a slot for me."
   - Show the booking confirmation card.
   - Click the booking button.

5. **Reports and profile, 30-45 seconds**
   - Click an occupied booking and show booking details.
   - Show report flow.
   - Show profile photo/name update.

6. **Admin flow, 60 seconds**
   - Login as admin.
   - Show that admins have different tabs.
   - Edit a room capacity/amenity/status.
   - Review pending long booking requests or reports.
   - Remove a booking with a reason.

7. **Closing, 20 seconds**
   - Explain one challenge you solved: AI context memory, role-based access, or booking conflict handling.
   - Mention what you would improve with more time: email notifications, richer analytics, and real-time updates.

## Submission Checklist

- [ ] Deployed app URL
- [ ] Public GitHub repository or shared private repo access
- [ ] README completed with setup and approach
- [ ] Demo video uploaded to YouTube unlisted or Google Drive
- [ ] Submit through: https://forms.gle/bTCqepJRpJYqYvkH6
