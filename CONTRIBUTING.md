# Contributing to Grantly

Thank you for your interest in contributing to **Grantly — Unified Scholarship Discovery & Management Platform**!

## Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/anshuvdebnath-cyber/OUTPOST-HACKATHON.git
   cd OUTPOST-HACKATHON
   npm install
   ```
2. **Create a Feature Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Run Quality Checks Before Committing**
   ```bash
   npm run typecheck
   npm run lint
   npm test -- --run
   npm run build
   ```

## Coding Standards

- **Strict TypeScript:** Avoid `any`; use explicit domain types in `src/types/scholarship.ts`.
- **Accessibility (WCAG 2.1 AA):** All interactive elements must include accessible labels, keyboard navigation, and visible focus rings (`:focus-visible`).
- **Pure Domain Logic:** Keep eligibility scoring (`src/features/eligibility/matchEngine.ts`), filtering (`src/features/scholarships/filterScholarships.ts`), and calendar generation (`src/features/deadlines/generateIcs.ts`) pure and covered by unit tests.
