import { type ApiResponse } from '@/lib/validations'

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API client configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// Generic API client with authentication
class ApiClient {
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}/api${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        throw new ApiError(
          `Invalid response format: ${contentType}`,
          response.status,
          response
        )
      }

      const data: ApiResponse<T> = await response.json()

      // Handle API errors
      if (!response.ok) {
        const error = new ApiError(
          data.message || `HTTP ${response.status}`,
          response.status,
          data
        )
        
        // Add status to error for TanStack Query retry logic
        ;(error as any).status = response.status
        throw error
      }

      return data
    } catch (error) {
      // Network or parsing errors
      if (error instanceof ApiError) {
        // Add status to error for TanStack Query retry logic
        ;(error as any).status = error.status
        throw error
      }
      
      const networkError = new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        error
      )
      ;(networkError as any).status = 0
      throw networkError
    }
  }

  // GET request
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PATCH request
  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Specific API functions for different resources

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (userData: { email: string; password: string; role?: string }) =>
    apiClient.post('/auth/register', userData),
  
  logout: () => apiClient.post('/auth/logout'),
  
  getMe: () => apiClient.get('/auth/me'),
}

// Companies API
export const companiesApi = {
  getAll: () => apiClient.get('/companies'),
  
  getById: (id: number) => apiClient.get(`/companies/${id}`),
  
  create: (company: any) => apiClient.post('/companies', company),
  
  update: (id: number, company: any) => apiClient.put(`/companies/${id}`, company),
  
  delete: (id: number) => apiClient.delete(`/companies/${id}`),
  
  // Company-specific applicants
  getApplicants: () => apiClient.get('/companies/applicants'),
}

// Positions API
export const positionsApi = {
  getAll: (filters?: any) => {
    const params = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    return apiClient.get(`/positions${params}`)
  },
  
  getById: (id: number) => apiClient.get(`/positions/${id}`),
  
  create: (position: any) => apiClient.post('/positions', position),
  
  update: (id: number, position: any) => apiClient.put(`/positions/${id}`, position),
  
  delete: (id: number) => apiClient.delete(`/positions/${id}`),
}

// Applicants API
export const applicantsApi = {
  getAll: (filters?: any) => {
    const params = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    return apiClient.get(`/applicants${params}`)
  },
  
  getById: (id: number) => apiClient.get(`/applicants/${id}`),
  
  create: (applicant: any) => apiClient.post('/applicants', applicant),
  
  update: (id: number, applicant: any) => apiClient.put(`/applicants/${id}`, applicant),
  
  delete: (id: number) => apiClient.delete(`/applicants/${id}`),
}

// Applications API
export const applicationsApi = {
  getAll: (filters?: any) => {
    const params = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    return apiClient.get(`/applications${params}`)
  },
  
  getById: (id: number) => apiClient.get(`/applications/${id}`),
  
  create: (application: any) => apiClient.post('/applications', application),
  
  updateStatus: (id: number, status: string) => 
    apiClient.patch(`/applications/${id}`, { status }),
  
  delete: (id: number) => apiClient.delete(`/applications/${id}`),
}

// Users API
export const usersApi = {
  getAll: (filters?: any) => {
    const params = filters ? `?${new URLSearchParams(filters).toString()}` : ''
    return apiClient.get(`/users${params}`)
  },
  
  getById: (id: string) => apiClient.get(`/users/${id}`),
  
  create: (user: any) => apiClient.post('/users', user),
  
  update: (id: string, user: any) => apiClient.put(`/users/${id}`, user),
  
  delete: (id: string) => apiClient.delete(`/users/${id}`),
}
