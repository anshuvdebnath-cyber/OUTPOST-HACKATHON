# Accessibility & Responsive Design Statement

Grantly is engineered to meet **WCAG 2.1 AA** guidelines and deliver a seamless experience across mobile (`360px`), tablet (`768px`), and desktop (`1280px+`) viewports.

## Keyboard & Screen Reader Support

- **Skip Navigation:** `SkipLink` (`src/components/layout/SkipLink.tsx`) is the first focusable element on every page, jumping directly to `#main-content`.
- **Semantic Landmarks:** Pages use `<header>`, `<nav aria-label="...">`, `<main id="main-content">`, `<aside>`, `<section aria-labelledby="...">`, and `<footer>`.
- **Single Heading Hierarchy:** Each route renders exactly one `<h1>` via `PageHeader` and updates `document.title` via `useDocumentTitle`.
- **Accessible Live Regions:**
  - Filter result counts use `aria-live="polite"`.
  - Toast notifications (`Toaster`) announce updates via `role="status"` and `aria-live="polite"`.
- **Accessible Kanban Board:** Every card on the Application Tracker includes a labelled `<select>` status control alongside HTML5 drag-and-drop so keyboard and screen-reader users can move applications effortlessly.
- **Automated Linting:** `eslint-plugin-jsx-a11y` flat recommended rules are enforced in CI.

## Visual & Motion Accessibility

- **High Contrast Tokens:** Primary ink (`#0f172a` on `#ffffff`) achieves a **15.4:1** contrast ratio; muted ink (`#475569` on `#ffffff`) achieves **7.5:1**.
- **Focus Indicators:** High-visibility `:focus-visible` rings (`ring-2 ring-brand-500 ring-offset-2`).
- **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` disables non-essential animations and smooth scrolling.

