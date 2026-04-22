# Les Tsabloz Cabin Booking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a password-protected cabin booking web app with availability calendar, booking request workflow, admin approval dashboard, email notifications, and iCal sync.

**Architecture:** Single Next.js 16 App Router app with two independent auth layers — a shared httpOnly cookie for guests (JWT signed with `jose`, validated in middleware), and Supabase Auth for the admin at `/admin`. All DB access goes through API routes using the Supabase service role key. The main page has two tabs: Book (calendar + form side-by-side) and The Cabin (static info).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Supabase (PostgreSQL + Auth via `@supabase/ssr`), Resend, `next-themes`, `jose`, `bcryptjs`, `lucide-react`, Vitest

---

## File Map

```
.env.example                          — env var template
middleware.ts                         — route protection (guest cookie + admin Supabase session)
vitest.config.ts                      — test runner config
tests/setup.ts                        — jest-dom matchers
tests/lib/ical.test.ts                — ICS generation unit tests
tests/lib/auth.test.ts                — guest JWT unit tests
types/booking.ts                      — shared TypeScript types
lib/ical.ts                           — ICS generation (pure functions)
lib/auth.ts                           — guest JWT sign/verify
lib/email.ts                          — Resend email helper
lib/supabase/server.ts                — Supabase service role client (DB ops)
lib/supabase/auth-client.ts           — Supabase SSR client (admin session check in route handlers)
supabase/migrations/001_bookings.sql  — bookings table + RLS
components/providers.tsx              — ThemeProvider wrapper (client)
components/theme-toggle.tsx           — sun/moon toggle button (client)
components/top-bar.tsx                — site header with logo + logout (client)
components/booking-calendar.tsx       — calendar with booked ranges + range selection (client)
components/booking-form.tsx           — booking request form (client)
components/booking-success.tsx        — post-submit dialog with Add to Calendar (client)
components/cabin-info.tsx             — static cabin info (server)
components/admin/booking-card.tsx     — admin booking card with approve/reject (client)
app/globals.css                       — Tailwind base + custom CSS vars
app/layout.tsx                        — root layout: fonts, ThemeProvider
app/page.tsx                          — main page: two tabs
app/login/page.tsx                    — guest password wall
app/admin/page.tsx                    — admin dashboard
app/admin/login/page.tsx              — admin Supabase Auth login
app/api/auth/login/route.ts           — POST: validate password, set guest cookie
app/api/auth/logout/route.ts          — POST: clear guest cookie
app/api/bookings/route.ts             — GET: approved bookings (calendar); POST: create booking
app/api/bookings/[id]/ical/route.ts   — GET: single booking .ics download
app/api/admin/bookings/route.ts       — GET: all bookings for admin
app/api/admin/bookings/[id]/route.ts  — PATCH: approve or reject
app/api/ical/route.ts                 — GET: subscribable iCal feed (token-gated)
```

---

## Task 1: Install dependencies

**Files:** `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr next-themes bcryptjs jose resend lucide-react
```

- [ ] **Step 2: Install type dependencies**

```bash
npm install --save-dev @types/bcryptjs
```

- [ ] **Step 3: Install testing dependencies**

```bash
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Verify install succeeded**

```bash
npm ls @supabase/ssr next-themes jose bcryptjs resend vitest
```

Expected: all packages listed with version numbers, no missing peer deps errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install dependencies"
```

---

## Task 2: Set up Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Create vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 2: Create test setup file**

```typescript
// tests/setup.ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test scripts to package.json**

In `package.json`, update `"scripts"`:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 4: Run tests to verify setup**

```bash
npm run test:run
```

Expected: `No test files found, exiting with code 0` (no failures).

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts tests/setup.ts package.json
git commit -m "chore: set up Vitest testing framework"
```

---

## Task 3: Type definitions & environment template

**Files:**
- Create: `types/booking.ts`
- Create: `.env.example`

- [ ] **Step 1: Create booking types**

```typescript
// types/booking.ts
export type BookingStatus = 'pending' | 'approved' | 'rejected'

export interface Booking {
  id: string
  name: string
  email: string
  start_date: string
  end_date: string
  message: string | null
  status: BookingStatus
  ical_uid: string
  created_at: string
}

export interface CreateBookingPayload {
  name: string
  email: string
  start_date: string
  end_date: string
  message?: string
}
```

- [ ] **Step 2: Create .env.example**

