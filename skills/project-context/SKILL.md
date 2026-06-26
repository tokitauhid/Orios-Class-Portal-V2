---
name: project-context
description: Self-improving context and changelog for the Orios-V2 project. MUST be updated after every architectural change.
---

# Orios-V2 Project Context (Self-Improving)

**CRITICAL RULE**: Whenever you (the agent) make a significant structural change, add a new dependency, create a new core component, or make a design decision, you MUST update this file to reflect the new state of the project.

## Current State & Decisions
- **Project Status**: Initialized repository. Next.js not yet bootstrapped.
- **Architecture**: Next.js (App Router), Tailwind CSS, Supabase, shadcn/ui.
- **Design Paradigm**: Flat, fluid, mobile-first. No heavy borders or shadows.
- **Data Paradigm**: Relational PostgreSQL via Supabase, with Storage buckets for file uploads instead of base64 strings.

## Implementation Changelog
- **Initial Setup**: Created repository structure, legacy reference folder, and initialized agent skills.

## How to use this skill
- Before writing new code, read this file to understand established patterns.
- After completing a task, use the `replace_file_content` tool to append a bullet point to the `Implementation Changelog`.
- If a core architecture decision changes, update the `Current State & Decisions` section accordingly.
