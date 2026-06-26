---
name: legacy-code
description: Instructions for referencing and understanding the legacy Orios-Portal codebase.
---

# Legacy Code Reference Skill

When migrating features to the Orios-V2 project, you must refer to the legacy implementation stored in `_legacy_reference/` to understand the business requirements.

## Key Legacy Concepts
1. **Cloudflare KV Backend**: The old backend was a single serverless function (`_legacy_reference/functions/api/data.js`) reading unstructured JSON strings from Cloudflare KV.
2. **Data Structure**:
   - Lists (`notes`, `assignments`, `labReports`, `files`) had a `getAll` fetcher and lazy `fileData` fetching.
   - Objects (`routine`, `settings`, `subjects`) were stored as single KV keys.
3. **Frontend**: The old site was a Docusaurus-based React app located in `_legacy_reference/src/pages/`.
4. **Authentication**: Handled via simple base64-encoded `email:password` tokens in headers (`_legacy_reference/src/auth/index.js`).

## Rules for Migration
- **Do NOT copy old code directly.** Docusaurus-specific patterns and CSS Modules should be discarded.
- Translate business logic (like computing assignment statuses based on dates) into modern Next.js + Tailwind + Supabase patterns.
- Always refer to `plan.md` in the repository root for the new architecture guidelines.
