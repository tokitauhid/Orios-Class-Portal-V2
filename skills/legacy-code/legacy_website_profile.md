# Orios Portal V1 — Legacy Website Profile

> **Purpose**: This document is the complete, permanent reference for the original Orios Class Portal (v3.0.0). The legacy codebase has been deleted. All functional requirements, data schemas, component behaviors, design decisions, API contracts, and known issues are documented here so V2 can be built from understanding, not from copying broken code.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Package Name** | `orios-class` |
| **Version** | 3.0.0 |
| **License** | GPL v3 |
| **Tagline** | "Your smart class companion — Notes, Assignments, Events & more" |
| **Target Users** | University students (Section D) in Bangladesh |
| **Site Title** | Orios Class |
| **Favicon** | `orio.png` (custom mascot) |
| **Mascots** | `orio.png` (primary), `orio1.png` (alt pose), `pucu.png` (secondary character), `orio.svg` (vector) |

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Docusaurus 3.9.2 | Classic preset, `docs: false`, `blog: false` — pure pages app |
| UI | React 19 | |
| Styling | Vanilla CSS Modules | Co-located `.module.css` per page/component |
| Global CSS | `src/css/custom.css` | Design token system (10KB) |
| Typography | Google Fonts | Inter (body, 300-900), Outfit (headings, 300-800) |
| Backend | Cloudflare Pages Functions | `functions/api/` directory |
| Database | Cloudflare KV | Binding name: `orios_data` |
| Local Dev Fallback | `localStorage` | All reads check `isApiAvailable()` first |
| Deployment | `docusaurus build && wrangler deploy` | Cloudflare Pages |
| Dev Server | `npm run start` (port 3000) | Hot reload, no KV |
| Node | ≥ 20.0 | |
| Config | `wrangler.jsonc` | KV namespace ID for Cloudflare binding |

---

## 3. Complete Page Inventory

### Public Pages

| Route | File | Purpose | Key Features |
|---|---|---|---|
| `/` | `src/pages/index.js` | Homepage | Hero section, notice banner, stat cards, countdown timers, today's schedule, quick-access feature grid, search overlay |
| `/notes` | `src/pages/notes.js` | Notes hub | Subject-grouped notes, search + filter, PDF/image/link/doc types |
| `/assignments` | `src/pages/assignments.js` | Assignment tracker | Card grid, status badges (pending/submitted/overdue/graded), due dates, file downloads |
| `/lab-reports` | `src/pages/lab-reports.js` | Lab report tracker | Same pattern as assignments, lab-number based |
| `/calendar` | `src/pages/calendar.js` | Calendar + routine | ICS feed parsing via `/api/ics-proxy`, interactive month grid, event dots, routine viewer |
| `/doom-clock` | `src/pages/doom-clock.js` | Exam countdowns | Live countdown timers sourced from events collection |
| `/teachers` | `src/pages/teachers.js` | Teacher directory | Profile cards with contact info, office hours, subjects |
| `/files` | `src/pages/files.js` | File sharing | Password-protected downloads, card grid |

### Admin Pages

| Route | File | Purpose | Pattern |
|---|---|---|---|
| `/admin` | `src/pages/admin/index.js` | Dashboard | **Custom** — stats cards, quick actions, settings form, subject manager |
| `/admin/login` | `src/pages/admin/login.js` | Login | **Custom** — standalone email/password form |
| `/admin/admins` | `src/pages/admin/admins.js` | Manage admins | **Custom** — super_admin only, add/remove admin accounts |
| `/admin/notices` | `src/pages/admin/notices.js` | CRUD notices | **AdminCrud pattern** |
| `/admin/events` | `src/pages/admin/events.js` | CRUD events | **AdminCrud pattern** |
| `/admin/assignments` | `src/pages/admin/assignments.js` | CRUD assignments | **AdminCrud pattern** |
| `/admin/lab-reports` | `src/pages/admin/lab-reports.js` | CRUD lab reports | **AdminCrud pattern** |
| `/admin/notes-manager` | `src/pages/admin/notes-manager.js` | CRUD notes | **AdminCrud pattern** |
| `/admin/teachers-manager` | `src/pages/admin/teachers-manager.js` | CRUD teachers | **AdminCrud pattern** |
| `/admin/files-manager` | `src/pages/admin/files-manager.js` | CRUD files | **AdminCrud pattern** |
| `/admin/routine-manager` | `src/pages/admin/routine-manager.js` | Routine editor | **Custom** — complex weekly grid editor (23KB, largest file) |

