import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Application, ApplicationStatus, Scholarship } from '@/types/scholarship';

interface ApplicationState {
  /** Applications keyed by scholarship id. */
  applications: Record<string, Application>;
  /** Save a scholarship to the tracker (creates an application in "saved" status). */
  saveScholarship: (scholarship: Scholarship) => void;
  removeApplication: (scholarshipId: string) => void;
  moveApplication: (scholarshipId: string, status: ApplicationStatus) => void;
  toggleStep: (scholarshipId: string, stepId: string) => void;
  updateNotes: (scholarshipId: string, notes: string) => void;
  clearAll: () => void;
}

const now = () => new Date().toISOString();

/** Builds a fresh application with a checklist derived from the scholarship's steps. */
export function createApplication(scholarship: Scholarship): Application {
  const timestamp = now();
  return {
    scholarshipId: scholarship.id,
    status: 'saved',
    steps: scholarship.applicationSteps.map((label, i) => ({ id: `${scholarship.id}-step-${i}`, label, done: false })),
    notes: '',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Application tracker state. Persisted to localStorage. */
export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      applications: {},

      saveScholarship: (scholarship) =>
        set((s) =>
          s.applications[scholarship.id]
            ? s
            : { applications: { ...s.applications, [scholarship.id]: createApplication(scholarship) } },
        ),

      removeApplication: (id) =>
        set((s) => {
          const next = { ...s.applications };
          delete next[id];
          return { applications: next };
        }),

      moveApplication: (id, status) =>
        set((s) => {
          const app = s.applications[id];
          if (!app || app.status === status) return s;
          return { applications: { ...s.applications, [id]: { ...app, status, updatedAt: now() } } };
        }),

      toggleStep: (id, stepId) =>
        set((s) => {
          const app = s.applications[id];
          if (!app) return s;
          const steps = app.steps.map((st) => (st.id === stepId ? { ...st, done: !st.done } : st));
          // Auto-advance: ticking the first step moves a "saved" application to "preparing".
          const status = app.status === 'saved' && steps.some((st) => st.done) ? 'preparing' : app.status;
          return { applications: { ...s.applications, [id]: { ...app, steps, status, updatedAt: now() } } };
        }),

      updateNotes: (id, notes) =>
        set((s) => {
          const app = s.applications[id];
          if (!app) return s;
          return { applications: { ...s.applications, [id]: { ...app, notes, updatedAt: now() } } };
        }),

      clearAll: () => set({ applications: {} }),
    }),
    { name: 'grantly-applications', version: 1 },
  ),
);

/** Percentage of checklist steps completed for an application. */
export function applicationProgress(app: Application): number {
  if (app.steps.length === 0) return 0;
  return Math.round((app.steps.filter((s) => s.done).length / app.steps.length) * 100);
}