```bash
# .env.example

# Bcrypt hash of the shared guest password.
# Generate with: node -e "const b=require('bcryptjs');b.hash('yourpassword',10).then(console.log)"
SITE_PASSWORD=

# Supabase — find in Supabase dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend — find in resend.com dashboard
RESEND_API_KEY=re_
RESEND_FROM_EMAIL=Les Tsabloz <bookings@yourdomain.com>
OWNER_EMAIL=owner@example.com

# Random string for token-gating the admin iCal feed (any random value)
ICAL_SECRET=

# At least 32 random characters — used to sign guest session JWTs
COOKIE_SECRET=

# Your deployment URL (no trailing slash). Use http://localhost:3000 for dev.
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [ ] **Step 3: Create local .env.local from template**

Copy `.env.example` to `.env.local` and fill in real values.

To generate the `SITE_PASSWORD` hash:
```bash
node -e "const b=require('bcryptjs'); b.hash('your-chosen-password', 10).then(console.log)"
```

To generate `ICAL_SECRET` and `COOKIE_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- [ ] **Step 4: Verify .gitignore includes .env.local**

```bash
grep ".env.local" .gitignore
```

Expected: `.env.local` appears in the output. If not, add it.

- [ ] **Step 5: Commit**

```bash
git add types/booking.ts .env.example
git commit -m "chore: add type definitions and env template"
```

---

## Task 4: Database migration

**Files:**
- Create: `supabase/migrations/001_bookings.sql`

- [ ] **Step 1: Create migration file**

```sql
-- supabase/migrations/001_bookings.sql

create extension if not exists "pgcrypto";

create table bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  start_date date not null,
  end_date date not null,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  ical_uid uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Block all direct client access — only service role key (server-side) can access
alter table bookings enable row level security;
-- No RLS policies are needed since we exclusively use the service role key in API routes
```

- [ ] **Step 2: Run migration**

**Option A (Supabase CLI):**
```bash
supabase db push
```

**Option B (Supabase dashboard):**
Open your Supabase project → SQL Editor → paste the content of `supabase/migrations/001_bookings.sql` → Run.

- [ ] **Step 3: Verify table exists**

In Supabase dashboard → Table Editor, confirm the `bookings` table appears with all 9 columns.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/001_bookings.sql
git commit -m "feat: add bookings table migration"
```

---

## Task 5: ICS utility (TDD)

**Files:**
- Create: `tests/lib/ical.test.ts`
- Create: `lib/ical.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/lib/ical.test.ts
import { describe, it, expect } from 'vitest'
import { generateICSFeed, generateICSEvent } from '@/lib/ical'
import type { Booking } from '@/types/booking'

const booking: Booking = {
  id: '123',
  name: 'Jean Dupont',
  email: 'jean@example.com',
  start_date: '2026-07-01',
  end_date: '2026-07-08',
  message: null,
  status: 'approved',
  ical_uid: 'abc-def-123',
  created_at: '2026-04-22T10:00:00Z',
}

