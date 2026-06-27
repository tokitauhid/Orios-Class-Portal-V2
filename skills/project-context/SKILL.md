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
├── package.json              # Next.js 16, React 19, Tailwind v4, next-themes
├── app/                      # Next.js App Router root
│   ├── layout.js             # Root layout (Inter font, ThemeProvider, AppShell)
│   ├── page.js               # Homepage (Hero, Stats, Deadlines, Schedule, Quick Access)
│   └── globals.css           # Global Tailwind v4 CSS, animations, custom scrollbar
├── components/               # Shared UI components
│   ├── AppShell.js           # Wraps pages with TopNav and BottomNav
│   ├── TopNav.js             # Desktop sticky navigation bar
│   ├── BottomNav.js          # Mobile fixed bottom navigation bar
│   ├── ThemeProvider.js      # Wraps next-themes provider and exports useTheme hook
│   ├── StatCard.js           # Top row statistical cards
│   ├── CountdownCard.js      # Exam/Lab deadline countdowns
│   ├── ScheduleCard.js       # Daily routine list items
│   └── FeatureCard.js        # Quick access grid items
├── lib/
│   └── mock-data.js          # Static placeholder data for initial UI development
└── assets/                   # Static assets migrated from legacy (e.g. mascot pngs)
```

## 4. Architecture & Data Flow
- **App Router paradigm:** The project strictly uses Next.js App Router (`app/`).
- **Data Paradigm:** Currently, the app relies on static mock data exported from `lib/mock-data.js` (Stats, Countdowns, Schedule, Features). Future integrations will likely connect to a serverless backend or Cloudflare KV/D1.
- **Layouts:** `app/layout.js` injects the `Inter` font, sets up `next-themes` (with `suppressHydrationWarning` on `<html>`), and wraps the entire app in `AppShell` which provides the responsive navigation.

## 5. Design Paradigm: "Quiet Premium"
- **Aesthetics:** Flat, fluid, mobile-first. Muted zinc/slate palette, dark-mode default, subtle indigo accents. Minimal borders, generous touch targets. No heavy vibrant gradients.
- **CSS Architecture:** Tailwind v4 is used with CSS custom properties injected via `@theme inline` in `globals.css` (e.g., `--font-sans: var(--font-inter);`).
- **Animations:** Custom keyframes in `globals.css` (`fade-in-up`, `shimmer`, `float`) are widely used on the homepage to create a polished, staggered entrance effect (`delay-1` through `delay-6`).
- **Glassmorphism:** Navigation components (`TopNav`, `BottomNav`) utilize `backdrop-blur-xl` and semi-transparent background colors (e.g., `bg-white/70 dark:bg-zinc-950/80`).

## 6. Known Gotchas & Important Notes
1. **Hydration Mismatches with Themes:** The desktop `TopNav` and mobile `page.js` footer use `lucide-react` icons (Sun/Moon) that swap based on the active theme. Because `next-themes` handles client-side detection but the server assumes the "system" default, conditionally rendering icons without waiting for the client to mount causes React hydration errors (which are further exacerbated by extensions like Dark Reader). **Always use a `mounted` state check** (from `useState`/`useEffect`) before rendering theme-dependent UI like the toggle button.
2. **Tailwind v4 Dark Mode:** Tailwind CSS v4 defaults to `@media (prefers-color-scheme: dark)` for the `dark:` variant. Since `next-themes` controls dark mode by applying the `dark` class to the `<html>` tag, Tailwind must be explicitly configured to use class-based dark mode. This is done via `@custom-variant dark (&:where(.dark, .dark *));` in `app/globals.css`. Without this, changing the theme class won't trigger `dark:` styles.
3. **Component Directives:** Almost all components in `components/` currently require `"use client"` since they interact with hooks like `useTheme`, `useState`, or `usePathname`.
4. **Responsive Navigation:** The site switches navigation paradigms at the `md` breakpoint. Desktop relies on `TopNav` (`hidden md:block`), while mobile relies on `BottomNav` (`md:hidden`).

## 7. Implementation Changelog
- **Initial Setup**: Created repository structure, legacy reference folder, and initialized agent skills.
- **Legacy Purge**: Documented legacy v1 architecture in `legacy_website_profile.md` and deleted the old codebase. Saved mascot images to `assets/`.
- **UI Bootstrap**: Bootstrapped Next.js 15 app. Built custom Tailwind v4 theme, `ThemeProvider`, mobile `BottomNav`, desktop `TopNav`, and full homepage (`app/page.js`) with responsive card components.
- **Bug Fix**: Added `mounted` state check to theme toggle buttons in `TopNav.js` and `page.js` to prevent React hydration mismatches (and crashes caused by Dark Reader).
- **Bug Fix**: Added `@custom-variant dark` to `globals.css` to properly enable class-based dark mode in Tailwind v4 so it syncs with `next-themes`. Also added `pointer-events-none` and `z-10` to `TopNav` to fix a CSS stacking context issue.

## How to use this skill
- Before writing new code, read this file to understand established patterns.
- After completing a task, use the `replace_file_content` tool to append a bullet point to the `Implementation Changelog`.
- If a core architecture decision changes, update the `Tech Stack` or `Architecture & Data Flow` sections accordingly.
