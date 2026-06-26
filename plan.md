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
