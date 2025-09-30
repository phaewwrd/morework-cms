// Database types matching Prisma schema
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string;
}

export interface Company {
  id: number;
  title: string;
  address: string;
  city: string;
  country: string;
  email: string;
  contactName: string;
  contactPhone: string;
  taxpayerID: string;
  zipCode: string;
  userId: string;
  user?: User;
  positions?: Position[];
}

export interface Position {
  id: number;
  title: string;
  jobDescription: string;
  status: PositionStatus;
  companyId: number;
  company?: Company;
  applicantPositions?: ApplicantPosition[];
}

export interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  gender: Gender;
  age: number;
  birthDate: Date;
  phone: string;
  email: string;
  startWorkingDate: Date;
  prefferedLocation: string;
  positions?: ApplicantPosition[];
  documents?: ApplicantDocument[];
  educations?: ApplicantEducation[];
  trainings?: ApplicantTraining[];
  workExperiences?: ApplicantWorkExperience[];
  addresses?: ApplicantAddress[];
}

export interface ApplicantPosition {
  id: number;
  applicantId: number;
  positionId: number;
  status: ApplicationStatus;
  appliedAt: Date;
  applicant?: Applicant;
  position?: Position;
}

export interface ApplicantDocument {
  id: number;
  applicantId: number;
  documentType: DocumentType;
  description: string;
  filePath: string;
}

export interface ApplicantEducation {
  id: number;
  applicantId: number;
  educationlevelId: number;
  institution: string;
  field: string;
  graduationYear: number;
  gpa: number;
  educationLevel?: EducationLevel;
}

export interface ApplicantTraining {
  id: number;
  applicantId: number;
  title: string;
  description: string;
  trainingYear: number;
}

export interface ApplicantWorkExperience {
  id: number;
  applicantId: number;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date | null;
  description: string;
  currentPosition: boolean;
}

export interface ApplicantAddress {
  id: number;
  address: string;
  applicantId: number;
  districtId: number;
  district?: District;
}

export interface EducationLevel {
  id: number;
  title: string;
  code: string;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface District {
  id: number;
  title: string;
  provinceId: number;
  createdAt: Date;
  updatedAt: Date;
  province?: Province;
}

export interface Province {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  districts?: District[];
}

// Enums
export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum PositionStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  CLOSED = "CLOSED",
}

export enum DocumentType {
  RESUME = "RESUME",
  COVER_LETTER = "COVER_LETTER",
  TRANSCRIPT = "TRANSCRIPT",
  PORTFOLIO = "PORTFOLIO",
  CERTIFICATE = "CERTIFICATE",
  OTHER = "OTHER",
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

// Dashboard Statistics Types
export interface ApplicantStats {
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
}

export interface CompanyStats {
  totalCompanies: number;
  totalPositions: number;
  acceptedPositions: number;
  pendingPositions: number;
  rejectedPositions: number;
}

export interface CompanyJobStats {
  totalApplicants: number;
  acceptedApplicants: number;
  pendingApplicants: number;
  rejectedApplicants: number;
}

// Form Types
export interface ApplicantFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;
  age: number;
  birthDate: string;
  startWorkingDate: string;
  prefferedLocation: string;
}

export interface PositionFormData {
  title: string;
  jobDescription: string;
  companyId: number;
}

export interface CompanyFormData {
  title: string;
  address: string;
  city: string;
  country: string;
  email: string;
  contactName: string;
  contactPhone: string;
  taxpayerID: string;
  zipCode: string;
}
