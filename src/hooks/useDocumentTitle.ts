import { useEffect } from 'react';

/** Sets a descriptive document title per page — important for screen-reader users and SEO. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · Grantly Scholarships` : 'Grantly — Scholarship Discovery & Management Platform';
  }, [title]);
}

