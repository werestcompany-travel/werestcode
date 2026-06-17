# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Werest Travel** — Thailand travel booking platform. Private airport transfers and attraction ticket bookings. Built with Next.js 14 App Router, TypeScript, Prisma + PostgreSQL.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint

# Database
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Push schema to DB without migration (dev only)
npm run db:migrate   # Create and apply migration
npm run db:seed      # Seed tours and blog content
npm run db:studio    # Open Prisma Studio GUI
```

## Architecture

### Stack
- **Framework**: Next.js 14 App Router (`src/app/`)
- **ORM**: Prisma v6 with PostgreSQL (schema at `prisma/schema.prisma`)
- **Styling**: Tailwind CSS — brand blue `#2534ff`, font variable `--font-inter`
- **Auth**: JWT via `jose` + `bcryptjs`; separate token flows for users, admins, drivers
- **Payments**: Payso webhook at `/api/payment/webhook`
- **Email**: Resend via `src/lib/email.ts` + journey emails in `src/lib/email-journey-emails.ts`
- **Integrations**: Google Maps API, WhatsApp Business API, Sentry, Web Push + Expo push

### Key directories

| Path | Purpose |
|------|---------|
| `src/app/` | Pages and API routes (App Router) |
| `src/app/api/` | All API endpoints |
| `src/app/admin/` | Admin dashboard pages |
| `src/components/` | Shared UI components |
| `src/components/home/` | Homepage sections (heavy, lazy-loaded) |
| `src/context/` | React context providers |
| `src/lib/` | Server-side utilities and business logic |
| `src/types/` | Shared TypeScript types |

### Context providers (`src/context/`)
- **LocaleContext** — Language (EN/TH/ZH) + currency (THB/USD/EUR/GBP/CNY/JPY/AUD/SGD). All UI strings go through `t('key')`. Exchange rates fetched at runtime with hardcoded fallbacks.
- **AuthModalContext** — Controls the login/register modal and holds the logged-in user object.
- **WishlistContext** — Persists user favourites; syncs with `/api/user/wishlist`.
- **RecentlyViewedContext** — Client-side browse history via localStorage.

### Auth architecture
Three separate JWT flows — keep them separate:
- **User** (`src/lib/user-auth.ts`) — cookie `user_session`, checked in middleware for `/account/*`
- **Admin** (`src/lib/auth.ts`) — cookie `admin_session`, checked for `/admin/*` and `/api/admin/*`
- **Driver** (`src/lib/driver-auth.ts`) — cookie `driver_session`, checked for `/driver/*`

Session invalidation uses a JTI denylist (`src/lib/session-denylist.ts`) backed by an in-process store (replace with Redis for multi-instance).

### Middleware (`src/middleware.ts`)
Runs on every request. Handles in order:
1. CSP nonce injection (nonce available in layout via `headers().get('x-nonce')`)
2. CSRF validation (skips webhook + login routes)
3. JWT verification + session denylist check
4. X-Request-ID propagation

### Pricing logic
Transfer prices are calculated in `src/lib/pricing.ts` using distance + vehicle type + surcharges (night, holiday, extra stops). Do not apply flat rates — always route through this function.

### API route conventions
- All API routes are under `src/app/api/`
- Cron jobs live in `src/app/api/cron/` and are protected by `CRON_SECRET` header
- Admin API routes (`/api/admin/*`) require a valid admin JWT
- Payment webhook at `/api/payment/webhook` is exempted from CSRF

### Database models (key ones)
`User`, `Booking` (transfers), `AttractionBooking`, `TourBooking`, `LoyaltyTransaction`, `BlogPost`, `AdminUser`, `PaymentTransaction`, `WishlistItem`

Enums: `VehicleType`, `BookingStatus` (PENDING → DRIVER_CONFIRMED → COMPLETED/CANCELLED), `PaymentStatus`, `AdminRole`

### Important env vars
```
DATABASE_URL          # Prisma connection (pooled)
DIRECT_URL            # Direct Prisma connection (migrations)
NEXT_PUBLIC_GA_MEASUREMENT_ID
NEXT_PUBLIC_META_PIXEL_ID
NEXT_PUBLIC_CLARITY_ID
CRON_SECRET
PAYSO_SECRET_KEY
RESEND_API_KEY
```

### Tracking / consent
Analytics scripts (GA4, Meta Pixel, Clarity) are **not** loaded unconditionally. They are injected dynamically by `src/components/ConsentAwareTracking.tsx` only after the user accepts via the cookie banner (`src/components/CookieConsent.tsx`). Cookie consent is stored in localStorage key `werest_cookie_consent`. The banner dispatches `werest:consent-updated` custom event when the user saves preferences.

### Worktree note
This repo uses Claude Code worktrees. All edits should target the **main project** at `C:\Users\UsEr\Desktop\Werest Code`, not any worktree path under `.claude/worktrees/`. The dev server is configured in `.claude/launch.json` to always run from the main project directory.
