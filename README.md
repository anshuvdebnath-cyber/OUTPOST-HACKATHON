# GRANTLY — Unified Scholarship Discovery & Management Platform

> **Rethinking the Scholarship Experience:** Transform a complex maze of portals, PDFs, and spreadsheets into one seamless, accessible digital journey — **Discover → Match → Understand → Apply → Track → Win**.

---

## Problem Statement Alignment

Accessing educational financial assistance is often a fragmented, stressful journey for students:

| Student Challenge | How Grantly Solves It |
|---|---|
| **Finding relevant opportunities** | **Discover Page (`/discover`)** — Full-text debounced search, multi-facet filters (education level, field of study, scholarship type, minimum award, deadline window, *"Only show scholarships I qualify for"*), and smart sorting. |
| **Understanding available options** | **Explainable Eligibility Match Engine** — Every scholarship receives a **0–100% match score** with a criterion-by-criterion explanation (marks, family income, level, field, state, gender, category). Plus **Side-by-Side Comparison (`/compare`)** for up to 3 scholarships. |
| **Navigating application processes** | **Interactive Application Workspace (`/scholarships/:id`)** — Step-by-step application checklist with auto-advancing status and a **Document Readiness Meter** synced with the student's Document Vault. |
| **Keeping track of important information** | **Kanban Application Tracker (`/tracker`)** with drag-and-drop & keyboard status controls (`Saved → Preparing → Submitted → Interview → Awarded`), **Urgency Deadline Timeline (`/deadlines`)**, **`.ics` Calendar Export**, and **Dashboard (`/dashboard`)** with a live Funding Potential calculator. |

---

## Key Features & Innovations

1. **Explainable Eligibility Match Score (`src/features/eligibility/matchEngine.ts`)**
   - Evaluates 7 weighted criteria (`level`, `percentage`, `income`, `field`, `state`, `gender`, `category`).
   - Returns a `0–100` score, a verdict (`eligible`, `likely`, `ineligible`), and human-readable explanations for every check.
2. **Document Readiness Vault (`src/features/documents/`)**
   - Students tick off the documents they already have scanned once in their Profile (`/profile`).
   - Every scholarship immediately calculates readiness (`0–100%`) and highlights missing documents.
3. **Kanban Application Pipeline (`src/features/applications/KanbanBoard.tsx`)**
   - Supports both mouse drag-and-drop and keyboard-accessible `<select>` status controls.
   - Ticking the first checklist step automatically advances an application from **Saved** to **Preparing**.
4. **Deadline Urgency Radar & iCalendar (`.ics`) Export (`src/features/deadlines/`)**
   - Colour-coded urgency badges (`≤3 days` critical, `≤10 days` soon, `≤30 days` upcoming).
   - One-click RFC 5545 `.ics` file download with 7-day and 1-day `VALARM` reminders.
5. **One-Click Student Personas (`/profile`)**
   - Built-in sample student personas allow instant testing of eligibility scoring and filtering.

---

## Tech Stack

- **Framework:** React 18 + TypeScript 5.6 (`strict: true`)
- **Build Tool:** Vite 5 (route-level code splitting via `React.lazy` + manual vendor chunks)
- **WebGL & Styling:** Custom GLSL Optical Fluted-Glass Fragment Shader (`ShaderBackground.tsx`) + Tailwind CSS 3.4 + `0.75` Glossiness Frosted Glassmorphism design tokens (Light & Night modes)
- **Routing & Motion:** React Router v6 with directional horizontal slide tab transitions & gliding navbar active indicator
- **State & Persistence:** Zustand 5 with `persist` middleware (`localStorage`)
- **Icons & Dates:** `lucide-react`, `date-fns`
- **Quality & Testing:** ESLint 9 (`eslint-plugin-jsx-a11y`), Prettier, Vitest, React Testing Library

---

## Getting Started

### Prerequisites
- Node.js `>= 18` and `npm`

### Installation & Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### Quality & Verification Scripts

```bash
npm run lint        # Run ESLint + jsx-a11y accessibility rules
npm run typecheck   # Run TypeScript strict compiler check
npm run test        # Run Vitest unit test suite
npm run build       # Type-check and create production bundle in dist/
npm run preview     # Preview production build locally
```

---

## Project Architecture

```text
src/
├── app/
│   └── router.tsx                  # Lazy-loaded routes with Suspense + PageSkeleton
├── components/
│   ├── layout/                     # AppShell, Logo, SkipLink, ThemeToggle, navItems
│   └── ui/                         # Button, EmptyState, PageHeader, ProgressBar, Skeleton, Toaster
├── data/
│   └── scholarships.ts             # 24 original sample scholarships with dynamic ISO deadlines
├── features/
│   ├── applications/               # KanbanBoard + drag-and-drop & keyboard status updates
│   ├── deadlines/                  # CountdownBadge, generateIcs (.ics calendar generator)
│   ├── documents/                  # DocumentReadinessMeter, documentReadiness pure scorer
│   ├── eligibility/                # matchEngine, MatchBadge, MatchReasons
│   └── scholarships/               # ScholarshipCard, FilterPanel, filterScholarships engine
├── hooks/                          # useDebounce, useDocumentTitle, useMatch
├── lib/                            # cn, constants, currency (INR), date utilities
├── pages/                          # Landing, Dashboard, Discover, Detail, Tracker, Deadlines, Compare, Profile, NotFound
├── store/                          # Persisted Zustand stores (profile, applications, compare, filters, theme, toast)
├── styles/                         # Tailwind layers, CSS tokens, focus-visible & reduced-motion rules
└── types/                          # Domain TypeScript interfaces (Scholarship, StudentProfile, Application)
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) and [`docs/ACCESSIBILITY.md`](./docs/ACCESSIBILITY.md) for deeper technical details.

---

## License

Released under the [MIT License](./LICENSE).

