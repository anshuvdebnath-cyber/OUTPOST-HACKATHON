import { CheckCircle2, Circle, FileCheck2, RotateCcw, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  CATEGORY_LABELS,
  DOCUMENT_LABELS,
  EDUCATION_LEVEL_LABELS,
  FIELD_LABELS,
  GENDER_LABELS,
  INDIAN_STATES,
} from '../lib/constants';
import { profileCompleteness, useProfileStore } from '../store/useProfileStore';
import { toast } from '../store/useToastStore';
import type {
  DocumentType,
  EducationLevel,
  FieldOfStudy,
  Gender,
  SocialCategory,
  StudentProfile,
} from '../types/scholarship';
import { sanitizeNumericInput, sanitizeTextInput } from '../utils/security';

/** Sample personas so evaluators and students can test matching with one click. */
const PERSONA_PRESETS: { label: string; tagline: string; profile: StudentProfile }[] = [
  {
    label: 'Ananya · B.Tech CS',
    tagline: 'Female, 88%, ₹4.5L income, Maharashtra',
    profile: {
      name: 'Ananya Sharma',
      educationLevel: 'undergraduate',
      fieldOfStudy: 'engineering',
      percentage: 88,
      familyIncome: 450000,
      state: 'Maharashtra',
      gender: 'female',
      category: 'general',
      documents: ['marksheet', 'income-certificate', 'id-proof', 'admission-letter', 'resume'],
    },
  },
  {
    label: 'Rohan · Class 12 Science',
    tagline: 'Male, 78%, ₹1.8L income, OBC, Kerala',
    profile: {
      name: 'Rohan Nair',
      educationLevel: 'class-12',
      fieldOfStudy: 'science',
      percentage: 78,
      familyIncome: 180000,
      state: 'Kerala',
      gender: 'male',
      category: 'obc',
      documents: ['marksheet', 'income-certificate', 'category-certificate', 'id-proof', 'photograph'],
    },
  },
  {
    label: 'Meera · PhD Biosciences',
    tagline: 'Female, 82%, SC, Tamil Nadu',
    profile: {
      name: 'Meera Krishnan',
      educationLevel: 'phd',
      fieldOfStudy: 'science',
      percentage: 82,
      familyIncome: 320000,
      state: 'Tamil Nadu',
      gender: 'female',
      category: 'sc',
      documents: ['marksheet', 'id-proof', 'research-proposal', 'recommendation-letter', 'admission-letter', 'resume'],
    },
  },
];

