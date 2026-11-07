# Changelog

All notable changes to **Grantly** are documented in this file.

## [1.2.0] - 2026-11-07
### Added
- Interactive Multi-Year Tuition & Financial Aid Coverage Estimator on the Dashboard (`/dashboard`).
- Typed Scholarship API client (`src/api/scholarshipApi.ts`) with `AbortController` support, TTL caching, and error boundaries.
- Service Worker (`public/sw.js`) for offline resilience and static asset caching.
- Responsive `@container` queries, `<picture>` art-directed media, and collapsible mobile navigation drawers across all shells.
- Inline personal application notes & portal reference ID inputs on Kanban cards and Scholarship Detail pages.

## [1.1.0] - 2026-11-07
### Added
- Unified interactive Scholarship Discovery, Live Eligibility Calculator, and Application Tracker on `/` (`LandingPage.tsx`).
- Global `Ctrl+K` / `Cmd+K` Quick Scholarship Finder & Eligibility Modal (`App.tsx`).
- Portfolio analytics & RFC 4180 `.csv` spreadsheet export (`src/services/scholarshipService.ts`).
- Security & input sanitization utilities (`src/utils/security.ts`).

## [1.0.0] - 2026-11-07
### Added
- Explainable 7-rule Eligibility Match Engine (`0–100%` score) across 24 Indian scholarships.
- Document Readiness Vault, 6-stage Bento Kanban Application Tracker, Side-by-Side Comparison (`/compare`), and RFC 5545 `.ics` Calendar Export (`/deadlines`).
- Optical Fluted-Glass WebGL Fragment Shader (`ShaderBackground.tsx`) with Light and Night themes.