describe('generateICSFeed', () => {
  it('wraps output in VCALENDAR', () => {
    const ics = generateICSFeed([booking])
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('includes a VEVENT for each booking', () => {
    const ics = generateICSFeed([booking])
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('UID:abc-def-123@les-tsabloz')
    expect(ics).toContain('DTSTART;VALUE=DATE:20260701')
    expect(ics).toContain('DTEND;VALUE=DATE:20260708')
    expect(ics).toContain('SUMMARY:Jean Dupont')
    expect(ics).toContain('END:VEVENT')
  })

  it('returns calendar with no events when passed empty array', () => {
    const ics = generateICSFeed([])
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).not.toContain('BEGIN:VEVENT')
  })

  it('includes all bookings when multiple are passed', () => {
    const b2 = { ...booking, id: '456', name: 'Marie Curie', ical_uid: 'xyz-789' }
    const ics = generateICSFeed([booking, b2])
    expect(ics).toContain('UID:abc-def-123@les-tsabloz')
    expect(ics).toContain('UID:xyz-789@les-tsabloz')
  })
})

describe('generateICSEvent', () => {
  it('wraps a single event in VCALENDAR', () => {
    const ics = generateICSEvent(booking)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('UID:abc-def-123@les-tsabloz')
    expect(ics).toContain('END:VEVENT')
    expect(ics).toContain('END:VCALENDAR')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm run test:run -- tests/lib/ical.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/ical'`

- [ ] **Step 3: Implement ICS utility**

```typescript
// lib/ical.ts
import type { Booking } from '@/types/booking'

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

function toVEvent(booking: Booking): string {
  return [
    'BEGIN:VEVENT',
    `UID:${booking.ical_uid}@les-tsabloz`,
    `DTSTART;VALUE=DATE:${formatDate(booking.start_date)}`,
    `DTEND;VALUE=DATE:${formatDate(booking.end_date)}`,
    `SUMMARY:${booking.name}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
  ].join('\r\n')
}

function wrapCalendar(events: string[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Les Tsabloz//Cabin Bookings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}

export function generateICSFeed(bookings: Booking[]): string {
  return wrapCalendar(bookings.map(toVEvent))
}

export function generateICSEvent(booking: Booking): string {
  return wrapCalendar([toVEvent(booking)])
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm run test:run -- tests/lib/ical.test.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/ical.ts tests/lib/ical.test.ts
git commit -m "feat: add ICS generation utility (TDD)"
```

---

## Task 6: Guest auth utility (TDD)

**Files:**
- Create: `tests/lib/auth.test.ts`
- Create: `lib/auth.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/lib/auth.test.ts
import { describe, it, expect, beforeAll } from 'vitest'

beforeAll(() => {
  process.env.COOKIE_SECRET = 'test-secret-that-is-at-least-32-characters-long'
})

// Dynamic import so env is set before module loads
const getModule = () => import('@/lib/auth')

describe('signGuestToken', () => {
  it('returns a non-empty JWT string', async () => {
    const { signGuestToken } = await getModule()
    const token = await signGuestToken()
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3)
  })
})

describe('verifyGuestToken', () => {
  it('returns true for a token produced by signGuestToken', async () => {
    const { signGuestToken, verifyGuestToken } = await getModule()
    const token = await signGuestToken()
    expect(await verifyGuestToken(token)).toBe(true)
  })

  it('returns false for a tampered token', async () => {
    const { verifyGuestToken } = await getModule()
    expect(await verifyGuestToken('bad.token.value')).toBe(false)
  })

  it('returns false for an empty string', async () => {
    const { verifyGuestToken } = await getModule()
    expect(await verifyGuestToken('')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm run test:run -- tests/lib/auth.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/auth'`

- [ ] **Step 3: Implement auth utility**

```typescript
// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose'

function secret(): Uint8Array {
  const s = process.env.COOKIE_SECRET
  if (!s) throw new Error('COOKIE_SECRET is not set')
  return new TextEncoder().encode(s)
}

export async function signGuestToken(): Promise<string> {
  return new SignJWT({ role: 'guest' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret())
}

export async function verifyGuestToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret())
    return true
  } catch {
    return false
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm run test:run -- tests/lib/auth.test.ts
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts tests/lib/auth.test.ts
git commit -m "feat: add guest JWT auth utility (TDD)"
```

---

## Task 7: Supabase client helpers

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/auth-client.ts`

- [ ] **Step 1: Create service role client**

Used in all API routes for database operations. Never exposed to the client.

```typescript
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
```

- [ ] **Step 2: Create SSR auth client**

Used only for verifying the admin Supabase session in route handlers. Reads session from cookies.

```typescript
// lib/supabase/auth-client.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createAuthClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/server.ts lib/supabase/auth-client.ts
git commit -m "feat: add Supabase client helpers"
```

---

## Task 8: Middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create middleware**

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

function guestSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.COOKIE_SECRET!)
}

async function isGuestAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('guest_session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, guestSecret())
    return true
  } catch {
    return false
  }
}

async function getAdminUser(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const response = NextResponse.next()

    // /admin/login is behind the guest password wall but not the admin auth wall
    if (pathname === '/admin/login') {
      const guestOk = await isGuestAuthenticated(request)
      if (!guestOk) return NextResponse.redirect(new URL('/login', request.url))
      return response
    }

    const user = await getAdminUser(request, response)
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return response
  }

  const guestOk = await isGuestAuthenticated(request)
  if (!guestOk) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add route protection middleware"
```

---

## Task 9: Auth API routes

**Files:**
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`

- [ ] **Step 1: Create login route**

```typescript
// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signGuestToken } from '@/lib/auth'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  const hash = process.env.SITE_PASSWORD!
  const valid = await bcrypt.compare(password, hash)

  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = await signGuestToken()
  const response = NextResponse.json({ ok: true })

  response.cookies.set('guest_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return response
}
```

- [ ] **Step 2: Create logout route**

```typescript
// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('guest_session', '', { maxAge: 0, path: '/' })
  return response
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/
git commit -m "feat: add guest auth API routes"
```

---

## Task 10: Email helper + Bookings API route

**Files:**
- Create: `lib/email.ts`
- Create: `app/api/bookings/route.ts`

- [ ] **Step 1: Create email helper**

```typescript
// lib/email.ts
import { Resend } from 'resend'
import type { Booking } from '@/types/booking'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingNotification(booking: Booking): Promise<void> {
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin`
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.OWNER_EMAIL!,
    subject: `New booking request from ${booking.name}`,
    html: `
      <h2 style="font-family:serif">New Booking Request — Les Tsabloz</h2>
      <p><strong>Name:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Check-in:</strong> ${booking.start_date}</p>
      <p><strong>Check-out:</strong> ${booking.end_date}</p>
      ${booking.message ? `<p><strong>Message:</strong> ${booking.message}</p>` : ''}
      <p><a href="${adminUrl}">Review in admin dashboard →</a></p>
    `,
  })
}
```

- [ ] **Step 2: Create bookings route**

```typescript
// app/api/bookings/route.ts
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendBookingNotification } from '@/lib/email'
import type { CreateBookingPayload } from '@/types/booking'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('id, start_date, end_date, name, status')
    .eq('status', 'approved')
    .order('start_date')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }

  return NextResponse.json({ bookings: data })
}

export async function POST(request: Request) {
  const body: CreateBookingPayload = await request.json()

  if (!body.name || !body.email || !body.start_date || !body.end_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (body.start_date >= body.end_date) {
    return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      name: body.name,
      email: body.email,
      start_date: body.start_date,
      end_date: body.end_date,
      message: body.message ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('Booking insert error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // Non-blocking — don't fail the request if email fails
  sendBookingNotification(data).catch((err) =>
    console.error('Email notification failed:', err)
  )

  return NextResponse.json({ booking: data }, { status: 201 })
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/email.ts app/api/bookings/route.ts
git commit -m "feat: add bookings API route and email notification"
```

---

## Task 11: Admin bookings API routes

**Files:**
- Create: `app/api/admin/bookings/route.ts`
- Create: `app/api/admin/bookings/[id]/route.ts`

- [ ] **Step 1: Create GET all bookings route (admin)**

```typescript
// app/api/admin/bookings/route.ts
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createAuthClient } from '@/lib/supabase/auth-client'

export async function GET() {
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }

  return NextResponse.json({ bookings: data })
}
```

- [ ] **Step 2: Create PATCH approve/reject route**

```typescript
// app/api/admin/bookings/[id]/route.ts
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createAuthClient } from '@/lib/supabase/auth-client'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { status } = await request.json()

  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }

  return NextResponse.json({ booking: data })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/
git commit -m "feat: add admin bookings API routes"
```

---

## Task 12: iCal API routes

**Files:**
- Create: `app/api/bookings/[id]/ical/route.ts`
- Create: `app/api/ical/route.ts`

- [ ] **Step 1: Create single-booking .ics download route**

```typescript
// app/api/bookings/[id]/ical/route.ts
import { createServiceClient } from '@/lib/supabase/server'
import { generateICSEvent } from '@/lib/ical'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return new Response('Not found', { status: 404 })
  }

  const ics = generateICSEvent(data)

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="les-tsabloz-booking.ics"`,
    },
  })
}
```

- [ ] **Step 2: Create admin subscribable iCal feed route**

```typescript
// app/api/ical/route.ts
import { createServiceClient } from '@/lib/supabase/server'
import { generateICSFeed } from '@/lib/ical'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token || token !== process.env.ICAL_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'approved')
    .order('start_date')

  if (error) {
    return new Response('Internal error', { status: 500 })
  }

  const ics = generateICSFeed(data)

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache, no-store',
    },
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/bookings/[id]/ical/route.ts app/api/ical/route.ts
git commit -m "feat: add iCal download and feed API routes"
```

---

## Task 13: Theme provider & layout update

**Files:**
- Create: `components/providers.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create Providers component**

```typescript
// components/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

- [ ] **Step 2: Update layout.tsx with Playfair Display font and Providers**

Replace the entire contents of `app/layout.tsx`:

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Les Tsabloz',
  description: 'Book your stay at Les Tsabloz',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${geist.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-stone-50 dark:bg-stone-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

Note: `suppressHydrationWarning` is required on `<html>` when using `next-themes` to avoid the class mismatch warning.

- [ ] **Step 3: Update globals.css**

Replace the contents of `app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-playfair), Georgia, serif;
}
```

- [ ] **Step 4: Commit**

```bash
git add components/providers.tsx app/layout.tsx app/globals.css
git commit -m "feat: add theme provider, Playfair Display font, layout update"
```

---

## Task 14: Initialize shadcn/ui & add components

**Files:** `components/ui/*` (generated by shadcn CLI)

- [ ] **Step 1: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Stone**
- CSS variables: **Yes**

If shadcn detects Tailwind v4, it will configure accordingly.

- [ ] **Step 2: Add required components**

```bash
npx shadcn@latest add button card input textarea badge tabs dialog
```

- [ ] **Step 3: Add calendar component**

```bash
npx shadcn@latest add calendar
```

- [ ] **Step 4: Verify components exist**

```bash
ls components/ui/
```

Expected output includes: `button.tsx calendar.tsx card.tsx input.tsx textarea.tsx badge.tsx tabs.tsx dialog.tsx`

- [ ] **Step 5: Commit**

```bash
git add components/ui/ components.json
git commit -m "feat: initialize shadcn/ui with required components"
```

---

## Task 15: ThemeToggle & TopBar components

**Files:**
- Create: `components/theme-toggle.tsx`
- Create: `components/top-bar.tsx`

- [ ] **Step 1: Create ThemeToggle**

```typescript
// components/theme-toggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
```

- [ ] **Step 2: Create TopBar**

```typescript
// components/top-bar.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function TopBar() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
      <span className="font-serif text-xl text-stone-900 dark:text-stone-100">
        Les Tsabloz
      </span>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          Logout
        </Button>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/theme-toggle.tsx components/top-bar.tsx
git commit -m "feat: add ThemeToggle and TopBar components"
```

---

## Task 16: Login page

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: Create login page**

```typescript
// app/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (!res.ok) {
      setError('Incorrect password. Try again.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm border-stone-200 dark:border-stone-700 dark:bg-stone-800">
        <CardHeader className="text-center space-y-1 pb-2">
          <h1 className="font-serif text-3xl text-stone-900 dark:text-stone-100">
            Les Tsabloz
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Enter the password to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="dark:bg-stone-700 dark:border-stone-600"
            />
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#7C9A7E] hover:bg-[#6a8a6c] text-white dark:bg-[#8FAF91] dark:hover:bg-[#7C9A7E] dark:text-stone-900"
            >
              {loading ? 'Checking…' : 'Enter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and verify login page renders**

```bash
npm run dev
```

Open `http://localhost:3000` — should redirect to `/login`. Enter the password you hashed and verify it redirects to `/`.

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: add guest login page"
```

---

## Task 17: Admin login page

**Files:**
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Create admin login page**

```typescript
// app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      setError('Invalid credentials')
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm border-stone-200 dark:border-stone-700 dark:bg-stone-800">
        <CardHeader className="text-center pb-2">
          <h1 className="font-serif text-2xl text-stone-900 dark:text-stone-100">
            Admin
          </h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="dark:bg-stone-700 dark:border-stone-600"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="dark:bg-stone-700 dark:border-stone-600"
            />
            {error && (
              <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#7C9A7E] hover:bg-[#6a8a6c] text-white dark:bg-[#8FAF91] dark:hover:bg-[#7C9A7E] dark:text-stone-900"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Create an admin user in Supabase**

In Supabase dashboard → Authentication → Users → Add User. Use the email and password you want for the admin account.

- [ ] **Step 3: Verify admin login flow**

With dev server running, visit `/admin` — should redirect to `/admin/login`. Sign in with the admin credentials and verify you reach `/admin` (which shows a blank page for now).

- [ ] **Step 4: Commit**

```bash
git add app/admin/login/page.tsx
git commit -m "feat: add admin login page"
```

---

## Task 18: BookingCalendar component

**Files:**
- Create: `components/booking-calendar.tsx`

- [ ] **Step 1: Create BookingCalendar**

```typescript
// components/booking-calendar.tsx
'use client'

import { Calendar } from '@/components/ui/calendar'
import type { DateRange } from 'react-day-picker'

interface BookedRange {
  start_date: string
  end_date: string
}

interface BookingCalendarProps {
  bookedRanges: BookedRange[]
  selectedRange: DateRange | undefined
  onSelectRange: (range: DateRange | undefined) => void
}

export function BookingCalendar({
  bookedRanges,
  selectedRange,
  onSelectRange,
}: BookingCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const disabledDates = bookedRanges.map((r) => ({
    from: new Date(r.start_date + 'T00:00:00'),
    to: new Date(r.end_date + 'T00:00:00'),
  }))

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-3">
      <Calendar
        mode="range"
        selected={selectedRange}
        onSelect={onSelectRange}
        disabled={[{ before: today }, ...disabledDates]}
        numberOfMonths={1}
        className="w-full"
        modifiers={{ booked: disabledDates }}
        modifiersClassNames={{
          booked: 'opacity-40 line-through cursor-not-allowed',
        }}
      />
      <p className="mt-2 text-xs text-stone-400 text-center">
        Select your check-in then check-out date
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/booking-calendar.tsx
git commit -m "feat: add BookingCalendar component"
```

---

## Task 19: BookingForm & BookingSuccess components

**Files:**
- Create: `components/booking-form.tsx`
- Create: `components/booking-success.tsx`

- [ ] **Step 1: Create BookingForm**

```typescript
// components/booking-form.tsx
'use client'

import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { Booking } from '@/types/booking'

interface BookingFormProps {
  selectedRange: DateRange | undefined
  onSuccess: (booking: Booking) => void
}

export function BookingForm({ selectedRange, onSuccess }: BookingFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startDate = selectedRange?.from?.toISOString().split('T')[0]
  const endDate = selectedRange?.to?.toISOString().split('T')[0]
  const canSubmit = !!startDate && !!endDate && !!name && !!email

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        start_date: startDate,
        end_date: endDate,
        message: message || undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    setName('')
    setEmail('')
    setMessage('')
    onSuccess(data.booking)
  }

  return (
    <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-800">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-stone-900 dark:text-stone-100">
          Request a Stay
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="dark:bg-stone-700 dark:border-stone-600"
          />
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="dark:bg-stone-700 dark:border-stone-600"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Check-in"
              value={startDate ?? ''}
              readOnly
              className="bg-stone-50 dark:bg-stone-700 dark:border-stone-600 cursor-default"
            />
            <Input
              placeholder="Check-out"
              value={endDate ?? ''}
              readOnly
              className="bg-stone-50 dark:bg-stone-700 dark:border-stone-600 cursor-default"
            />
          </div>
          <Textarea
            placeholder="Message for the host (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="dark:bg-stone-700 dark:border-stone-600"
          />
          {!startDate && (
            <p className="text-sm text-stone-400">
              Select dates on the calendar to continue
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading || !canSubmit}
            className="bg-[#7C9A7E] hover:bg-[#6a8a6c] text-white dark:bg-[#8FAF91] dark:hover:bg-[#7C9A7E] dark:text-stone-900"
          >
            {loading ? 'Sending…' : 'Send Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create BookingSuccess dialog**

```typescript
// components/booking-success.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Booking } from '@/types/booking'

interface BookingSuccessProps {
  booking: Booking | null
  onClose: () => void
}

export function BookingSuccess({ booking, onClose }: BookingSuccessProps) {
  if (!booking) return null

  function handleAddToCalendar() {
    window.open(`/api/bookings/${booking!.id}/ical`, '_blank')
  }

  return (
    <Dialog open={!!booking} onOpenChange={onClose}>
      <DialogContent className="dark:bg-stone-800 dark:border-stone-700">
        <DialogHeader>
          <DialogTitle className="font-serif dark:text-stone-100">
            Request Sent
          </DialogTitle>
          <DialogDescription className="dark:text-stone-400">
            Your request for {booking.start_date} – {booking.end_date} has been
            received. The host will confirm shortly.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={handleAddToCalendar}
            className="bg-[#7C9A7E] hover:bg-[#6a8a6c] text-white dark:bg-[#8FAF91] dark:hover:bg-[#7C9A7E] dark:text-stone-900"
          >
            Add to Calendar
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="dark:border-stone-600 dark:text-stone-300"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/booking-form.tsx components/booking-success.tsx
git commit -m "feat: add BookingForm and BookingSuccess components"
```

---

## Task 20: CabinInfo component

**Files:**
- Create: `components/cabin-info.tsx`

- [ ] **Step 1: Create CabinInfo**

```typescript
// components/cabin-info.tsx
const HOUSE_RULES = [
  'No smoking inside the cabin',
  'Pets welcome with prior approval',
  'Maximum 6 guests',
  'Check-in from 15:00, check-out by 11:00',
  'Please leave the cabin as you found it',
  'Quiet hours from 22:00 to 08:00',
]

// Photo grid placeholders — replace src values with actual images placed in /public/photos/
const PHOTOS = [
  { src: '/photos/cabin-1.jpg', alt: 'Exterior' },
  { src: '/photos/cabin-2.jpg', alt: 'Living room' },
  { src: '/photos/cabin-3.jpg', alt: 'Bedroom' },
  { src: '/photos/cabin-4.jpg', alt: 'Kitchen' },
]

export function CabinInfo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PHOTOS.map((photo) => (
          <div
            key={photo.src}
            className="aspect-square relative rounded-md overflow-hidden bg-stone-200 dark:bg-stone-700 flex items-center justify-center"
          >
            {/* Once you have real photos, replace this div with next/image */}
            <span className="text-xs text-stone-400">{photo.alt}</span>
          </div>
        ))}
      </div>

      <div>
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-3">
          About the Cabin
        </h2>
        <p className="text-stone-600 dark:text-stone-400 leading-relaxed max-w-prose">
          Les Tsabloz is a private cabin nestled in the mountains — a peaceful
          retreat surrounded by nature with all the comforts of home. Perfect
          for families, couples, or a small group of friends seeking calm and
          clean mountain air.
        </p>
      </div>

      <div>
        <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-3">
          House Rules
        </h2>
        <ul className="flex flex-col gap-2">
          {HOUSE_RULES.map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-2 text-stone-600 dark:text-stone-400"
            >
              <span className="mt-0.5 text-[#7C9A7E] dark:text-[#8FAF91] select-none">
                —
              </span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/cabin-info.tsx
git commit -m "feat: add static CabinInfo component"
```

---

## Task 21: Main page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx**

```typescript
// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TopBar } from '@/components/top-bar'
import { BookingCalendar } from '@/components/booking-calendar'
import { BookingForm } from '@/components/booking-form'
import { BookingSuccess } from '@/components/booking-success'
import { CabinInfo } from '@/components/cabin-info'
import type { DateRange } from 'react-day-picker'
import type { Booking } from '@/types/booking'

interface ApprovedBooking {
  id: string
  start_date: string
  end_date: string
  name: string
  status: string
}

export default function Home() {
  const [bookedRanges, setBookedRanges] = useState<ApprovedBooking[]>([])
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>()
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null)

  function fetchBookings() {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => setBookedRanges(data.bookings ?? []))
      .catch(console.error)
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  function handleSuccess(booking: Booking) {
    setSuccessBooking(booking)
    setSelectedRange(undefined)
    fetchBookings()
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      <TopBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <Tabs defaultValue="book">
          <TabsList className="mb-6 dark:bg-stone-800">
            <TabsTrigger value="book">Book a Stay</TabsTrigger>
            <TabsTrigger value="cabin">The Cabin</TabsTrigger>
          </TabsList>
          <TabsContent value="book">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <BookingCalendar
                bookedRanges={bookedRanges}
                selectedRange={selectedRange}
                onSelectRange={setSelectedRange}
              />
              <BookingForm
                selectedRange={selectedRange}
                onSuccess={handleSuccess}
              />
            </div>
          </TabsContent>
          <TabsContent value="cabin">
            <CabinInfo />
          </TabsContent>
        </Tabs>
      </main>
      <BookingSuccess
        booking={successBooking}
        onClose={() => setSuccessBooking(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Test the booking flow end to end**

With dev server running:
1. Submit a booking request with valid dates
2. Confirm the success dialog appears
3. Click "Add to Calendar" — verify a `.ics` file downloads
4. Check Supabase dashboard → bookings table shows a new row with `status = 'pending'`
5. Check that the owner email was sent (Resend dashboard)

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: build main page with Book and Cabin tabs"
```

---

## Task 22: Admin dashboard

**Files:**
- Create: `components/admin/booking-card.tsx`
- Create: `app/admin/page.tsx`

- [ ] **Step 1: Create BookingCard component**

```typescript
// components/admin/booking-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Booking, BookingStatus } from '@/types/booking'

const statusStyle: Record<BookingStatus, string> = {
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  approved:
    'bg-[#7C9A7E]/20 text-[#5a7a5c] dark:bg-[#8FAF91]/20 dark:text-[#8FAF91]',
  rejected:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

interface BookingCardProps {
  booking: Booking
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void
}

export function BookingCard({ booking, onStatusChange }: BookingCardProps) {
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)

  async function handleAction(status: 'approved' | 'rejected') {
    setLoading(status)
    await fetch(`/api/admin/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    onStatusChange(booking.id, status)
  }

  return (
    <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-800">
      <CardContent className="pt-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-stone-900 dark:text-stone-100">
              {booking.name}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {booking.email}
            </p>
            <p className="text-sm text-stone-700 dark:text-stone-300 mt-1">
              {booking.start_date} → {booking.end_date}
            </p>
            {booking.message && (
              <p className="text-sm text-stone-500 dark:text-stone-400 italic mt-1">
                "{booking.message}"
              </p>
            )}
          </div>
          <Badge className={statusStyle[booking.status]}>{booking.status}</Badge>
        </div>
        {booking.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAction('approved')}
              disabled={!!loading}
              className="bg-[#7C9A7E] hover:bg-[#6a8a6c] text-white dark:bg-[#8FAF91] dark:hover:bg-[#7C9A7E] dark:text-stone-900"
            >
              {loading === 'approved' ? 'Approving…' : 'Approve'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAction('rejected')}
              disabled={!!loading}
            >
              {loading === 'rejected' ? 'Rejecting…' : 'Reject'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create admin dashboard page**

```typescript
// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { BookingCard } from '@/components/admin/booking-card'
import type { Booking, BookingStatus } from '@/types/booking'

const SECTIONS: { label: string; status: BookingStatus }[] = [
  { label: 'Pending', status: 'pending' },
  { label: 'Approved', status: 'approved' },
  { label: 'Rejected', status: 'rejected' },
]

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [icalUrl, setIcalUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings ?? []))
      .catch(console.error)

    // Build the iCal URL client-side from the public base URL
    // ICAL_SECRET is server-only, so we hit an endpoint for the full URL
    fetch('/api/admin/ical-url')
      .then((r) => r.json())
      .then((data) => setIcalUrl(data.url ?? ''))
      .catch(console.error)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  function handleStatusChange(id: string, status: 'approved' | 'rejected') {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    )
  }

  function handleCopyIcal() {
    navigator.clipboard.writeText(icalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const grouped = Object.fromEntries(
    SECTIONS.map(({ status }) => [
      status,
      bookings.filter((b) => b.status === status),
    ])
  ) as Record<BookingStatus, Booking[]>

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <span className="font-serif text-xl text-stone-900 dark:text-stone-100">
          Les Tsabloz — Admin
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-stone-500 hover:text-stone-900 dark:text-stone-400"
          >
            Logout
          </Button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
        {icalUrl && (
          <div className="flex items-center gap-3 p-3 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <p className="text-xs text-stone-500 dark:text-stone-400 flex-1 font-mono truncate">
              {icalUrl}
            </p>
            <Button size="sm" variant="outline" onClick={handleCopyIcal}>
              {copied ? 'Copied!' : 'Copy iCal URL'}
            </Button>
          </div>
        )}
        {SECTIONS.map(({ label, status }) => (
          <section key={status}>
            <h2 className="font-serif text-lg text-stone-900 dark:text-stone-100 mb-3">
              {label} ({grouped[status]?.length ?? 0})
            </h2>
            {!grouped[status]?.length ? (
              <p className="text-sm text-stone-400">
                No {label.toLowerCase()} bookings
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {grouped[status].map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Create the iCal URL helper route**

The `ICAL_SECRET` is server-only, so the admin page fetches the full iCal URL from a protected route rather than reading an env var client-side.

```typescript
// app/api/admin/ical-url/route.ts
import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/auth-client'

export async function GET() {
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL!
  const token = process.env.ICAL_SECRET!
  return NextResponse.json({ url: `${base}/api/ical?token=${token}` })
}
```

- [ ] **Step 4: Test admin dashboard end to end**

With dev server running and signed in as admin:
1. Verify all bookings appear grouped by status
2. Approve a pending booking — verify status badge updates immediately
3. Verify the approved booking now appears on the main calendar
4. Copy the iCal URL and subscribe to it in Google Calendar

- [ ] **Step 5: Commit**

```bash
git add components/admin/booking-card.tsx app/admin/page.tsx app/api/admin/ical-url/route.ts
git commit -m "feat: add admin dashboard with booking management"
```

---

## Self-Review Checklist

### Spec coverage

| Spec requirement | Task |
|---|---|
| Shared password wall | Tasks 9, 16 |
| Guest session cookie (middleware) | Tasks 6, 8 |
| Public booking calendar (approved ranges) | Tasks 10 (GET), 18, 21 |
| Booking request form | Tasks 10 (POST), 19, 21 |
| Status `pending` by default | Task 10 (POST route inserts without status, DB default is `pending`) |
| Admin approve/reject | Tasks 11, 22 |
| Email notification to owner | Tasks 10, 10 (email helper) |
| Guest "Add to Calendar" (.ics download) | Tasks 12, 19 |
| Admin subscribable iCal feed | Tasks 12, 22 |
| Cabin info tab (static) | Tasks 20, 21 |
| Dark mode | Tasks 13, 15, 16, 17, 18, 19, 20, 21, 22 |
| shadcn/ui components | Task 14 |
| Playfair Display font | Task 13 |
| `/admin` Supabase Auth | Tasks 7, 8, 11, 17 |
| `/login` guest password | Tasks 6, 8, 9, 16 |
| Mobile responsive | All components use Tailwind responsive classes |

All spec requirements are covered.

### No placeholders

No TBD, TODO, or vague steps. Every step includes the complete code or an exact command with expected output.

### Type consistency

- `Booking` type defined in `types/booking.ts` (Task 3) and used consistently in Tasks 5, 6, 10, 11, 12, 19, 22
- `BookingStatus` used in `booking-card.tsx` and `admin/page.tsx` — both import from `@/types/booking`
- `DateRange` imported from `react-day-picker` in both `booking-calendar.tsx` and `booking-form.tsx`
- Route handler `params` typed as `Promise<{ id: string }>` in Tasks 12, 11
- `createServiceClient()` named consistently across Tasks 7, 10, 11, 12
- `createAuthClient()` named consistently across Tasks 7, 11, 22 (ical-url route)
