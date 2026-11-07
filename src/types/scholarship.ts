/**
 * Core domain model for Grantly — the scholarship discovery & management platform.
 */

export type EducationLevel = 'class-12' | 'undergraduate' | 'postgraduate' | 'phd';

export type FieldOfStudy =
  | 'engineering'
  | 'medicine'
  | 'science'
  | 'commerce'
  | 'arts'
  | 'law'
  | 'design'
  | 'agriculture';

export type ScholarshipType = 'merit' | 'need-based' | 'women-in-stem' | 'minority' | 'sports' | 'research';

export type SocialCategory = 'general' | 'obc' | 'sc' | 'st' | 'ews';

export type Gender = 'female' | 'male' | 'non-binary' | 'prefer-not-to-say';

export type DocumentType =
  | 'marksheet'
  | 'income-certificate'
  | 'id-proof'
  | 'category-certificate'
  | 'recommendation-letter'
  | 'statement-of-purpose'
  | 'resume'
  | 'admission-letter'
  | 'bank-details'
  | 'photograph'
  | 'sports-certificate'
  | 'research-proposal';

/** Eligibility rules for a scholarship. An omitted rule means "no restriction". */
export interface EligibilityCriteria {
  levels: EducationLevel[];
  /** Minimum percentage / CGPA converted to a 0–100 scale. */
  minPercentage?: number;
  /** Maximum annual family income in INR. */
  maxFamilyIncome?: number;
  fields?: FieldOfStudy[];
  /** Indian states/UTs. Omitted = open nationwide. */
  states?: string[];
  genders?: Gender[];
  categories?: SocialCategory[];
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  providerType: 'government' | 'private' | 'ngo' | 'university';
  /** Award value in INR (annual or one-time, see `frequency`). */
  amount: number;
  frequency: 'one-time' | 'annual';
  /** ISO date string (YYYY-MM-DD). */
  deadline: string;
  type: ScholarshipType;
  summary: string;
  description: string;
  benefits: string[];
  eligibility: EligibilityCriteria;
  requiredDocuments: DocumentType[];
  applicationSteps: string[];
  officialUrl: string;
  tags: string[];
  /** Approximate number of awards available each cycle. */
  seats: number;
}

export interface StudentProfile {
  name: string;
  educationLevel: EducationLevel | null;
  fieldOfStudy: FieldOfStudy | null;
  percentage: number | null;
  familyIncome: number | null;
  state: string | null;
  gender: Gender | null;
  category: SocialCategory | null;
  /** Documents the student already has ready to upload. */
  documents: DocumentType[];
}

export type ApplicationStatus = 'saved' | 'preparing' | 'submitted' | 'interview' | 'awarded' | 'rejected';

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface Application {
  scholarshipId: string;
  status: ApplicationStatus;
  steps: ChecklistItem[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type SortOption = 'best-match' | 'deadline' | 'amount-high' | 'amount-low' | 'newest';

export interface ScholarshipFilters {
  query: string;
  levels: EducationLevel[];
  fields: FieldOfStudy[];
  types: ScholarshipType[];
  minAmount: number;
  deadlineWithinDays: number | null;
  eligibleOnly: boolean;
  sort: SortOption;
}