---

## 4. Component Library

### `AdminSystem` (src/components/AdminSystem/index.js) — 452 lines, 4 exports

1. **`AdminLayout`** — Page wrapper for all admin routes
   - Sidebar navigation (10 items), mobile hamburger menu
   - Auth check on mount → redirect to `/admin/login` if unauthorized
   - Session via `localStorage("orios_admin_verified")`
   - User info display in sidebar footer (avatar initial, email)
   - Overlay for mobile sidebar

2. **`DataTable`** — Sortable/searchable data grid
   - Props: `columns`, `data`, `onEdit`, `onDelete`, `searchKeys`
   - Client-side search across multiple columns
   - CSS grid layout, mobile collapses to card view
   - Double-click delete confirmation (3s timeout)
   - Count badge shows filtered item count

3. **`AdminForm`** — Slide-in drawer form
   - Props: `isOpen`, `onClose`, `onSubmit`, `title`, `fields`, `initialData`
   - Field types: `text`, `date`, `datetime-local`, `select`, `textarea`, `tags`, `file`, `select-with-custom`
   - File uploads: reads as base64 data URLs, max 25MB
   - Auto-populates file metadata (name, size, type, icon, format, tags)
   - Uses `window.showOpenFilePicker` API with fallback to hidden `<input type="file" accept="*/*">`
   - Auto-generates default dates for date/datetime fields

4. **`AdminCrud`** — Full CRUD page generator (compose pattern)
   - Props: `title`, `icon`, `collection`, `fields`, `columns`, `searchKeys`, `addLabel`, `onSubmitModifier`
   - Composes AdminLayout + DataTable + AdminForm
   - Most admin pages are just config objects passed to this component
   - `onSubmitModifier` allows transforming form data before save

### `Cards` (src/components/Cards/index.js) — 306 lines, 4 exports

1. **`FeatureCard`** — Homepage quick-access card (icon, title, description, arrow link)
2. **`FileShareCard`** — File download card with password-protection modal
3. **`TeacherCard`** — Teacher profile card (avatar, name, department, contact, subjects)
4. **`CountdownTimer`** — Live countdown (days/hours/minutes/seconds), urgent mode when < 24h
5. **`NoticeBanner`** — Scrolling marquee banner for notices (duplicated children for seamless loop)

### `SearchOverlay` (src/components/SearchOverlay/index.js) — 131 lines

- Full-screen modal search
- Searches across: title, subject, description, tags, name
- Results capped at 12
- ESC to close, body scroll locked
- Shows "Start typing..." hint when empty

### `Toast` (src/components/Toast/index.js) — 95 lines

- React Context pattern: `ToastProvider` wraps app, `useToast()` hook
- Types: error, success, warning, info (each with emoji icon)
- Auto-dismiss with configurable duration (default 5s)
- Slide-out exit animation (300ms)
- Click-to-dismiss

### `EventCalendar` — Interactive monthly calendar grid with event dots
### `RoutineViewer` — Weekly class schedule table viewer

---

## 5. API Contract (Cloudflare Pages Functions)

### Endpoint: `/api/data`

**Single endpoint** handling all data operations.

#### GET `/api/data?collection=<name>`

- Returns the full collection as JSON array/object
- `?id=<itemId>` — returns single item with full data (including `fileData`)
- List responses strip `fileData` by default (returns `_hasFile: true` marker)
- `?fields=full` — returns full data including `fileData` blobs
- Admin collection strips password fields on public read
- Response headers: `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`

#### POST `/api/data`

