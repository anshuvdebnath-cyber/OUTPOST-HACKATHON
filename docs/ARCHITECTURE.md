# Grantly Architecture Guide

## Overview

Grantly is engineered using a **feature-sliced, domain-driven frontend architecture**. Pure domain algorithms (`computeMatch`, `filterScholarships`, `computeDocumentReadiness`, `generateIcs`, `computePortfolioAnalytics`, `serializeApplicationsToCsv`) are decoupled from React view components and persisted Zustand stores so every business rule is deterministic, fast, and 100% unit-testable.

## Layered Architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Presentation Layer (src/pages/, src/components/, src/features/*/ui)  │
│  - Route-level React.lazy + Suspense + ErrorBoundary                 │
│  - Adaptive Refractive Glassmorphism UI & WebGL ShaderBackground     │
├──────────────────────────────────────────────────────────────────────┤
│ Hooks & State Layer (src/hooks/, src/store/)                         │
│  - Zustand persisted stores (profile, applications, compare, theme)  │
│  - useMatch, useDebounce, useDeferredValue, useViewportBreakpoints   │
├──────────────────────────────────────────────────────────────────────┤
│ Domain & Service Layer (src/features/*, src/services/, src/lib/)     │
│  - matchEngine, filterScholarships, documentReadiness, generateIcs   │
│  - scholarshipService (analytics & CSV export), performance monitor  │
├──────────────────────────────────────────────────────────────────────┤
│ Data & Types Layer (src/data/scholarships.ts, src/types/)            │
│  - 24 typed scholarships with dynamic deadlines & strict TS models   │
└──────────────────────────────────────────────────────────────────────┘
```

## Module Responsibilities

- **`src/types/scholarship.ts`** — Canonical TypeScript interfaces for scholarships, eligibility criteria, student profiles, applications, checklist steps, and filter state.
- **`src/features/eligibility/`** — Contains the pure 7-criterion `computeMatch` engine and presentational components (`MatchBadge`, `MatchReasons`).
- **`src/features/scholarships/`** — Contains `filterScholarships`, `ScholarshipCard` (`React.memo`), and `FilterPanel` (custom glass checkbox & continuous award slider).
- **`src/features/documents/`** — Computes and renders document readiness by comparing `scholarship.requiredDocuments` against `profile.documents`.
- **`src/features/applications/`** — 3-column Bento Grid Kanban board (`KanbanBoard`) and full-width `SingleStagePanel` supporting HTML5 drag-and-drop and accessible custom listbox menus.
- **`src/features/deadlines/`** — Urgency classification (`critical`, `soon`, `upcoming`, `later`) and RFC 5545 `.ics` calendar generation.
- **`src/services/scholarshipService.ts`** — Portfolio analytics aggregator and RFC 4180 `.csv` application exporter.
- **`src/store/`** — Modular Zustand stores persisted to `localStorage` (`grantly-profile`, `grantly-applications`, `grantly-compare`, `grantly-theme`).

## Performance & Resilience Strategy

1. **Route-Level Code Splitting + Idle Prefetching:** Every route in `src/app/router.tsx` is loaded via `React.lazy` with an accessible `PageSkeleton` fallback, and prefetched during browser idle time (`scheduleIdleTask`) for zero-latency tab transitions.
2. **Manual Vendor Chunks:** `vite.config.ts` splits `react`/`react-router-dom` and utility libraries into cacheable vendor bundles.
3. **Concurrent Rendering & Memoisation:** Search queries use `useDebounce` + `useDeferredValue`, derived lists use `useMemo`, handlers use `useCallback`, and list cards use `React.memo`.
4. **Error Boundaries:** Global `ErrorBoundary` and React Router `RouteErrorFallback` prevent unexpected runtime exceptions from crashing the workspace.
