# Orios Portal: Overhaul Strategy Plan

This document outlines the strategy for rewriting the Orios Class Portal from a bloated Docusaurus site into a fast, flat, mobile-first web application backed by a real relational database.

## 1. Architecture & Tech Stack

We will transition to a modern, beginner-friendly "T3-adjacent" stack that minimizes boilerplate and maximizes development speed.

- **Frontend Framework**: **Next.js (App Router)**
  - *Why*: Industry standard, excellent routing, fast page loads, and allows writing backend code (API routes) right next to your React components.
- **Styling**: **Tailwind CSS**
  - *Why*: Enforces a flat, modern design out of the box. Makes mobile-first responsive design incredibly easy with utility classes (e.g., `flex-col md:flex-row`).
- **UI Components**: **shadcn/ui**
  - *Why*: Provides copy-paste, accessible, premium-looking components (buttons, dropdowns, dialogs) that you fully control. No bloat.
- **Database & Auth**: **Supabase**
  - *Why*: The best beginner-friendly Postgres database. It provides an Excel-like dashboard for your data, built-in Authentication (login/passwords), and Storage buckets for files.

---

## 2. Database Design (Supabase PostgreSQL)

Moving away from Cloudflare KV (which stores unstructured JSON) to a real relational database will allow instant filtering and sorting.

### Core Tables
1. `profiles`: User accounts (Admins vs Students).
2. `subjects`: Lookup table for class subjects.
3. `notes`: id, title, description, subject_id, file_url, created_at.
4. `assignments`: id, title, description, subject_id, due_date, status, file_url.
5. `lab_reports`: id, title, lab_number, subject_id, due_date, grade, file_url.
6. `routine`: Days, timeslots, and classes.

> **File Handling**: Instead of embedding 25MB Base64 strings into the database, files will be uploaded to a **Supabase Storage Bucket**. The database tables will merely store a short, fast `file_url` link to the file.

---

## 3. UI/UX & Design Aesthetic

The new design will focus on being **Flat, Fluid, and Mobile-First**.

- **Mobile-First Approach**: We will design the mobile layout first. Desktop layouts will simply be expansions of the mobile view (e.g., a single column of cards on mobile becomes a 3-column grid on desktop).
- **Flat Design**: No heavy shadows, gradients, or 3D effects. We will use solid colors, clean typography (e.g., Inter or Geist fonts), and subtle borders.
- **Fluid Layouts**: The UI will use CSS Grid and Flexbox to stretch and shrink perfectly on any screen size.
- **Dark Mode**: Built-in natively using Tailwind's `dark:` classes.

---

## 4. Implementation Phases

We will build the new portal iteratively in a separate folder without touching the current live site.

### Phase 1: Foundation (Days 1-3)
1. Initialize a blank Next.js project with Tailwind CSS.
2. Setup a free Supabase project.
3. Configure the database tables and Storage buckets.
4. Implement the base Layout (Navbar, Mobile Menu, Footer).

### Phase 2: Core Features (Days 4-7)
1. **Routine Viewer**: Build a clean, responsive grid/list view for the weekly schedule.
2. **Notes Page**: Rebuild the notes grid with proper filtering by subject.
3. **Assignments & Labs**: Implement the tracking boards with status indicators (Pending, Submitted, Overdue).

### Phase 3: Admin & Data Migration (Days 8-10)
1. Create a secure Admin dashboard route for adding new notes/assignments.
2. Implement file uploading to Supabase Storage.
3. Write a small script to extract the data from your current Cloudflare KV and insert it into Supabase.

### Phase 4: Polish & Launch (Days 11-14)
1. Audit for mobile responsiveness on all screen sizes.
2. Add micro-animations (hover states, smooth page transitions).
3. Deploy the new site on Vercel (free, fast, and optimized for Next.js).
4. Point your domain to the new site.



# Orios Portal V2 — Homepage Build Plan

Build the website foundation and homepage. Backend, admin panel, and other pages come later.

---

## Decisions Locked In (from your feedback)

| Decision | Choice |
|---|---|
| **Styling** | Tailwind CSS (simpler, faster to implement) |
| **Default Theme** | Dark mode |
| **Palette** | Muted, modern, less vibrant — zinc/slate neutrals with subtle indigo accent |
| **Deployment** | Cloudflare Workers (compute) — full website hosted on Cloudflare's edge compute |
| **Framework** | Next.js 15 (App Router) |
| **Scope** | Homepage only (for now) |
| **Legacy Code** | ✅ Deleted. Documented in `legacy_website_profile.md` |

