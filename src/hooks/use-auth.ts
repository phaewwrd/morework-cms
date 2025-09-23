import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { toast } from '@/hooks/use-toast'

// Auth queries
export function useAuth() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authApi.getMe,
    retry: false, // Don't retry auth queries
    staleTime: Infinity, // Keep user data fresh until explicitly invalidated
  })
}

// Auth mutations
export function useLogin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Update auth cache with user data
      queryClient.setQueryData(queryKeys.auth.user(), data)
      
      // Invalidate and refetch user-dependent queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
      
      toast({
        title: 'Success',
        description: 'Login successful',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Login failed',
        variant: 'destructive',
      })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Registration successful',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Registration failed',
        variant: 'destructive',
      })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear()
      
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      })
    },
    onError: (error: any) => {
      // Even if logout fails on server, clear local cache
      queryClient.clear()
      
      toast({
        title: 'Warning',
        description: 'Logout may not have completed properly',
        variant: 'destructive',
      })
    },
  })
}
