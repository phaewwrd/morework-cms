import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicantsApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'

// Applicant queries
export function useApplicants(filters?: any) {
  return useQuery({
    queryKey: queryKeys.applicants.list(filters || {}),
    queryFn: () => applicantsApi.getAll(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes - applicant data changes frequently
  })
}

export function useApplicant(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.applicants.detail(id),
    queryFn: () => applicantsApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Applicant mutations
export function useCreateApplicant() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: applicantsApi.create,
    onSuccess: (data) => {
      // Invalidate applicants list
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() })
      
      // Optimistically add to cache
      if (data.data) {
        queryClient.setQueryData(
          queryKeys.applicants.detail(data.data.id),
          data
        )
      }
      
      toast({
        title: 'Success',
        description: 'Applicant created successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create applicant',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateApplicant() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      applicantsApi.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific applicant in cache
      queryClient.setQueryData(
        queryKeys.applicants.detail(variables.id),
        data
      )
      
      // Invalidate applicants list to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() })
      
      // Also invalidate company applicants if this affects company view
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.byCompany(0) })
      
      toast({
        title: 'Success',
        description: 'Applicant updated successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update applicant',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteApplicant() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: applicantsApi.delete,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.applicants.detail(id) })
      
      // Invalidate applicants list
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() })
      
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.byCompany(0) })
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.byApplicant(id) })
      
      toast({
        title: 'Success',
        description: 'Applicant deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete applicant',
        variant: 'destructive',
      })
    },
  })
}
