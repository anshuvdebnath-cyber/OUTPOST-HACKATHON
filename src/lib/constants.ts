import type {
  ApplicationStatus,
  DocumentType,
  EducationLevel,
  FieldOfStudy,
  Gender,
  ScholarshipType,
  SocialCategory,
} from '../types/scholarship';

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

/** Shader-harmonized status styles for glassmorphism UI. */
export const STATUS_META: Record<ApplicationStatus, { label: string; tone: string; dot: string }> = {
  saved: { label: 'Saved', tone: 'text-ink', dot: 'bg-accent/45' },
  preparing: { label: 'Preparing', tone: 'text-ink', dot: 'bg-accent/65' },
  submitted: { label: 'Submitted', tone: 'text-ink', dot: 'bg-accent/80' },
  interview: { label: 'Interview', tone: 'text-ink', dot: 'bg-accent/90' },
  awarded: { label: 'Awarded', tone: 'bg-accent text-accent-ink font-semibold', dot: 'bg-accent' },
  rejected: { label: 'Not selected', tone: 'text-ink-muted line-through', dot: 'bg-ink/25' },
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
