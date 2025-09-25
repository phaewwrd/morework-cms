import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

/**
 * Hook to handle automatic token validation and redirect
 * This runs on the client side to catch token expiration during app usage
 */
export const useAuthGuard = () => {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're on a protected route
        const pathname = window.location.pathname
        const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard')
        
        if (!isProtectedRoute) {
          return
        }

        // Make a request to validate the current session
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        })

        if (!response.ok) {
          // Token is invalid or expired
          console.log('Auth check failed, redirecting to login')
          toast({
            title: 'Session Expired',
            description: 'Please log in again to continue.',
            variant: 'destructive',
          })
          
          // Clear any stored auth state
          localStorage.clear()
          sessionStorage.clear()
          
          // Redirect to login with current path as redirect param
          const loginUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`
          router.push(loginUrl as any)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // On network error, don't redirect - let user continue
      }
    }

    // Check auth immediately
    checkAuth()

    // Set up periodic auth checks (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000)

    // Also check when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])
}