/** Monochrome frosted-glass student profile & document vault. */
export default function ProfilePage() {
  useDocumentTitle('Your student profile');
  const { profile, updateProfile, toggleDocument, completeOnboarding, resetProfile } = useProfileStore();
  const completeness = profileCompleteness(profile);

  return (
    <>
      <PageHeader
        title="Student profile & document vault"
        description="Your profile stays in your browser and powers instant eligibility scores across every scholarship."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              resetProfile();
              toast('Profile cleared', 'info');
            }}
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" /> Reset profile
          </Button>
        }
      />

      {/* Quick-fill persona bar */}
      <section aria-labelledby="presets-heading" className="card mb-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="presets-heading" className="flex items-center gap-2 text-[16px] font-normal text-ink">
            <Wand2 aria-hidden="true" className="h-4 w-4 text-ink" />
            Try a sample student persona
          </h2>
          <span className="text-xs text-ink-muted">Instant one-click fill for testing match scores</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {PERSONA_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                updateProfile(p.profile);
                completeOnboarding();
                toast(`Loaded persona: ${p.label}`);
              }}
              className="glass-subtle rounded-2xl p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-card"
            >
              <p className="text-sm font-medium text-ink">{p.label}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{p.tagline}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_23rem]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            completeOnboarding();
            toast('Profile saved — match scores updated!');
          }}
          className="card space-y-5 p-6 sm:p-8"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-normal tracking-[-0.02em] text-ink">
              <Sparkles aria-hidden="true" className="h-5 w-5 text-ink" /> Academic & personal details
            </h2>
            <div className="w-36">
              <ProgressBar value={completeness} label="Profile completeness" showValue />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="prof-name" className="label">
                Full name
              </label>
              <input
                id="prof-name"
                type="text"
                value={profile.name}
                onChange={(e) => updateProfile({ name: sanitizeTextInput(e.target.value, 80) })}
                placeholder="e.g. Aarav Verma"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="prof-level" className="label">
                Current education level
              </label>
              <select
                id="prof-level"
                value={profile.educationLevel ?? ''}
                onChange={(e) =>
                  updateProfile({ educationLevel: (e.target.value || null) as EducationLevel | null })
                }
                className="input"
              >
                <option value="">Select level…</option>
                {(Object.keys(EDUCATION_LEVEL_LABELS) as EducationLevel[]).map((k) => (
                  <option key={k} value={k}>
                    {EDUCATION_LEVEL_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prof-field" className="label">
                Field of study
              </label>
              <select
                id="prof-field"
                value={profile.fieldOfStudy ?? ''}
                onChange={(e) => updateProfile({ fieldOfStudy: (e.target.value || null) as FieldOfStudy | null })}
                className="input"
              >
                <option value="">Select field…</option>
                {(Object.keys(FIELD_LABELS) as FieldOfStudy[]).map((k) => (
                  <option key={k} value={k}>
                    {FIELD_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prof-pct" className="label">
                Percentage / CGPA (0–100%)
              </label>
              <input
                id="prof-pct"
                type="number"
                min={0}
                max={100}
                value={profile.percentage ?? ''}
                onChange={(e) =>
                  updateProfile({ percentage: sanitizeNumericInput(e.target.value, 0, 100) })
                }
                placeholder="e.g. 84"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="prof-income" className="label">
                Annual family income (₹)
              </label>
              <input
                id="prof-income"
                type="number"
                min={0}
                step={10000}
                value={profile.familyIncome ?? ''}
                onChange={(e) =>
                  updateProfile({ familyIncome: sanitizeNumericInput(e.target.value, 0, 50000000) })
                }
                placeholder="e.g. 350000"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="prof-state" className="label">
                Home state / UT
              </label>
              <select
                id="prof-state"
                value={profile.state ?? ''}
                onChange={(e) => updateProfile({ state: e.target.value || null })}
                className="input"
              >
                <option value="">Select state…</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prof-gender" className="label">
                Gender
              </label>
              <select
                id="prof-gender"
                value={profile.gender ?? ''}
                onChange={(e) => updateProfile({ gender: (e.target.value || null) as Gender | null })}
                className="input"
              >
                <option value="">Select gender…</option>
                {(Object.keys(GENDER_LABELS) as Gender[]).map((k) => (
                  <option key={k} value={k}>
                    {GENDER_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prof-cat" className="label">
                Category
              </label>
              <select
                id="prof-cat"
                value={profile.category ?? ''}
                onChange={(e) => updateProfile({ category: (e.target.value || null) as SocialCategory | null })}
                className="input"
              >
                <option value="">Select category…</option>
                {(Object.keys(CATEGORY_LABELS) as SocialCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {CATEGORY_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg">
              Save profile
            </Button>
          </div>
        </form>

        {/* Document Vault */}
        <section aria-labelledby="vault-heading" className="card p-6 sm:p-7">
          <div className="flex items-center gap-2">
            <FileCheck2 aria-hidden="true" className="h-5 w-5 text-ink" />
            <h2 id="vault-heading" className="text-xl font-normal tracking-[-0.02em] text-ink">
              Document vault
            </h2>
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">
            Tick the documents you already have scanned. Every scholarship will show how ready you are to apply.
          </p>
          <ul className="mt-4 space-y-1.5">
            {(Object.keys(DOCUMENT_LABELS) as DocumentType[]).map((doc) => {
              const has = profile.documents.includes(doc);
              return (
                <li key={doc}>
                  <button
                    type="button"
                    aria-pressed={has}
                    onClick={() => toggleDocument(doc)}
                    className="glass-subtle flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs transition duration-300 hover:scale-[1.01]"
                  >
                    {has ? (
                      <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-ink" />
                    ) : (
                      <Circle aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-muted" />
                    )}
                    <span className={has ? 'font-medium text-ink' : 'text-ink-muted'}>{DOCUMENT_LABELS[doc]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
