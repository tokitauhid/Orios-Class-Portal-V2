---
name: project-context
description: Self-improving context and changelog for the Orios-V2 project. MUST be updated after every architectural change.
---

# Orios-V2 Project Context (Self-Improving)

**CRITICAL RULE**: Whenever you (the agent) make a significant structural change, add a new dependency, create a new core component, or make a design decision, you MUST update this file to reflect the new state of the project.

## Current State & Decisions
- **Project Status**: Bootstrapped Next.js. Built the foundational AppShell and Homepage UI with mock data.
- **Architecture**: Next.js 15 (App Router), Tailwind CSS v4, deployed to Cloudflare Workers (`@opennextjs/cloudflare`).
- **Design Paradigm**: "Quiet Premium" — Flat, fluid, mobile-first. Muted zinc/slate palette, dark-mode default, subtle indigo accents. Minimal borders, generous touch targets. No heavy vibrant gradients.
- **Data Paradigm**: (Pending backend integration) Currently using static mock data in `lib/mock-data.js`.

## Implementation Changelog
- **Initial Setup**: Created repository structure, legacy reference folder, and initialized agent skills.
- **Legacy Purge**: Documented legacy v1 architecture in `legacy_website_profile.md` and deleted the old codebase. Saved mascot images to `assets/`.
- **UI Bootstrap**: Bootstrapped Next.js 15 app. Built custom Tailwind v4 theme, `ThemeProvider`, mobile `BottomNav`, desktop `TopNav`, and full homepage (`app/page.js`) with responsive card components.

## How to use this skill
- Before writing new code, read this file to understand established patterns.
- After completing a task, use the `replace_file_content` tool to append a bullet point to the `Implementation Changelog`.
- If a core architecture decision changes, update the `Current State & Decisions` section accordingly.