---

## Design Philosophy

**"Quiet Premium"** — Clean, muted, spacious. Think Linear, Vercel, Raycast.

- **No vibrant gradients** — Subtle monochrome gradients, muted accent colors
- **Dark-first** — Rich dark backgrounds (`zinc-950`, `zinc-900`), soft text contrast
- **Minimal borders** — Use spacing and subtle background shifts instead of visible borders
- **Large touch targets** — Minimum 44px tap areas, generous padding on mobile
- **Restrained animation** — Smooth, subtle transitions. No flashy effects
- **Mobile app feel** — Bottom navigation, thumb-reach optimized layout

### Color Palette (Muted Modern)

| Role | Dark Mode | Light Mode |
|---|---|---|
| **Background** | `zinc-950` (#09090b) | `zinc-50` (#fafafa) |
| **Surface** | `zinc-900` (#18181b) | `white` (#ffffff) |
| **Surface elevated** | `zinc-800` (#27272a) | `zinc-100` (#f4f4f5) |
| **Text primary** | `zinc-100` (#f4f4f5) | `zinc-900` (#18181b) |
| **Text secondary** | `zinc-400` (#a1a1aa) | `zinc-500` (#71717a) |
| **Text muted** | `zinc-600` (#52525b) | `zinc-400` (#a1a1aa) |
| **Accent** | `indigo-400` (#818cf8) | `indigo-600` (#4f46e5) |
| **Accent subtle** | `indigo-400/10` | `indigo-600/10` |
| **Border** | `zinc-800` (#27272a) | `zinc-200` (#e4e4e7) |
| **Success** | `emerald-400` | `emerald-600` |
| **Warning** | `amber-400` | `amber-600` |
| **Danger** | `red-400` | `red-600` |

### Typography

- **Body**: Inter (clean, neutral, great readability)
- **Display/Headings**: Inter (same font, heavier weight — keeping it uniform for a cleaner look)
- **Monospace**: JetBrains Mono (for countdown digits, code)

---

## Proposed Changes

### Project Bootstrap

#### [NEW] Next.js 15 + Tailwind CSS project

Initialize with `create-next-app`:
- JavaScript (no TypeScript)
- App Router
- Tailwind CSS v4
- ESLint
- No `src/` directory — `app/` at root
- Import alias `@/*`

#### [NEW] Cloudflare Workers adapter

Install `@opennextjs/cloudflare` for deploying Next.js on Cloudflare Workers (compute).

---

### Core Layout

#### [NEW] [app/layout.js](file:///home/tokit/Projects/Orios-V2/app/layout.js)

Root layout:
- Inter font via `next/font/google`
- Theme initialization script (inline, no flash)
- `<html data-theme="dark">` default
- SEO metadata: title template, description, OG image
- Viewport: `width=device-width, initial-scale=1, viewport-fit=cover`
- Wraps children in `<ThemeProvider>` and `<AppShell>`

#### [NEW] [components/ThemeProvider.js](file:///home/tokit/Projects/Orios-V2/components/ThemeProvider.js)

- React context for `dark` / `light` / `system`
- `useTheme()` hook
- Reads `prefers-color-scheme`, persists to localStorage
- Sets `data-theme` on `<html>` and Tailwind `dark:` class

#### [NEW] [components/AppShell.js](file:///home/tokit/Projects/Orios-V2/components/AppShell.js)

Layout container:
- **Mobile**: Content area + BottomNav (fixed bottom)
- **Desktop**: TopNav (sticky top) + Content area
- Bottom padding on mobile for safe area + nav height

---

### Navigation Components

#### [NEW] [components/BottomNav.js](file:///home/tokit/Projects/Orios-V2/components/BottomNav.js)

Mobile bottom tab bar (visible `< md`):
- 5 tabs: Home, Notes, Schedule, Files, More
- Lucide icons, active indicator
- Glassmorphism background with `backdrop-blur`
- `safe-area-inset-bottom` padding

#### [NEW] [components/TopNav.js](file:///home/tokit/Projects/Orios-V2/components/TopNav.js)

Desktop top navbar (visible `≥ md`):
- Logo + "Orios" brand text
- Nav links: Notes, Assignments, Lab Reports, Calendar, Teachers, Files
- Theme toggle (sun/moon icon)
- Glassmorphism with `backdrop-blur`

---

### Homepage

#### [NEW] [app/page.js](file:///home/tokit/Projects/Orios-V2/app/page.js)

Homepage with mock data (real data integration comes with backend). Sections:

1. **Hero**
   - Subtle dark gradient background (no floating orbs — cleaner)
   - Small badge: "Class Portal"
   - Title: "Welcome to Orios" with mascot
   - Subtitle text
   - Search input (visual only for now, no overlay)

2. **Stats Strip**
   - 4 compact stat cards in horizontal scroll (mobile) / grid (desktop)
   - Classes Today, Pending Tasks, Upcoming, Total Notes
   - Subtle background, muted icons
   - Mock numbers for now

3. **Upcoming Deadlines**
   - Countdown cards (days/hours/min)
   - Clean, minimal design — no urgent/flashing modes
   - Mock data: 2-3 sample events

4. **Today's Schedule**
   - Date header
   - Clean schedule cards (time, subject, room, type badge)
   - Mock data: 3-4 sample classes

5. **Quick Access**
   - 2×3 grid (mobile) / 3×2 grid (desktop)
   - Feature cards: icon + title + short description
   - Subtle hover lift on desktop

6. **Footer**
   - Minimal: "Built with ♥ for Section D" + theme toggle on mobile

---

### Utility Components (for homepage)

#### [NEW] [components/Card.js](file:///home/tokit/Projects/Orios-V2/components/Card.js)

Simple card wrapper with Tailwind classes. Variants via props: `default`, `interactive`.

#### [NEW] [components/CountdownCard.js](file:///home/tokit/Projects/Orios-V2/components/CountdownCard.js)

Live countdown timer card. Shows days/hours/minutes. Uses `useEffect` interval.

#### [NEW] [components/ScheduleCard.js](file:///home/tokit/Projects/Orios-V2/components/ScheduleCard.js)

Single class slot card. Time, subject, room, teacher, type badge.

#### [NEW] [components/FeatureCard.js](file:///home/tokit/Projects/Orios-V2/components/FeatureCard.js)

Quick access card. Icon, title, description, link.

#### [NEW] [components/StatCard.js](file:///home/tokit/Projects/Orios-V2/components/StatCard.js)

Compact stat display. Icon, number, label.

---

### Static Assets

#### [DONE] Mascot images copied to `assets/`
- `orio.png`, `orio1.png`, `pucu.png`, `favicon.png`, `orio.svg`

---

## File Structure

```
Orios-V2/
├── app/
│   ├── globals.css           # Tailwind directives + custom utilities
│   ├── layout.js             # Root layout (font, theme, shell)
│   └── page.js               # Homepage
├── components/
│   ├── AppShell.js           # Layout container
│   ├── ThemeProvider.js      # Theme context + hook
│   ├── TopNav.js             # Desktop navbar
│   ├── BottomNav.js          # Mobile bottom tabs
│   ├── Card.js               # Base card
│   ├── CountdownCard.js      # Countdown timer
│   ├── ScheduleCard.js       # Class schedule slot
│   ├── FeatureCard.js        # Quick access card
│   └── StatCard.js           # Stat display
├── lib/
│   └── mock-data.js          # Mock data for homepage
├── assets/                   # Mascots, favicon
├── legacy_website_profile.md # Full legacy documentation
├── skills/                   # Agent skills
├── next.config.mjs
├── tailwind.config.js
├── package.json
└── README.md
```

---

## Build Order

1. Bootstrap Next.js + Tailwind project
2. Configure Tailwind theme (muted palette, fonts)
3. Build `ThemeProvider` + `AppShell` + navigation components
4. Build homepage sections top-to-bottom with mock data
5. Polish: animations, responsive testing, dark/light toggle
6. Verify: `npm run build` passes, visual check at 375px/768px/1440px

---

## Verification Plan

### Automated
```bash
npm run build   # No compilation errors
npm run lint    # No lint issues
```

### Manual
- `npm run dev` → check at mobile (375px), tablet (768px), desktop (1440px)
- Dark mode renders correctly by default
- Light mode toggle works
- Bottom nav visible on mobile only
- Top nav visible on desktop only
- All mock data renders in homepage sections
- Smooth, subtle animations on scroll/interaction
- Mascot images load correctly