Body: `{ action, collection, ...params }`

| Action | Body Fields | Auth Required | Description |
|---|---|---|---|
| `add` | `item` | ✅ | Push new item (auto-generates `id: Date.now()`) |
| `update` | `id`, `updates` | ✅ | Merge updates into item by id |
| `delete` | `id` | ✅ | Remove item by id |
| `set` | `data` | ✅ | Replace entire collection (for routine/settings/subjects) |
| `verify` | — | ✅ | Auth probe, returns `{ ok: true }` |
| `bootstrap_admin` | `admin: { email, password }` | ❌ | First admin setup (only when admin list empty) |
| `add_admin` | `admin: { email, password, role }` | ✅ | Add admin account |
| `remove_admin` | `email` | ✅ | Remove admin by email |
| `change_password` | `email, oldPassword, newPassword` | ✅ | Update admin password |

#### Auth Mechanism

- Bearer token = `btoa("email:password")`
- Token sent in `Authorization: Bearer <token>` header
- Server decodes token, checks email:password against admins collection
- **Passwords stored in plaintext in KV** ⚠️

#### CORS Middleware (`_middleware.js`)

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- OPTIONS returns 204

#### ICS Proxy (`ics-proxy.js`)

- `GET /api/ics-proxy?url=<encoded_url>`
- Proxies external ICS calendar feeds to avoid CORS
- Caches 1 hour

### KV Binding Resolution

The API function `getKVBinding(env)` tries (in order):
1. `env[KV_BINDING_NAME]` (from `kv_config.js`: `"orios_data"`)
2. `env.ORIOS_DATA`
3. Any object on `env` with `.get()` and `.put()` methods

---

## 6. Data Schemas

### Collections (all stored as JSON arrays in KV)

#### `notices`
```json
{ "id": 1719000000000, "text": "Notice content", "type": "info|warning|urgent" }
```

#### `events`
```json
{ "id": 1719000000000, "title": "Midterm Exam", "date": "2026-07-15T10:00", "type": "exam|event|holiday", "description": "..." }
```

#### `assignments`
```json
{ "id": 1719000000000, "title": "Assignment 1", "subject": "EEE 1201", "description": "...", "dueDate": "2026-07-20T23:59", "status": "pending|submitted|overdue|graded", "fileData": "data:application/pdf;base64,...", "_hasFile": true, "url": "..." }
```

#### `labReports`
```json
{ "id": 1719000000000, "title": "Lab Report 3", "subject": "PHY 1201", "labNumber": 3, "description": "...", "dueDate": "2026-07-18T23:59", "status": "pending|submitted|overdue|graded", "grade": "A", "fileData": "data:...", "_hasFile": true }
```

#### `notes`
```json
{ "id": 1719000000000, "title": "Chapter 1 Notes", "subject": "EEE 1201", "description": "...", "type": "pdf|image|link|doc", "url": "https://...", "fileData": "data:...", "_hasFile": true, "tags": ["chapter1", "circuit"], "icon": "📄" }
```

#### `teachers`
```json
{ "id": 1719000000000, "name": "Dr. Smith", "title": "Professor", "designation": "Associate Professor", "department": "EEE", "email": "smith@uni.edu", "phone": ["01XXXXXXXXX"], "office": "Room 305", "officeHours": "Sun-Thu 10-12", "subjects": ["EEE 1201", "EEE 2101"], "avatar": "👨‍🏫", "icon": "👨‍🏫" }
```

#### `files`
```json
{ "id": 1719000000000, "name": "Assignment1.pdf", "title": "Assignment 1", "subject": "EEE 1201", "type": "pdf", "format": "PDF", "size": "2.5 MB", "icon": "📄", "uploadedBy": "admin@example.com", "downloads": 0, "password": "secret123", "fileData": "data:...", "_hasFile": true, "url": "...", "tags": ["eee", "assignment"] }
```

