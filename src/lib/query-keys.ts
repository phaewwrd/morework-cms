// Query key factory for consistent key management across the app
export const queryKeys = {
  // Auth queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  
  // Company queries
  companies: {
    all: ['companies'] as const,
    lists: () => [...queryKeys.companies.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.companies.lists(), { filters }] as const,
    details: () => [...queryKeys.companies.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.companies.details(), id] as const,
    stats: () => [...queryKeys.companies.all, 'stats'] as const,
    userCompany: (userId: number) => [...queryKeys.companies.all, 'userCompany', userId] as const,
  },

  // Position/Job queries
  positions: {
    all: ['positions'] as const,
    lists: () => [...queryKeys.positions.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.positions.lists(), { filters }] as const,
    details: () => [...queryKeys.positions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.positions.details(), id] as const,
    byCompany: (companyId: number) => [...queryKeys.positions.all, 'byCompany', companyId] as const,
  },

  // Applicant queries
  applicants: {
    all: ['applicants'] as const,
    lists: () => [...queryKeys.applicants.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.applicants.lists(), { filters }] as const,
    details: () => [...queryKeys.applicants.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.applicants.details(), id] as const,
    byCompany: (companyId: number) => [...queryKeys.applicants.all, 'byCompany', companyId] as const,
  },

  // Application queries
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.applications.lists(), { filters }] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.applications.details(), id] as const,
    byPosition: (positionId: number) => [...queryKeys.applications.all, 'byPosition', positionId] as const,
    byApplicant: (applicantId: number) => [...queryKeys.applications.all, 'byApplicant', applicantId] as const,
  },

  // User queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
} as const

// Type helper for query keys
export type QueryKeys = typeof queryKeys
