/** First focusable element: lets keyboard users jump straight to the main content (WCAG 2.4.1). */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only z-[100] rounded-xl bg-brand-600 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Skip to main content
    </a>
  );
}