#### `routine` (stored as single object)
```json
{
  "timeSlots": ["8:00", "9:00", "10:00", ...],
  "days": ["Saturday", "Sunday", "Monday", ...],
  "schedule": {
    "Saturday": [null, { "subject": "EEE 1201", "teacher": "Dr. Smith", "room": "Room 301", "type": "lecture", "time": "9:00" }, ...],
    "Sunday": [...]
  }
}
```

#### `settings` (stored as single object)
```json
{ "welcomeText": "Welcome message here", "countryCode": "BD" }
```

#### `subjects` (stored as array of strings)
```json
["EEE 1201", "PHY 1201", "MATH 1201", "CSE 1201", "ENG 1201"]
```

#### `admins`
```json
[{ "email": "admin@example.com", "password": "plaintext123", "role": "super_admin|admin", "addedAt": "2026-01-01T00:00:00.000Z" }]
```

---

## 7. Frontend Auth & Data Layer (`src/auth/index.js`)

### Exported Functions

| Function | Description |
|---|---|
| `signIn(email, password)` | Login, auto-bootstrap first admin, returns user object |
| `signOut()` | Clears localStorage auth keys |
| `getCurrentUser()` | Returns `{ email, displayName, role }` from localStorage |
| `isAdmin(email)` | Checks if email is in admins list |
| `isSuperAdmin(email)` | Checks if email has super_admin role |
| `getAdmins()` | Fetch admin list (passwords stripped) |
| `addAdmin(email, password, role)` | Add admin account |
| `removeAdmin(email)` | Remove admin by email |
| `changePassword(email, oldPw, newPw)` | Update password |
| `getAll(collection)` | Fetch all items (uses session cache, 2min TTL) |
| `getOne(collection, id)` | Find item by ID from cached list |
| `getOneById(collection, id)` | Direct API fetch by ID (includes fileData) |
| `addItem(collection, item)` | Add new item |
| `updateItem(collection, id, updates)` | Partial update |
| `deleteItem(collection, id)` | Delete by ID |
| `getRoutine()` | Fetch routine object |
| `saveRoutine(data)` | Save routine |
| `getSettings()` | Fetch settings (defaults: welcomeText="", countryCode="BD") |
| `saveSettings(data)` | Save settings |
| `getSubjects()` | Fetch subjects array |
| `saveSubjects(subjects)` | Save subjects |
| `autoUpdateStatuses()` | Batch-mark overdue assignments/labs |

### Caching Strategy

- **Session cache**: `sessionStorage` with 2-minute TTL per collection
- Cache invalidated on any write (add/update/delete)
- API availability check cached for session lifetime (`_apiAvailable` flag)

### Fallback Logic

Every read function:
1. Check `isApiAvailable()` (cached after first check)
2. If API available → fetch from `/api/data`
3. If API unavailable → read from `localStorage`
4. Write operations **throw errors** when API is unavailable (no local write fallback)

---

## 8. Design System (CSS Custom Properties)

### Brand Colors
- **Primary**: `#6366f1` (indigo) — dark mode: `#818cf8`
- **Accent**: `#f472b6` (pink), light: `#f9a8d4`
- **Success**: `#10b981`, **Warning**: `#f59e0b`, **Danger**: `#ef4444`, **Info**: `#06b6d4`

### Gradients
- **Primary**: `135deg, #6366f1 → #a855f7 → #ec4899` (indigo → purple → pink)
- **Hero**: `135deg, #0f0c29 → #302b63 → #24243e` (deep dark blue)
- **Card**: subtle 5% opacity primary tint
- **Glass**: subtle white overlay
- **Glow**: radial gradient centered, 15% opacity primary

### Surfaces (Light)
| Token | Value |
|---|---|
| `--surface-0` | `#ffffff` |
| `--surface-1` | `#f8fafc` |
| `--surface-2` | `#f1f5f9` |
| `--surface-3` | `#e2e8f0` |
| `--surface-card` | `rgba(255,255,255,0.8)` |
| `--surface-glass` | `rgba(255,255,255,0.6)` |

