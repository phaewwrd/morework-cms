import { z } from 'zod'

// Enums
export const GenderEnum = z.enum(['MALE', 'FEMALE', 'OTHER'])
export const ApplicationStatusEnum = z.enum(['PENDING', 'ACCEPTED', 'REJECTED'])
export const PositionStatusEnum = z.enum(['ACTIVE', 'PENDING', 'CLOSED'])
export const DocumentTypeEnum = z.enum(['RESUME', 'COVER_LETTER', 'TRANSCRIPT', 'PORTFOLIO', 'CERTIFICATE', 'OTHER'])

// User validation schemas
export const userRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().default('company'),
})

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const userUpdateSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

// Applicant validation schemas
export const applicantCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(191, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(191, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  gender: GenderEnum,
  age: z.number().min(16, 'Must be at least 16 years old').max(100, 'Invalid age'),
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  startWorkingDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date'),
  prefferedLocation: z.string().min(1, 'Preferred location is required'),
})

export const applicantUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(191, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(191, 'Last name too long').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  gender: GenderEnum.optional(),
  age: z.number().min(16, 'Must be at least 16 years old').max(100, 'Invalid age').optional(),
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
  startWorkingDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date').optional(),
  prefferedLocation: z.string().optional(),
})

// Company validation schemas
export const companyCreateSchema = z.object({
  title: z.string().min(1, 'Company name is required').max(191, 'Company name too long'),
  address: z.string().min(1, 'Address is required').max(191, 'Address too long'),
  city: z.string().min(1, 'City is required').max(191, 'City too long'),
  country: z.string().min(1, 'Country is required').max(191, 'Country too long'),
  email: z.string().email('Invalid email address'),
  contactName: z.string().min(1, 'Contact name is required').max(191, 'Contact name too long'),
  contactPhone: z.string().min(1, 'Contact phone is required').max(191, 'Contact phone too long'),
  taxpayerID: z.string().min(1, 'Taxpayer ID is required').max(191, 'Taxpayer ID too long'),
  zipCode: z.string().min(1, 'Zip code is required').max(20, 'Zip code too long'),
  userId: z.string(),
})

export const companyUpdateSchema = companyCreateSchema.partial()

// Position validation schemas
export const positionCreateSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(191, 'Job title too long'),
  jobDescription: z.string().min(1, 'Job description is required'),
  companyId: z.number().int().positive('Invalid company ID'),
})

export const positionUpdateSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(191, 'Job title too long').optional(),
  jobDescription: z.string().min(1, 'Job description is required').optional(),
  status: PositionStatusEnum.optional(),
})

// Application validation schemas
export const applicationCreateSchema = z.object({
  applicantId: z.number().int().positive('Invalid applicant ID'),
  positionId: z.number().int().positive('Invalid position ID'),
})

export const applicationUpdateSchema = z.object({
  status: ApplicationStatusEnum,
})

// Filter and search schemas
export const applicantFilterSchema = z.object({
  gender: GenderEnum.optional(),
  status: ApplicationStatusEnum.optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

export const positionFilterSchema = z.object({
  status: PositionStatusEnum.optional(),
  companyId: z.number().int().positive().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

// API Response wrapper
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
})

// Inferred types
export type UserRegister = z.infer<typeof userRegisterSchema>
export type UserLogin = z.infer<typeof userLoginSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>

export type ApplicantCreate = z.infer<typeof applicantCreateSchema>
export type ApplicantUpdate = z.infer<typeof applicantUpdateSchema>

export type CompanyCreate = z.infer<typeof companyCreateSchema>
export type CompanyUpdate = z.infer<typeof companyUpdateSchema>

export type PositionCreate = z.infer<typeof positionCreateSchema>
export type PositionUpdate = z.infer<typeof positionUpdateSchema>

export type ApplicationCreate = z.infer<typeof applicationCreateSchema>
export type ApplicationUpdate = z.infer<typeof applicationUpdateSchema>

export type ApplicantFilter = z.infer<typeof applicantFilterSchema>
export type PositionFilter = z.infer<typeof positionFilterSchema>

export type ApiResponse<T = any> = {
  success: boolean
  message: string
  data?: T
  error?: string
}
