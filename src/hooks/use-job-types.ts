import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface JobType {
  id: number
  title: string
  createdAt: string
  updatedAt: string
}

export interface ApplicantJobType {
  id: number
  applicantId: number
  jobTypeId: number
  jobType: {
    id: number
    title: string
  }
}

// Fetch all job types
export const useJobTypes = () => {
  return useQuery({
    queryKey: ['jobTypes'],
    queryFn: async (): Promise<JobType[]> => {
      const response = await fetch('/api/job-types')
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch job types')
      }
      
      return data.data
    }
  })
}

// Update applicant job types
export const useUpdateApplicantJobTypes = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      applicantId, 
      jobTypeIds 
    }: { 
      applicantId: string
      jobTypeIds: number[] 
    }): Promise<ApplicantJobType[]> => {
      const response = await fetch(`/api/applicants/${applicantId}/job-types`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobTypeIds }),
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update job types')
      }
      
      return data.data
    },
    onSuccess: (_, { applicantId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['applicant', applicantId] })
      queryClient.invalidateQueries({ queryKey: ['applicant-job-types', applicantId] })
    }
  })
}