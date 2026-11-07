import type {
  ApplicationStatus,
  DocumentType,
  EducationLevel,
  FieldOfStudy,
  Gender,
  ScholarshipType,
  SocialCategory,
} from '@/types/scholarship';

/** Human-readable labels for domain enums, used across the UI. */

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  'class-12': 'Class 12 / Pre-university',
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate',
  phd: 'PhD / Doctoral',
};

export const FIELD_LABELS: Record<FieldOfStudy, string> = {
  engineering: 'Engineering & Tech',
  medicine: 'Medicine & Health',
  science: 'Pure Sciences',
  commerce: 'Commerce & Business',
  arts: 'Arts & Humanities',
  law: 'Law',
  design: 'Design & Architecture',
  agriculture: 'Agriculture',
};

export const SCHOLARSHIP_TYPE_LABELS: Record<ScholarshipType, string> = {
  merit: 'Merit-based',
  'need-based': 'Need-based',
  'women-in-stem': 'Women in STEM',
  minority: 'Minority & Inclusion',
  sports: 'Sports',
  research: 'Research',
};

export const CATEGORY_LABELS: Record<SocialCategory, string> = {
  general: 'General',
  obc: 'OBC',
  sc: 'SC',
  st: 'ST',
  ews: 'EWS',
};

export const GENDER_LABELS: Record<Gender, string> = {
  female: 'Female',
  male: 'Male',
  'non-binary': 'Non-binary',
  'prefer-not-to-say': 'Prefer not to say',
};

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  marksheet: 'Latest marksheet / transcript',
  'income-certificate': 'Family income certificate',
  'id-proof': 'Aadhaar / ID proof',
  'category-certificate': 'Category / caste certificate',
  'recommendation-letter': 'Recommendation letter',
  'statement-of-purpose': 'Statement of purpose / essay',
  resume: 'Resume / CV',
  'admission-letter': 'Admission / bonafide letter',
  'bank-details': 'Bank account details',
  photograph: 'Passport-size photograph',
  'sports-certificate': 'Sports achievement certificate',
  'research-proposal': 'Research proposal',
};

export const STATUS_META: Record<ApplicationStatus, { label: string; tone: string; dot: string }> = {
  saved: { label: 'Saved', tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200', dot: 'bg-slate-400' },
  preparing: { label: 'Preparing', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200', dot: 'bg-amber-500' },
  submitted: { label: 'Submitted', tone: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200', dot: 'bg-sky-500' },
  interview: { label: 'Interview', tone: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200', dot: 'bg-violet-500' },
  awarded: { label: 'Awarded', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200', dot: 'bg-emerald-500' },
  rejected: { label: 'Not selected', tone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200', dot: 'bg-rose-500' },
};

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'saved',
  'preparing',
  'submitted',
  'interview',
  'awarded',
  'rejected',
];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
] as const;

