# Contributing to Grantly

Thank you for helping make educational financial aid simpler and more accessible for students!

## Development Workflow

1. Fork and clone the repository.
2. Install dependencies with `npm install`.
3. Start the dev server with `npm run dev`.
4. Before opening a pull request, ensure all checks pass:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Coding Standards

- **Strict TypeScript:** Avoid `any`. Define shared domain types in `src/types/scholarship.ts`.
- **Accessibility First:** Every interactive control must be keyboard-operable and have an accessible name (`<label>`, `aria-label`, or visible text).
- **Pure Domain Logic:** Keep scoring, filtering, and date calculations in pure functions with unit tests in `__tests__/`.

