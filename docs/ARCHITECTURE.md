# Grantly Architecture Guide

## Overview

Grantly is structured using a **feature-sliced frontend architecture**. Pure domain logic is separated from React components and persisted state so that core algorithms (`matchEngine`, `filterScholarships`, `computeDocumentReadiness`, `generateIcs`) are deterministic, fast, and 100% unit-testable without a DOM.

## Data Flow

```text
StudentProfile (useProfileStore) ──┐
                                   ├──► computeMatch() ──► MatchResult (score, verdict, 7 checks)
Scholarship[] (data/scholarships) ─┘          │
                                              ▼
ScholarshipFilters (useFilterStore) ──► filterScholarships() ──► RankedScholarship[]
```

## Module Responsibilities

- **`src/types/scholarship.ts`** — Canonical TypeScript interfaces for scholarships, eligibility criteria, student profiles, applications, and filter state.
- **`src/features/eligibility/`** — Contains the pure `computeMatch` engine and presentational components (`MatchBadge`, `MatchReasons`).
- **`src/features/scholarships/`** — Contains `filterScholarships`, `ScholarshipCard` (wrapped in `React.memo`), and `FilterPanel`.
- **`src/features/documents/`** — Computes and renders document readiness by comparing `scholarship.requiredDocuments` against `profile.documents`.
- **`src/features/applications/`** — Kanban board supporting HTML5 drag-and-drop and accessible `<select>` controls.
- **`src/features/deadlines/`** — Urgency classification (`critical`, `soon`, `upcoming`, `later`) and RFC 5545 `.ics` calendar generation.
- **`src/store/`** — Modular Zustand stores persisted to `localStorage` (`grantly-profile`, `grantly-applications`, `grantly-compare`, `grantly-theme`).

## Performance Strategy

1. **Route-Level Code Splitting:** Every route in `src/app/router.tsx` is loaded via `React.lazy` with an accessible `PageSkeleton` fallback.
2. **Manual Vendor Chunks:** `vite.config.ts` splits `react`/`react-router-dom` and utility libraries into cacheable vendor bundles.
3. **Memoisation & Debouncing:** Search queries are debounced (`useDebounce`), match calculations are memoised (`useMemo`), and list cards use `React.memo`.

