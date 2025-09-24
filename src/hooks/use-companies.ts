import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { companiesApi, positionsApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { createSecureId } from '@/lib/hash'
import { toast } from '@/hooks/use-toast'

// Company queries
export function useCompanies(filters?: any) {
  return useQuery({
    queryKey: queryKeys.companies.list(filters || {}),
    queryFn: () => companiesApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCompany(id: number, enabled = true) {
  return useQuery({
    queryKey: queryKeys.companies.detail(id),
    queryFn: () => companiesApi.getById(id),
    enabled: enabled && !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCompanyApplicants() {
  return useQuery({
    queryKey: queryKeys.applicants.byCompany(0), // Use 0 as placeholder for current company
    queryFn: companiesApi.getApplicants,
    staleTime: 2 * 60 * 1000, // 2 minutes - applicant data changes more frequently
  })
}

// Company mutations
export function useCreateCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: companiesApi.create,
    onSuccess: (data) => {
      // Invalidate companies list
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() })
      
      // Optimistically add to cache
      if (data.data) {
        queryClient.setQueryData(
          queryKeys.companies.detail(data.data.id),
          data
        )
      }
      
      toast({
        title: 'Success',
        description: 'Company created successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create company',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      companiesApi.update(id, data),
    onSuccess: (data, variables) => {
      // Update the specific company in cache
      queryClient.setQueryData(
        queryKeys.companies.detail(variables.id),
        data
      )
      
      // Invalidate companies list to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() })
      
      toast({
        title: 'Success',
        description: 'Company updated successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update company',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: companiesApi.delete,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.companies.detail(id) })
      
      // Invalidate companies list
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.lists() })
      
      toast({
        title: 'Success',
        description: 'Company deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete company',
        variant: 'destructive',
      })
    },
  })
}

// User's company specific hooks
export function useUserCompany() {
  const { data: user } = useAuth()
  
  return useQuery({
    queryKey: queryKeys.companies.userCompany(user?.data?.userId || 0),
    queryFn: async () => {
      const response = await companiesApi.getCurrentUserCompany()
      if (response.data) {
        return {
          ...response.data,
          name: response.data.title, // Map title to name for consistency
          secureId: createSecureId(response.data.id)
        }
      }
      return null
    },
    enabled: !!user?.data?.userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCompanyPositions() {
  return useQuery({
    queryKey: queryKeys.positions.byCompany(0), // Use 0 for current user's company
    queryFn: () => positionsApi.getAll(), // This now returns only user's company positions
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
