---
name: project-context
description: Self-improving context and changelog for the Orios-V2 project. MUST be updated after every architectural change.
---

# Orios-V2 Project Context (Self-Improving)

> **CRITICAL RULE**: Whenever you (the agent) make a significant structural change, add a new dependency, create a new core component, or make a design decision, you MUST update this file to reflect the new state of the project.

## 1. What Is This?
**Orios-V2** is a modern rewrite of the Orios class companion web portal for university students. The legacy version (v1/v3.0.0) was built with Docusaurus 3 and Cloudflare KV. This new version is rebuilt from the ground up using **Next.js 15 (App Router)** and **Tailwind CSS v4** to provide a true app-like experience with better routing, layouts, and performance.

## 2. Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9 (App Router) |
| UI Library | React 19.2.4 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/postcss`) |
| Theming | `next-themes` (Dark/Light mode via class attribute) |
| Icons | `lucide-react` |
| Font | Google Fonts: Inter (via `next/font/google`) |
| Deployment | Cloudflare Workers (`@opennextjs/cloudflare`) (Planned) |

## 3. File Structure
```
Orios-V2/
├── package.json
├── app/                          # Next.js App Router root
│   ├── layout.js                 # Root layout (Inter font, ThemeProvider, SubjectProvider, AppShell)
│   ├── page.js                   # Homepage (Hero, Stats, Deadlines, Schedule, Quick Access)
│   ├── globals.css               # Global Tailwind v4 CSS, animations, custom scrollbar
│   ├── assignments/page.js       # Assignment tracker (status filters, subject filters)
│   ├── lab-reports/page.js       # Lab report tracker (same pattern as assignments)
│   ├── notes/page.js             # Notes hub (subject-grouped, searchable)
│   ├── teachers/page.js          # Teacher directory (profile cards)
│   ├── files/page.js             # File sharing page
│   ├── more/page.js              # Settings/navigation page
│   ├── schedule/                 # Schedule hub
│   │   └── page.js               # Day/Week toggle, daily planner + timetable grid
│   └── admin/                    # Admin panel (separate layout, no public nav)
│       ├── layout.js             # Admin layout (auth protection, sidebar, topbar)
│       ├── page.js               # Dashboard (stats, quick actions, pending items)
│       ├── login/page.js         # Standalone login page
│       ├── notes/page.js         # Notes CRUD (uses AdminCrudPage)
│       ├── assignments/page.js   # Assignments CRUD
│       ├── lab-reports/page.js   # Lab Reports CRUD
│       ├── teachers/page.js      # Teachers CRUD (multi-select subjects)
│       ├── files/page.js         # Files CRUD (file upload)
│       ├── subjects/page.js      # Subjects CRUD (color picker)
│       └── routine/page.js       # Routine grid editor (custom, interactive)
├── components/                   # Shared UI components
│   ├── AppShell.js               # Wraps pages with TopNav and BottomNav
│   ├── TopNav.js                 # Desktop sticky navigation bar
│   ├── BottomNav.js              # Mobile bottom nav + hamburger bottom sheet (includes Admin Panel link)
│   ├── ThemeProvider.js          # Wraps next-themes provider and exports useTheme hook
│   ├── StatCard.js               # Top row statistical cards
│   ├── CountdownCard.js          # Exam/Lab deadline countdowns
│   ├── ScheduleCard.js           # Daily routine list items (+isNow prop for active class)
│   ├── FeatureCard.js            # Quick access grid items
│   ├── DayView.js                # Daily planner hub (classes + due items + coming up)
│   ├── WeekGrid.js               # Screenshot-friendly timetable grid (subject-colored cells)
│   └── admin/                    # Admin-specific components
│       ├── AdminSidebar.js       # Fixed sidebar (desktop) / slide-in overlay (mobile)
│       ├── AdminTopbar.js        # Top bar (dynamic title, hamburger, theme toggle)
│       ├── AdminDataTable.js     # Universal data table (search, sort, responsive, delete confirm)
│       ├── AdminFormDrawer.js    # Universal slide-in form (all field types)
│       ├── AdminCrudPage.js      # Composes DataTable + FormDrawer (the CRUD page pattern)
│       └── RoutineEditor.js      # Interactive grid editor (click cell → assign subject)
├── lib/
│   ├── mock-data.js              # All mock data (stats, countdowns, weekly routine, features, assignments, lab reports, etc.)
│   ├── subjects.js               # Centralized subject registry (codes, names, colors, availableColors)
│   ├── SubjectContext.js         # React Context for subject color coding (toggle on/off)
│   ├── schedule-helpers.js       # Shared schedule utilities (getTodayClasses, getCurrentClass, getNextClass, etc.)
│   └── admin-auth.js             # Placeholder admin auth context (localStorage-based, password: "orios2026")
├── skills/
│   ├── project-context/SKILL.md  # THIS FILE — project knowledge
│   └── legacy-code/              # Legacy Docusaurus v1 reference (legacy_website_profile.md)
└── public/                       # Static assets (mascot images: orio.png, orio1.png, pucu.png, etc.)
```

## 4. Architecture & Data Flow

### App Router Paradigm
The project strictly uses Next.js App Router (`app/`). Import alias `@/*` maps to the project root.

### Data Paradigm
Currently uses static mock data from `lib/mock-data.js`. All data exports:

| Export | Description |
|---|---|
| `mockStats` | Homepage stat cards |
| `mockCountdowns` | Deadline countdown items |
| `mockWeeklyRoutine` | Weekly class schedule (7 days × 8 slots, admin-ready structure) |
| `mockFeatures` | Quick access feature grid |
| `mockNotes` | Notes list |
| `mockAssignments` | Assignments list with status |
| `mockLabReports` | Lab reports list with status |
| `mockTeachers` | Teacher profiles |
| `mockFiles` | Shared file entries |

### Weekly Routine Structure (`mockWeeklyRoutine`)
```js
{
  timeSlots: ["8:00", "9:00", ...],           // 8 time slots
  days: ["Saturday", "Sunday", ..., "Friday"], // 7 days
  schedule: {
    "Saturday": [null, { subjectId, teacher, room, type }, ...],
    ...
  }
}
```
- `null` = free period (empty cell)
- Each slot uses `subjectId` to link into `subjects.js`
- Admin panel and homepage both derive from this single source via `schedule-helpers.js`

### Subject System
- `lib/subjects.js` — Centralized registry with `id`, `code`, `name`, `shortName`, `color`, `creditHours`
- `lib/SubjectContext.js` — React Context providing `getColor(subjectId)` for consistent color coding
- `availableColors` export for admin color picker

### Layouts
- **Root layout** (`app/layout.js`): Inter font, `ThemeProvider`, `SubjectProvider`, `AppShell` (TopNav + BottomNav)
- **Admin layout** (`app/admin/layout.js`): Separate layout with `AdminAuthProvider`, `AdminSidebar`, `AdminTopbar`. Does NOT use public AppShell. Login page renders standalone (no sidebar).

## 5. Design Paradigm: "Quiet Premium"
- **Aesthetics:** Flat, fluid, mobile-first. Muted zinc/slate palette, dark-mode default, subtle indigo accents. Minimal borders, generous touch targets. No heavy vibrant gradients.
- **CSS Architecture:** Tailwind v4 with CSS custom properties injected via `@theme inline` in `globals.css` (e.g., `--font-sans: var(--font-inter);`).
- **Animations:** Custom keyframes in `globals.css` (`fade-in-up`, `shimmer`, `float`) are widely used on the homepage to create a polished, staggered entrance effect (`delay-1` through `delay-6`).
- **Glassmorphism:** Navigation components (`TopNav`, `BottomNav`) utilize `backdrop-blur-xl` and semi-transparent background colors.

## 6. Schedule Page (`/schedule`)

The Schedule page is a **daily planner hub** with two views:

### Day View (default)
- Horizontal scrollable day selector (Sat–Fri), auto-selects current day
- Three integrated sections:
  1. **Classes** — `ScheduleCard` components from routine. Active class gets "NOW" badge
  2. **Due Today** — Assignments + lab reports due on the selected day
  3. **Coming Up** — Upcoming deadlines (next 3 days, only shown for today)
- "Next Up" card shows next upcoming class with time remaining

### Week Grid View
- CSS table: Days on Y-axis, Time on X-axis
- Subject-colored cells via `SubjectContext`
- Sticky day column for mobile horizontal scrolling
- Today's row highlighted, current time slot glowing
- Deadline dots on days with due items

### Schedule Helper Utilities (`lib/schedule-helpers.js`)
| Function | Purpose |
|---|---|
| `getTodayClasses(routine)` | Today's non-null class slots |
| `getCurrentClass(routine)` | Class happening right now |
| `getNextClass(routine)` | Next upcoming class with `minutesUntil` |
| `getClassesForDay(routine, dayName)` | Classes for any specific day |
| `getItemsDueOnDate(items, date)` | Filter assignments/labs by date |
| `getUpcomingItems(items, fromDate, days)` | Near-future deadlines |
| `formatTime(timeStr)` | "9:00" → "9:00 AM", "2:00" → "2:00 PM" |
| `timeToMinutes(timeStr)` | Time string to minutes since midnight |
| `getDayName(dayIndex)` | JS day index (0–6) to routine day name |
| `getTodayName()` | Today's routine day name |

## 7. Admin Panel (`/admin`)

### Architecture: Universal Modular CRUD System
The admin panel uses **3 universal components** that compose into any data management page:

1. **`AdminDataTable`** — Universal data grid
   - Props: `columns`, `data`, `searchKeys`, `onEdit`, `onDelete`
   - Built-in search bar + sort by column header
   - Responsive: table on desktop, card-list on mobile
   - Delete requires click → confirm (3s auto-cancel)
   - Row click → edit

2. **`AdminFormDrawer`** — Universal slide-in form
   - Props: `fields`, `initialData`, `onSubmit`, `onClose`
   - Field types: `text`, `textarea`, `select`, `multi-select`, `date`, `number`, `file`, `toggle`
   - Handles "Add New" and "Edit" modes
   - Body scroll lock when open

3. **`AdminCrudPage`** — Universal page composer
   - Props: `title`, `icon`, `columns`, `fields`, `data`, `searchKeys`, `onAdd`, `onUpdate`, `onDelete`
   - Composes DataTable + FormDrawer with state management
   - Every CRUD page is ~50 lines of config passed to this component

### Admin Pages
| Route | Page | Pattern |
|---|---|---|
| `/admin` | Dashboard | Custom (stat cards, quick actions, pending items) |
| `/admin/login` | Login | Custom (standalone, no sidebar. Password: `orios2026`) |
| `/admin/notes` | Notes Manager | AdminCrudPage |
| `/admin/assignments` | Assignments Manager | AdminCrudPage |
| `/admin/lab-reports` | Lab Reports Manager | AdminCrudPage |
| `/admin/teachers` | Teachers Manager | AdminCrudPage (with multi-select subjects) |
| `/admin/files` | Files Manager | AdminCrudPage (with file upload) |
| `/admin/subjects` | Subjects Manager | AdminCrudPage (under Routine in sidebar) |
| `/admin/routine` | Routine Editor | Custom (RoutineEditor grid) |

### Admin Auth (`lib/admin-auth.js`)
- Placeholder: simple password check against `"orios2026"`, stored in `localStorage`
- `AdminAuthProvider` context: `login(password)`, `logout()`, `isAuthenticated`, `isLoading`
- `useAdminAuth()` hook
- **Will be replaced with real auth (Supabase/etc) later**

### Admin Sidebar Navigation Structure
The sidebar groups Subjects under Routine:
```
Dashboard
Notes
Assignments
Lab Reports
Teachers
Files
Routine
  └── Subjects
```
Supports `children` property for nested nav items. Mobile: collapses to hamburger with slide-in overlay.

### RoutineEditor Component
- Interactive CSS table grid (Days × Time Slots)
- Click empty cell → popover to pick subject from palette
- Filled cells: inline-editable room and type (lecture/lab) fields
- Clear cell via delete button in popover
- Save/Reset buttons in the wrapper page

### How to Add a New CRUD Section
```jsx
"use client";
import { useState } from "react";
import { mockData } from "@/lib/mock-data";
import AdminCrudPage from "@/components/admin/AdminCrudPage";
import { Icon } from "lucide-react";

const columns = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status", render: (item) => <Badge>{item.status}</Badge> },
];

const fields = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "status", label: "Status", type: "select", options: [...] },
];

export default function AdminNewPage() {
  const [data, setData] = useState([...mockData]);
  return (
    <AdminCrudPage
      title="Item"
      icon={Icon}
      columns={columns}
      fields={fields}
      data={data}
      searchKeys={["title"]}
      onAdd={(item) => setData((prev) => [item, ...prev])}
      onUpdate={(item) => setData((prev) => prev.map((i) => (i.id === item.id ? item : i)))}
      onDelete={(item) => setData((prev) => prev.filter((i) => i.id !== item.id))}
    />
  );
}
```

## 8. Navigation Architecture
- **Desktop:** `TopNav` — sticky glassmorphism bar with nav links
- **Mobile:** `BottomNav` — fixed bottom bar with 5 tabs (Home, Notes, Search FAB, Schedule, More)
- **More menu:** Frosted glass bottom sheet with: Assignments, Lab Reports, Teachers, Files links + Preferences (theme toggle, subject colors toggle) + About + **Admin Panel link**
- **Admin:** Separate sidebar + topbar (no public nav). Mobile uses hamburger overlay.

### Route Map
| Route | Purpose |
|---|---|
| `/` | Homepage |
| `/notes` | Notes hub |
| `/assignments` | Assignment tracker |
| `/lab-reports` | Lab report tracker |
| `/schedule` | Schedule hub (Day/Week views) |
| `/teachers` | Teacher directory |
| `/files` | File sharing |
| `/more` | Settings/navigation |
| `/admin` | Admin dashboard |
| `/admin/login` | Admin login |
| `/admin/notes` | Admin: Notes CRUD |
| `/admin/assignments` | Admin: Assignments CRUD |
| `/admin/lab-reports` | Admin: Lab Reports CRUD |
| `/admin/teachers` | Admin: Teachers CRUD |
| `/admin/files` | Admin: Files CRUD |
| `/admin/subjects` | Admin: Subjects CRUD |
| `/admin/routine` | Admin: Routine editor |

## 9. Known Gotchas & Important Notes
1. **Hydration Mismatches with Themes:** Always use a `mounted` state check (`useState`/`useEffect`) before rendering theme-dependent UI like Sun/Moon toggle buttons. `next-themes` resolves the theme client-side only.
2. **Tailwind v4 Dark Mode:** Requires `@custom-variant dark (&:where(.dark, .dark *));` in `globals.css` for class-based dark mode to work with `next-themes`.
3. **Component Directives:** Almost all components require `"use client"` since they use hooks (`useTheme`, `useState`, `usePathname`).
4. **Responsive Navigation:** Desktop = `TopNav` (`hidden md:block`), Mobile = `BottomNav` (`md:hidden`).
5. **Time Formatting Heuristic:** `schedule-helpers.js` treats hours 1–7 as PM for class schedules (university classes don't start at 1 AM). If time ranges change, update `formatTime()` and `timeToMinutes()`.
6. **Admin Auth is Placeholder:** `admin-auth.js` uses localStorage. The password `"orios2026"` is hardcoded. Replace with real auth before production.
7. **Admin Layout Isolation:** The admin panel (`app/admin/layout.js`) does NOT render `AppShell` (no TopNav/BottomNav). It uses its own `AdminSidebar` + `AdminTopbar`. This is intentional — admin is a separate app experience.
8. **Single Source of Truth for Routine:** Both the homepage "Today's Schedule" section and the `/schedule` page derive from `mockWeeklyRoutine` via `schedule-helpers.js`. Never create a second routine data source.

## 10. Implementation Changelog
- **Initial Setup**: Created repository structure, legacy reference folder, and initialized agent skills.
- **Legacy Purge**: Documented legacy v1 architecture in `legacy_website_profile.md` and deleted the old codebase. Saved mascot images to `assets/`.
- **UI Bootstrap**: Bootstrapped Next.js 15 app. Built custom Tailwind v4 theme, `ThemeProvider`, mobile `BottomNav`, desktop `TopNav`, and full homepage (`app/page.js`) with responsive card components.
- **Bug Fix**: Added `mounted` state check to theme toggle buttons in `TopNav.js` and `page.js` to prevent React hydration mismatches (and crashes caused by Dark Reader).
- **Bug Fix**: Added `@custom-variant dark` to `globals.css` to properly enable class-based dark mode in Tailwind v4 so it syncs with `next-themes`. Also added `pointer-events-none` and `z-10` to `TopNav` to fix a CSS stacking context issue.
- **UI & Navigation Overhaul**: Redesigned the mobile homepage to be compact above the fold. Redesigned `BottomNav` to include a prominent center Search FAB and a frosted glass slide-up bottom sheet for the "More" menu. Added the `/more` (settings/navigation) and `/notes` (subject-filtered list) pages.
- **Subject System Core**: Centralized subject data model in `lib/subjects.js`. Updated all pages and mock data to use `subjectId` pointers instead of hardcoded strings. Implemented persistent subject color coding across the app via a React Context (`lib/SubjectContext.js`), with toggles in the BottomNav More menu and More page.
- **Schedule Page**: Built `/schedule` hub with Day/Week toggle. Day View = daily planner integrating classes, due items, and upcoming deadlines. Week Grid = screenshot-friendly timetable with subject-colored cells, sticky day column, and deadline dots. Created `lib/schedule-helpers.js` for shared utilities. Replaced `mockSchedule` with `mockWeeklyRoutine` (7-day, 8-slot structure). Updated homepage to use `getTodayClasses()` from shared helpers. Changed all nav links from `/calendar` to `/schedule`.
- **Admin Panel**: Built complete admin panel from scratch (17 new files). Created universal CRUD system: `AdminDataTable`, `AdminFormDrawer`, `AdminCrudPage`. Built 9 admin routes: Dashboard, Login, Notes, Assignments, Lab Reports, Teachers, Files, Subjects, and Routine Editor. Admin has its own isolated layout with sidebar + topbar. Placeholder auth via localStorage. Added Admin Panel link in BottomNav hamburger menu. Moved Subjects under Routine in admin sidebar.
- **Admin Auth & Multiple Admin Management**: Replaced single-password placeholder with a multi-account, role-based session auth system. Added Next.js Edge middleware to gate admin pages, introduced cookie-based sessions, updated login forms to support email/password credentials, built an `/admin/admins` account management CRUD view (restricted to `super_admin`), and customized user details & theme toggle in `AdminTopbar`.
- **Cloudflare & Supabase Migration**: Replaced simulated localStorage auth and static mock arrays with active Supabase PostgreSQL database integration, Supabase Auth, and Supabase Storage. Set up `@supabase/ssr` cookies/session sync, refactored Next.js Edge middleware to verify JWTs, configured files uploader to write to Supabase Storage, and verified Next.js compiler builds pass successfully.
- **Global Search Overlay & Cloudflare Fixes**: Created the `SearchOverlay` component for global search (command palette style). Integrated with keyboard shortcuts (⌘K/Ctrl+K, `/`), parallel Supabase queries across all entities, and arrow key list navigation. Connected desktop homepage search bar and mobile BottomNav FAB. Resolved `__name is not defined` ReferenceError by setting `keep_names: false` in `wrangler.jsonc`.
- **Subject Code Display in Routine**: Modified the weekly schedule grid (`WeekGrid.js`) and the routine editor (`RoutineEditor.js`) to display the full subject course code (e.g., `CSE 1201`) instead of the abbreviated subject name (`CSE`).
- **Auto-assigned Teacher Initials**: Integrated teacher initials lookup with subject assignments in the routine grid. Updated Next.js views and admin panels to fetch and propagate teacher initials, displaying them inline within `WeekGrid.js` and `RoutineEditor.js` cells alongside the room numbers.

## How to use this skill
- Before writing new code, read this file to understand established patterns.
- After completing a task, use the `replace_file_content` tool to append a bullet point to the `Implementation Changelog`.
- If a core architecture decision changes, update the `Tech Stack` or `Architecture & Data Flow` sections accordingly.
