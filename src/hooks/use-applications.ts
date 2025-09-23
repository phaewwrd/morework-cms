import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'

// Application queries
export function useApplications(filters?: any) {
  return useQuery({
    queryKey: queryKeys.applications.list(filters || {}),
    queryFn: () => applicationsApi.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - application status changes frequently
  })
}

export function useApplication(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.applications.detail(id),
    queryFn: () => applicationsApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

// Application mutations
export function useCreateApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: applicationsApi.create,
    onSuccess: (data) => {
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.lists() })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.byCompany(0) })
      
      // Optimistically add to cache
      if (data.data) {
        queryClient.setQueryData(
          queryKeys.applications.detail(data.data.id),
          data
        )
      }
      
      toast({
        title: 'Success',
        description: 'Application submitted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      applicationsApi.updateStatus(id, status),
    onSuccess: (data, variables) => {
      // Update the specific application in cache
      queryClient.setQueryData(
        queryKeys.applications.detail(variables.id),
        data
      )
      
      // Invalidate related queries to reflect status changes
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.byCompany(0) })
      
      const statusText = variables.status.toLowerCase()
      toast({
        title: 'Success',
        description: `Application ${statusText} successfully`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update application status',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteApplication() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: applicationsApi.delete,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.applications.detail(id) })
      
      // Invalidate applications list
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.lists() })
      
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.applicants.byCompany(0) })
      
      toast({
        title: 'Success',
        description: 'Application deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete application',
        variant: 'destructive',
      })
    },
  })
}