### Surfaces (Dark)
| Token | Value |
|---|---|
| `--surface-0` | `#0f172a` |
| `--surface-1` | `#1e293b` |
| `--surface-2` | `#334155` |
| `--surface-3` | `#475569` |
| `--surface-card` | `rgba(30,41,59,0.8)` |
| `--surface-glass` | `rgba(30,41,59,0.6)` |

### Text
| Token | Light | Dark |
|---|---|---|
| `--text-primary` | `#0f172a` | `#f1f5f9` |
| `--text-secondary` | `#475569` | `#cbd5e1` |
| `--text-muted` | `#94a3b8` | `#64748b` |
| `--text-inverse` | `#ffffff` | `#ffffff` |

### Spacing Scale
`xs: 4px` → `sm: 8px` → `md: 16px` → `lg: 24px` → `xl: 32px` → `2xl: 48px` → `3xl: 64px`

### Radius Scale
`sm: 8px` → `md: 12px` → `lg: 16px` → `xl: 24px` → `full: 9999px`

### Shadow Scale
`xs` → `sm` → `md` → `lg` → `xl` + `glow` (indigo tinted) + `glow-lg`

### Transitions
- **Fast**: 150ms ease-out
- **Base**: 250ms ease-out
- **Slow**: 400ms ease-out
- **Bounce**: 500ms cubic-bezier(0.34, 1.56, 0.64, 1)

### Typography
- **Body**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Headings**: Outfit, Inter, sans-serif
- **Display**: Outfit, sans-serif
- **Base size**: 16px (15px on mobile ≤768px)
- **Heading weight**: 700, letter-spacing: -0.02em

### Animations (keyframes)
`fadeInUp`, `fadeIn`, `slideInLeft`, `slideInRight`, `pulse`, `shimmer`, `float`, `marquee`, `scaleIn`, `gradientShift`, `countdownPulse`, `ripple`, `dotBlink`

### Utility Classes
- `.glass` — `backdrop-filter: blur(16px)` with glass surface
- `.glass-strong` — `backdrop-filter: blur(24px)` with card surface
- `.animate-fade-in-up`, `.animate-fade-in`, `.animate-scale-in`
- Custom scrollbar (8px, rounded thumb)
- `::selection` — indigo tinted (30% opacity)

### Responsive Breakpoints
- Mobile: `≤ 768px` (card layouts, reduced font size)
- Desktop sidebar: `≤ 1024px` (admin sidebar collapse)

---

## 9. Homepage Anatomy (index.js — 578 lines)

### Data Loading
Fetches **9 collections in parallel** on mount: settings, routine, notices, events, notes, assignments, teachers, files, labReports.

### Sections (in order)

1. **NoticeBanner** — Marquee scroll of active notices across top
2. **Hero** — Gradient background with floating orbs (3 animated circles), badge "🎓 Class Portal", gradient title "Welcome to Orios Class" with mascot image, welcome text (from settings), subtitle, search button with ⌘K shortcut hint
3. **Loading Skeleton** — Shown while data loads. Mimics stat cards, countdown grid, schedule grid, and feature grid with shimmer animation
4. **Quick Stats Strip** — 4 stat cards (horizontal): Classes Today, Pending Tasks, Upcoming Events, Total Notes. Each is a link to its respective page
5. **Upcoming Events** — Section with countdown timers. Shows next exam prominently + 3 nearest upcoming events/assignments/labs. Mascot (orio1.png) easter egg in corner
6. **Today's Schedule** — Shows today's classes from routine data. Each card: time, subject, room, teacher, type badge (lecture/lab). Empty state: "🎉 No classes today!"
7. **Quick Access Grid** — 6 feature cards: Notes, Assignments, Lab Reports, Calendar, Teachers, File Sharing. Each with icon, title, description, arrow. Mascot (pucu.png) easter egg
8. **SearchOverlay** — Full-screen search modal (triggered by hero button or ⌘K)

### Helper Functions in Homepage
- `getGlobalCountdowns(events, assignments, labReports, count)` — Merges and sorts upcoming items across collections
- `getNextExam(eventList)` — Finds closest future exam
- `getTodayClasses(routineData)` — Extracts today's schedule entries
- `formatTime(timeStr)` — Converts 24h time to 12h AM/PM format
- `getPendingCount(list)` — Counts pending, non-overdue items

