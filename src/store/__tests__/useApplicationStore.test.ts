import { beforeEach, describe, expect, it } from 'vitest';
import { applicationProgress, useApplicationStore } from '@/store/useApplicationStore';
import { SCHOLARSHIPS } from '@/data/scholarships';

describe('useApplicationStore', () => {
  const s = SCHOLARSHIPS[0];

  beforeEach(() => {
    useApplicationStore.getState().clearAll();
  });

  it('saves a scholarship, auto-advances to preparing on step completion, and moves status', () => {
    const store = useApplicationStore.getState();
    store.saveScholarship(s);

    const saved = useApplicationStore.getState().applications[s.id];
    expect(saved).toBeDefined();
    expect(saved.status).toBe('saved');
    expect(applicationProgress(saved)).toBe(0);

    // Completing the first step auto-advances status from "saved" to "preparing"
    store.toggleStep(s.id, saved.steps[0].id);
    const updated = useApplicationStore.getState().applications[s.id];
    expect(updated.status).toBe('preparing');
    expect(applicationProgress(updated)).toBeGreaterThan(0);

    store.moveApplication(s.id, 'submitted');
    expect(useApplicationStore.getState().applications[s.id].status).toBe('submitted');
  });
});

