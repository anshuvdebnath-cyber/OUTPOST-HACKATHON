import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DocumentType, StudentProfile } from '../types/scholarship';

export const EMPTY_PROFILE: StudentProfile = {
  name: '',
  educationLevel: null,
  fieldOfStudy: null,
  percentage: null,
  familyIncome: null,
  state: null,
  gender: null,
  category: null,
  documents: [],
};

interface ProfileState {
  profile: StudentProfile;
  onboarded: boolean;
  updateProfile: (patch: Partial<StudentProfile>) => void;
  toggleDocument: (doc: DocumentType) => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
}

/** Student profile used by the eligibility match engine. Persisted to localStorage. */
export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: EMPTY_PROFILE,
      onboarded: false,
      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      toggleDocument: (doc) =>
        set((s) => {
          const has = s.profile.documents.includes(doc);
          return {
            profile: {
              ...s.profile,
              documents: has ? s.profile.documents.filter((d) => d !== doc) : [...s.profile.documents, doc],
            },
          };
        }),
      completeOnboarding: () => set({ onboarded: true }),
      resetProfile: () => set({ profile: EMPTY_PROFILE, onboarded: false }),
    }),
    { name: 'grantly-profile', version: 1 },
  ),
);

/** Percentage of profile fields completed — drives the "complete your profile" prompt. */
export function profileCompleteness(p: StudentProfile): number {
  const fields = [p.name, p.educationLevel, p.fieldOfStudy, p.percentage, p.familyIncome, p.state, p.gender, p.category];
  const filled = fields.filter((v) => v !== null && v !== '').length;
  return Math.round((filled / fields.length) * 100);
}