---

## 10. Navigation Structure

### Top Navbar (Docusaurus-managed)
**Left**: 📝 Notes, 📋 Assignments, 🔬 Lab Reports, 📅 Calendar, ⏳ Doom Clock, 👨‍🏫 Teachers, 📁 Files
**Right**: ⚙️ Admin Panel

### Admin Sidebar
📊 Dashboard, 📢 Notices, 📅 Events, 📋 Assignments, 🔬 Lab Reports, 📝 Notes, 👨‍🏫 Teachers, 📁 Files, 🗓️ Routine, 👥 Admins

### Footer (3 columns)
- **Academics**: Notes, Assignments, Lab Reports
- **Campus**: Calendar & Events, Teacher Directory, File Sharing
- **Quick Links**: Home

---

## 11. Known Bugs & Architectural Issues

1. **CSS class naming collision** in AdminSystem: sidebar overlay uses `.overlay`, form drawer uses `.formOverlay`/`.formDrawer`/`.formOpen`. Mismatching causes form to render inline.

2. **Base64 file storage bloat**: Files stored as base64 data URLs directly in KV. 25MB files become ~33MB base64 strings. This makes KV reads extremely slow and hits payload limits.

3. **Plaintext passwords**: Admin passwords stored unencrypted in KV. Only protection is GET endpoint stripping them from responses.

4. **Client-side auth gating**: Admin verification relies on `localStorage("orios_admin_verified")`. Real security is Bearer token check on API, but any user can set this localStorage key.

5. **Fragmented admin pages**: Each content type (notes, assignments, labs, files) has nearly identical CRUD logic duplicated across separate page files and the AdminCrud compose pattern. Changes to upload logic must be replicated everywhere.

6. **No file validation consistency**: File upload in AdminForm handles base64 conversion but each admin page defines its own field configs independently. Validation rules (file types, sizes) are inconsistent.

7. **No progress tracking for uploads**: Large file reads (base64 conversion) happen synchronously with no progress indicator. Users see nothing during multi-MB file processing.

8. **Session cache can serve stale data**: 2-minute TTL means another admin's changes won't appear for up to 2 minutes.

9. **`autoUpdateStatuses()` is destructive**: Replaces entire collection using `set` action when marking items overdue. Race condition if another admin writes simultaneously.

10. **Mobile overflow suppression**: `overflow-x: hidden` on html/body at ≤768px — hides horizontal overflow bugs rather than fixing layout.

11. **Routine manager complexity**: At 23KB, `routine-manager.js` is the largest single file and handles its own complex grid editing logic entirely independently from the rest of the admin system.

12. **No offline support**: Despite localStorage fallback for reads, writes throw errors when API is unavailable. No queue or retry.

---

## 12. Deployment Configuration

### `wrangler.jsonc`
- KV namespace binding: `orios_data` → configured namespace ID
- Pages project connected to GitHub repo

### `package.json` Scripts
- `start`: `docusaurus start` (dev, port 3000)
- `build`: `docusaurus build`
- `deploy`: `docusaurus build && wrangler deploy`
- `preview`: `docusaurus build && wrangler dev`

### Cloudflare Requirements
1. Cloudflare Pages project connected to GitHub
2. KV namespace `orios_data` created in dashboard
3. KV binding configured in Pages settings
4. `wrangler.jsonc` has namespace ID

---

## 13. Asset Inventory

| File | Size | Purpose |
|---|---|---|
| `orio.png` | 216 KB | Primary mascot — used in hero, navbar logo, OG image |
| `orio1.png` | 206 KB | Alternate mascot pose — used in countdown section easter egg |
| `pucu.png` | 386 KB | Secondary mascot — used in quick access section easter egg |
| `orio.svg` | 10 KB | Vector version of mascot |
| `favicon.png` | 225 KB | Browser tab favicon |
