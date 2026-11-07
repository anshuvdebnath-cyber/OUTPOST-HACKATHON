# Accessibility & Responsive Design Statement

Grantly is engineered to meet **WCAG 2.1 AA** guidelines and deliver a fluid, responsive experience across mobile (`320px–639px`), tablet (`640px–1023px`), desktop (`1024px–1279px`), and widescreen (`1280px+`) viewports.

## Keyboard & Screen Reader Support

- **Skip Navigation:** `SkipLink` (`src/components/layout/SkipLink.tsx`) is the first focusable element on every page, jumping directly to `#main-content`.
- **Semantic HTML5 Landmarks:** Pages use `<header role="banner">`, `<nav aria-label="...">`, `<main id="main-content" role="main">`, `<aside aria-label="...">`, `<section aria-labelledby="...">`, and `<footer role="contentinfo">`.
- **Single Heading Hierarchy:** Each route renders a single `<h1>` via `PageHeader` and updates `document.title` dynamically via `useDocumentTitle`.
- **Accessible Live Regions & ARIA Controls:**
  - Filter result counts announce updates via `role="status"`, `aria-live="polite"`, and `aria-atomic="true"`.
  - Toast notifications (`Toaster`) announce actions via `role="status"` and `aria-live="polite"`.
  - Custom dropdowns (`SortDropdown` and `ApplicationCard` status menu) implement `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `role="listbox"`, `role="option"`, `aria-selected`, Escape key dismissal, and click-outside handling.
  - Stage filter tabs in `KanbanBoard` implement `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and `role="tabpanel"`.
- **Automated Linting:** `eslint-plugin-jsx-a11y` recommended rules are enforced with zero warnings.

## Multi-Breakpoint Responsive Engineering

- **Adaptive Navigation:** Desktop viewports (`lg+`) render the full-width floating pill navbar with a gliding active indicator; mobile/tablet viewports (`< lg`) render a fixed bottom frosted-glass dock with safe-area inset padding (`pb-safe`).
- **Responsive Filter Drawer & Comparison Views:**
  - On `< lg` screens, `DiscoverPage` provides a modal slide-up filter drawer (`role="dialog"`, `aria-modal="true"`).
  - On mobile viewports (`useViewportBreakpoints`), `ComparePage` renders stacked comparison cards alongside the scrollable comparison table.
  - `KanbanBoard` adapts from 1 column on mobile (`grid-cols-1`) to 2 columns on tablet (`md:grid-cols-2`) and a 3-column Bento Grid on desktop (`lg:grid-cols-3`) without horizontal scrollbars.

## Visual, Contrast & Motion Accessibility

- **High Contrast Tokens:** Primary ink (`rgb(9 18 36)`) and muted ink (`rgb(28 45 70)`) on frosted light surfaces and luminous mint-white (`rgb(248 250 252)`) on dark emerald surfaces exceed WCAG AA contrast requirements, with additional `@media (prefers-contrast: more)` overrides.
- **Coarse Pointer Touch Targets:** `@media (pointer: coarse)` enforces ergonomic touch target heights.
- **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` disables CSS transitions/animations and pauses the WebGL animation loop after rendering a static frame.
