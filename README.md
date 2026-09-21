# For The Future Organization - Website

A modern, accessible NGO website built with **Next.js 16** (App Router, Turbopack), **Tailwind CSS v4**, **Prisma 6** (Neon PostgreSQL), and **Framer Motion**. Deployed on Vercel with Cloudinary media hosting and Paystack payment processing.

**Live:** https://weareforthefuture.org

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, RSC, ISR) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@theme` tokens in `globals.css`) |
| Fonts | Inter (body) + Playfair Display (display) via `next/font` |
| Database | Neon PostgreSQL via Prisma 6 |
| Media | Cloudinary CDN |
| Payments | Paystack (`@paystack/inline-js`) |
| Animation | Framer Motion |
| Analytics | Vercel Analytics + consent-gated GA4 |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- A Neon PostgreSQL database (or local Postgres)

### Setup

```bash
# 1. Clone and install
git clone <repo-url> ftf-website
cd ftf-website
npm install

# 2. Environment variables
cp .env.example .env          # Prisma CLI reads .env
cp .env.example .env.local    # Next.js runtime reads .env.local

# 3. Generate Prisma client
npx prisma generate

# 4. Push schema to database (schema-first, no migrations directory)
npx prisma db push

# 5. Seed content
npx prisma db seed

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

All variables are documented in `.env.example`. Key ones:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `JWT_SECRET` | Yes | Admin auth token signing secret |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Yes | Paystack client-side key |
| `PAYSTACK_SECRET_KEY` | Yes | Paystack server-side key (never expose) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary upload key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary upload secret |
| `NEXT_PUBLIC_GA4_ID` | No | GA4 measurement ID (consent-gated) |

> **Important:** Prisma CLI reads `.env` only. Next.js reads `.env.local`. Both files need `DATABASE_URL`.

---

## Database

This project uses a **schema-first** workflow (no `prisma/migrations/` directory):

```bash
# Push schema changes to the database
npx prisma db push

# Seed all content (idempotent - safe to re-run)
npx prisma db seed

# Seed specific data
npm run seed:campaigns

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

The seed script (`prisma/seed.ts`) populates: blog posts, programmes, pillars, team members, board members, partners, products, impact stories, legal pages, site settings, and donation campaigns.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack, port 3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | TypeScript type check |
| `node scripts/check-banned-language.mjs` | CI banned-language check |
| `npx prisma db seed` | Full content seed |
| `npm run seed:campaigns` | Seed donation campaigns + documents |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Admin login route group
│   ├── (supporter)/        # Supporter account route group
│   ├── about/              # About section (6 routes)
│   ├── admin/              # Admin dashboard (RBAC-gated)
│   ├── give/               # Donation hub
│   ├── get-involved/       # Volunteer, fellowship, mentor
│   ├── impact/             # Impact + reports
│   ├── news/               # News feed + article reading page
│   ├── our-work/           # Five-pillar programme tree
│   ├── privacy/            # Legal: privacy policy
│   ├── terms/              # Legal: terms of service
│   └── cookies/            # Legal: cookie policy
├── components/
│   ├── layout/             # Navbar, Footer, PublicShell, BottomShell
│   ├── legal/              # LegalPageShell, LegalContent
│   ├── news/               # PostBody, ShareButtons, ReadingProgress, etc.
│   ├── our-work/           # ProgrammeCard
│   ├── give/               # GivingPanel
│   ├── home/               # Homepage sections
│   └── ui/                 # Shared UI primitives
├── data/                   # Static data sources (seed authoring)
├── lib/                    # Utilities (db, auth, analytics, pillars, etc.)
└── types/                  # TypeScript declarations
prisma/
├── schema.prisma           # Database schema (~40 models)
└── seed.ts                 # Content seed script
```

---

## Deployment

### Vercel (Production)

The site auto-deploys from the `main` branch on Vercel.

**Vercel project settings:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

**Required Vercel env vars:** Same as `.env.example` (set in Vercel Dashboard → Settings → Environment Variables).

**Post-deploy:** Run `npx prisma db push` if the schema changed (or add it to the build command).

### Build Verification

Before deploying, verify locally:

```bash
npx tsc --noEmit                              # 0 errors
node scripts/check-banned-language.mjs        # clean
npx next build                                # 0 errors, all routes SSG/ISR
```

---

## Contributing

### Code Style

- TypeScript strict mode - no `any` unless justified with a comment.
- Tailwind utility classes; design tokens from `globals.css` (`--ftf-*` custom properties).
- Never hardcode colors - use token utilities (`text-text-primary`, `bg-accent-hover`, etc.).
- Server components by default; add `"use client"` only when state/effects are needed.
- Public pages fetch Prisma data server-side and pass as `initial*` props to client components.

### Banned Language

The CI script `scripts/check-banned-language.mjs` enforces dignified language. Never use: "underprivileged", "poor children", "needy", "less fortunate", "third world", "saviour", "helpless", "handout". See the script for the full list.

### Branch Workflow

1. Create a feature branch from `main`.
2. Run `npx tsc --noEmit` and `node scripts/check-banned-language.mjs` before committing.
3. Open a PR with a description of changes and screenshots for UI work.
4. Squash-merge to `main` (triggers Vercel deploy).

### Schema Changes

This project uses `prisma db push` (schema-first). After editing `prisma/schema.prisma`:

```bash
npx prisma db push      # Apply to database
npx prisma generate     # Regenerate client
npx prisma db seed      # Re-seed if new models need content
```

> **Warning:** `db push` can drop columns. Always verify against live data before pushing destructive changes.

---

## VS Code Setup

Tailwind CSS v4 at-rules (`@theme`, `@custom-variant`, etc.) are registered in `.vscode/css-custom-data.json`. Reload the window after cloning. If you open the parent directory, add a pointer `.vscode/settings.json` there.

---

## Key Architecture Decisions

- **No raw HTML rendering:** CMS content is parsed into typed blocks (`PostBody.tsx`) and rendered as React nodes - never `dangerouslySetInnerHTML`.
- **ISR everywhere:** Public pages use `revalidate = 300` (5 min) or `3600` (legal). No `force-dynamic`.
- **Consent-gated analytics:** GA4 only loads after `ftf-cookie-consent=accepted`. Vercel Analytics (cookieless) is always active.
- **Token-only colors:** All colors reference CSS custom properties. Dark mode works via `[data-theme="dark"]` on `<html>`.
- **Cloudinary media:** All images are CDN-hosted. The `img()` helper in `src/lib/imageUrl.ts` maps legacy local paths.
