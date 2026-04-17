# Werest Travel

A full-stack travel booking platform built with Next.js 14, offering private airport transfers and attraction tickets in Thailand.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: PostgreSQL via [Supabase](https://supabase.com) + Prisma 5 ORM
- **Styling**: Tailwind CSS + Lucide React icons
- **Auth**: JWT (jose) + bcryptjs
- **Integrations**: Google Maps API, WhatsApp Business API
- **Notifications**: react-hot-toast

---

## Features

- **Private Transfers** — Book airport/point-to-point transfers (sedan, SUV, minivan) with real-time Google Maps distance & pricing
- **Attraction Tickets** — Browse and book tickets (e.g. Sanctuary of Truth, Pattaya) with multi-step checkout
- **Booking Tracker** — Look up any booking by reference number
- **User Accounts** — Register, login, wishlist, booking history
- **Admin Panel** — Manage attractions, packages, bookings, and discount codes
- **Multi-currency & Language** — USD/THB/EUR/GBP selector, EN/TH language toggle

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  Next.js 14 App Router (Frontend + API Routes)                 │
│                                                                │
│  Pages                          API Routes                     │
│  /                              /api/bookings                  │
│  /results                       /api/attraction-bookings       │
│  /booking                       /api/attractions/[slug]        │
│  /confirmation/:id              /api/pricing                   │
│  /tracking                      /api/discount-codes/validate   │
│  /attractions                   /api/user/*                    │
│  /attractions/sanctuary-of-truth /api/admin/*                  │
│  /attractions/checkout                                         │
│  /account                                                      │
│  /admin                                                        │
└────────────────────┬───────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │  Prisma ORM             │
        │  PostgreSQL (Supabase)  │
        └────────────┬────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
Google Maps      WhatsApp       Admin JWT
Places API      Business API    (jose)
Directions API
Distance Matrix
```

---

## Database Schema

| Model | Description |
|---|---|
| `User` | Registered customers |
| `AdminUser` | Admin accounts (bcrypt hashed) |
| `Booking` | Private transfer bookings |
| `BookingStatusHistory` | Immutable status audit trail |
| `PricingRule` | Per-vehicle base fare + price/km |
| `AddOn` | Optional extras (child seat, extra stop, etc.) |
| `BookingAddOn` | Join: booking ↔ add-ons with quantity |
| `AttractionListing` | Attraction catalog with rich content (gallery, FAQs, etc.) |
| `AttractionPackage` | Pricing packages per attraction |
| `AttractionBooking` | Attraction ticket orders |
| `DiscountCode` | Coupon codes (% or fixed amount) |
| `WishlistItem` | User saved attractions |

---

## Booking Status Flow

```
PENDING → DRIVER_CONFIRMED → DRIVER_STANDBY → DRIVER_PICKED_UP → COMPLETED
                                                               ↘ CANCELLED (from any step)
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=postgresql://...

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_SERVER_API_KEY=

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_ADMIN_PHONE=

# Auth
JWT_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COMPANY_NAME=Werest Travel
NEXT_PUBLIC_COMPANY_PHONE=
```

### 3. Set up database

```bash
npx prisma db push       # Sync schema to DB
npx prisma generate      # Generate Prisma client
npx prisma db seed       # Seed pricing rules, add-ons, admin user
```

> **Windows note:** If `prisma generate` fails with a DLL lock error, kill Node first:
> ```powershell
> Stop-Process -Name node -Force
> ```

Default admin: `admin@werest.com` / `admin123` ← **change before going live**

### 4. Run dev server

```bash
npm run dev
# Open http://localhost:3000
```

---

## Booking Flows

### Private Transfer

1. Enter pickup/dropoff on homepage → select vehicle + add-ons → fill passenger details → confirm
2. Admin notified via WhatsApp; driver assignment tracked through status stages

### Attraction Tickets

1. Select ticket type & quantities on the attraction page
2. **Step 1** — Enter visit date and customer details
3. **Step 2** — Choose payment method (Card / Cash / Bank Transfer / Crypto)
4. Confirmation page with booking reference

---

## Pricing (Seeded defaults)

| Vehicle | Max Pax | Base Fare | Per km |
|---------|---------|-----------|--------|
| Sedan   | 3       | ฿500      | ฿12    |
| SUV     | 6       | ฿800      | ฿18    |
| Minivan | 10      | ฿1,200    | ฿22    |

Edit via `prisma studio` or update `prisma/seed.ts`.

---

## Add-ons (Seeded defaults)

| Add-on       | Price |
|--------------|-------|
| Child Seat   | ฿200  |
| Extra Stop   | ฿150  |
| Meet & Greet | ฿300  |
| Waiting Time | ฿250  |

---

## Admin Panel

Visit `/admin` and log in with your admin credentials.

- **Attractions** — Add/edit listings, manage packages and pricing, gallery images, FAQs, highlights, and rich content
- **Attraction Bookings** — View and update ticket order statuses
- **Transport Bookings** — View and manage all private transfer orders
- **Discount Codes** — Create percentage or fixed-amount coupons with expiry and usage limits

---

## Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable: **Maps JavaScript API**, **Geocoding API**, **Directions API**, **Distance Matrix API**
3. Create two API keys — one restricted to your domain (public), one unrestricted (server-side)
4. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `GOOGLE_MAPS_SERVER_API_KEY` in `.env.local`

---

## WhatsApp Integration

1. Create a Meta Developer App → WhatsApp Business Platform
2. Get a Phone Number ID and Permanent Access Token
3. Set `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_ADMIN_PHONE`

Notifications sent:
- **New booking** → Admin WhatsApp
- **Status update** → Customer WhatsApp

---

## Production Checklist

- [ ] Change admin password from seed default
- [ ] Set `JWT_SECRET` to a strong random value (32+ chars)
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Restrict Google Maps API key to your domain
- [ ] Configure WhatsApp Business API credentials
- [ ] Set `DATABASE_URL` to production PostgreSQL
- [ ] Run `npx prisma migrate deploy` (not `db push`) in production
- [ ] Set up HTTPS
- [ ] Add rate limiting on booking POST endpoints
