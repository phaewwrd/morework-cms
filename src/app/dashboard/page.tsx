'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useUserCompany } from '@/hooks/use-companies'
import { createSecureId } from '@/lib/hash'

export default function DashboardPage() {
  const router = useRouter()
  const { data: company, isLoading, error } = useUserCompany()

  useEffect(() => {
    if (company?.id) {
      // Create hashed ID for the company and redirect
      const hashedId = createSecureId(company.id)
      router.replace(`/dashboard/companies/${hashedId}`)
    }
  }, [company, router])

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Access Error</h3>
            <p className="text-muted-foreground mb-4">
              Unable to access company dashboard. Please contact support.
            </p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while redirecting
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  )
}
