/**
 * Central application configuration & domain specification constants for GRANTLY.
 */
export const APP_CONFIG = {
  appName: 'Grantly',
  problemStatement: 'GRANTLY — Unified Scholarship Discovery & Management Platform',
  tagline: 'Rethinking the Scholarship Experience',
  objective: 'Transform a complex scholarship experience into a seamless digital journey.',
  limits: {
    maxCompareItems: 3,
    maxAwardSliderINR: 200000,
    maxSearchLength: 120,
    maxNoteLength: 500,
    urgentWindowDays: 14,
  },
  storageKeys: {
    profile: 'grantly-profile',
    applications: 'grantly-applications',
    compare: 'grantly-compare',
    theme: 'grantly-theme',
  },
} as const;
