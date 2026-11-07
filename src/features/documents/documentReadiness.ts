import type { DocumentType, Scholarship } from '@/types/scholarship';

export interface DocumentReadiness {
  /** 0–100 percentage of required documents the student already has. */
  percent: number;
  ready: DocumentType[];
  missing: DocumentType[];
}

/**
 * Document Readiness Meter — how prepared is the student to apply right now?
 * Compares the scholarship's required documents with the student's document vault.
 */
export function computeDocumentReadiness(scholarship: Scholarship, owned: DocumentType[]): DocumentReadiness {
  const ownedSet = new Set(owned);
  const ready = scholarship.requiredDocuments.filter((d) => ownedSet.has(d));
  const missing = scholarship.requiredDocuments.filter((d) => !ownedSet.has(d));
  const total = scholarship.requiredDocuments.length;
  const percent = total === 0 ? 100 : Math.round((ready.length / total) * 100);
  return { percent, ready, missing };
}

