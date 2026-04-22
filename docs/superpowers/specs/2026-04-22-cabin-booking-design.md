# Les Tsabloz — Cabin Booking App Design Spec

**Date:** 2026-04-22
**Status:** Approved

---

## Overview

A minimalist, single-page web application for managing bookings for a private cabin. Guests access the site behind a shared password, browse availability, and submit booking requests. An admin reviews and approves or rejects requests via a separate protected dashboard.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix UI) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (admin) + httpOnly cookie (guests) |
| Email | Resend |
| Theming | next-themes (light/dark) |
| Icons | lucide-react |

---

## Routes & Architecture

| Route | Access | Purpose |
|---|---|---|
| `/login` | Public | Global shared password wall |
| `/` | Guest session cookie | Main app (Book + Cabin Info tabs) |
| `/admin` | Supabase Auth session | Admin dashboard |
| `/api/auth/login` | Public | POST: validate shared password, set cookie |
| `/api/auth/logout` | Guest | POST: clear session cookie |
| `/api/bookings` | Guest | POST: submit a booking request |
| `/api/bookings/[id]/ical` | Guest | GET: download `.ics` for a specific booking |
| `/api/admin/bookings/[id]` | Admin | PATCH: approve or reject a booking |
| `/api/ical` | Token-gated | GET: full iCal feed of approved bookings |

**Middleware** runs on all routes and enforces:
1. Guest session cookie on all routes except `/login` and `/api/auth/login`
2. Valid Supabase Auth session on `/admin` and `/api/admin/*` routes

---

## Database Schema (Supabase)

### `bookings` table

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, auto-generated |
| `name` | `text` | Guest full name |
| `email` | `text` | Guest email |
| `start_date` | `date` | Check-in date |
| `end_date` | `date` | Check-out date |
| `message` | `text` | Optional note from guest |
| `status` | `text` | `'pending'` \| `'approved'` \| `'rejected'`, default `'pending'` |
| `ical_uid` | `uuid` | Stable ID for iCal event deduplication |
| `created_at` | `timestamptz` | Auto-generated |

All database access goes through API routes using the Supabase service role key. RLS blocks direct client access entirely — no complex policies needed.

---

## Auth Flow

### Guest (shared password)
1. Unauthenticated request → middleware redirects to `/login`
2. `/login`: single password input, submit button
3. POST `/api/auth/login` → server compares input against `SITE_PASSWORD` env var using `bcryptjs`
4. On match: sets signed httpOnly cookie (`guest_session`) with 30-day expiry
5. Middleware validates cookie on subsequent requests

### Admin
1. `/admin` shows a dedicated login form (email + password)
2. Uses Supabase Auth via `@supabase/ssr` for server-side session management
3. Middleware checks Supabase session on `/admin` and `/api/admin/*` routes
4. API routes re-verify the Supabase session server-side before any DB mutation

The two auth layers are fully independent.

---

## UI / UX

### `/login`
- Centered card, cabin name in serif font, single password input, submit button
- Dark mode aware

### `/` — Main page
Top bar: cabin name (serif) + theme toggle (sun/moon icon) + logout link

**Two tabs (shadcn/ui `Tabs`):**

#### Tab 1: Book
Two-column layout on desktop, stacked on mobile:
- **Left — Calendar**: Monthly `Calendar` component showing approved bookings as highlighted/blocked date ranges. Navigation arrows for month browsing. Clicking a date range selects it and auto-populates the form's check-in/check-out fields.
- **Right — Booking Form**: Fields: Name, Email, Check-in (auto-filled from calendar), Check-out (auto-filled from calendar), Message (optional `Textarea`). On submit: inline success message + "Add to your Calendar" button that downloads a `.ics` file for their booking.

#### Tab 2: The Cabin
- Photo grid (static images)
- Description paragraph
- House rules list

### `/admin` — Admin Dashboard
- Login page: `Card` with email + password inputs, Supabase Auth
- Dashboard after login:
  - iCal feed URL at the top with a one-click copy button
  - Bookings grouped: **Pending** (top, highlighted), **Approved**, **Rejected**
  - Each booking: `Card` with name, email, date range, message, status `Badge`
  - Pending cards: Approve (sage green) / Reject (red) `Button` — instant PATCH request

---

## Email & Calendar

### Email (Resend)
- Triggered in `/api/bookings` POST handler after successful DB insert
- Sent to `OWNER_EMAIL` env var
- Content: guest name, email, dates, optional message, link to `/admin`
- Simple inline-styled HTML — no email framework

### Guest `.ics` download
- Route: `/api/bookings/[id]/ical`
- Returns a single `.ics` file for the guest's specific booking
- Uses `ical_uid` for stable event identity (updates replace, not duplicate)
- Works with Google Calendar, Apple Calendar, Outlook

### Admin iCal feed
- Route: `/api/ical?token=SECRET` (token stored in `ICAL_SECRET` env var)
- Returns full `.ics` feed of all approved bookings
- Admin subscribes to this URL once in Google Calendar → live auto-sync

---

## Design

### Color Palette

| Token | Light | Dark |
|---|---|---|
| Background | `stone-50` | `stone-900` |
| Surface | `white` | `stone-800` |
| Border | `stone-200` | `stone-700` |
| Text primary | `stone-900` | `stone-100` |
| Text secondary | `stone-500` | `stone-400` |
| Accent | `#7C9A7E` (sage green) | `#8FAF91` |

### Typography
- **Headings**: Playfair Display (via `next/font/google`) — cabin name, section titles
- **Body/UI**: Geist Sans (already in project)

### Status Badges
- Pending: amber
- Approved: sage green
- Rejected: red/stone

### Dark Mode
- Managed by `next-themes` (`ThemeProvider` wrapping the app)
- Respects system preference by default, user-toggleable via icon button in top bar
- All shadcn/ui components support dark mode via Tailwind `dark:` classes

### Layout
- Max width `4xl`, centered, generous whitespace
- Mobile-first responsive: single column, calendar scales down, form fields full-width
- Flat surfaces — no heavy shadows or gradients

### shadcn/ui Components Used
`Tabs`, `Calendar`, `Card`, `Button`, `Input`, `Textarea`, `Badge`, `Popover`, `Dialog`

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `SITE_PASSWORD` | Bcrypt hash of the shared guest password |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `RESEND_API_KEY` | Resend API key |
| `OWNER_EMAIL` | Cabin owner's email for notifications |
| `ICAL_SECRET` | Token to gate the admin iCal feed |
| `COOKIE_SECRET` | Secret for signing the guest session cookie |
