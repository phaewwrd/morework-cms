'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, Briefcase, Users, Clock, CheckCircle, XCircle, Eye, Loader2, LogOut, Phone, MapPinHouse } from 'lucide-react'
import { useCompanyPositions, useUserCompany } from '@/hooks/use-companies'
import { useUpdateApplicationStatus } from '@/hooks/use-applications'
import { parseSecureId } from '@/lib/hash'

interface Position {
  id: number
  title: string
  jobDescription: string
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED'
  companyId: number
  createdAt?: string
  company?: {
    id: number
    title: string
    city: string
    country: string
  }
  applicantPositions?: Array<{
    id: number
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    appliedAt: string
    applicant: {
      id: number
      firstName: string
      lastName: string
      email?: string
      phone?: string
      experience?: number
      expectedSalary?: number
    }
  }>
}

interface CompanyStats {
  totalJobs: number
  activeJobs: number
  pendingJobs: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
}

export default function CompanyDashboardPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const router = useRouter()
  const params = useParams()
  
  const hashedCompanyId = params.id as string

  // Parse and verify the hashed company ID
  const companyId = useMemo(() => {
    try {
      return parseSecureId(hashedCompanyId)
    } catch (error) {
      console.error('Invalid company ID:', error)
      return null
    }
  }, [hashedCompanyId])

  // Fetch user's company and verify access
  const { data: userCompany, isLoading: isLoadingCompany, error: companyError } = useUserCompany()
  
  // Fetch company positions
  const { 
    data: positionsResponse, 
    isLoading: isLoadingPositions, 
    error: positionsError 
  } = useCompanyPositions()

  // Combined loading and error states
  const isLoading = isLoadingCompany || isLoadingPositions
  const error = companyError || positionsError

  // Verify access: user can only access their own company dashboard
  const hasAccess = useMemo(() => {
    if (!userCompany || !companyId) return false
    return userCompany.id === companyId
  }, [userCompany, companyId])

  // Update application status mutation
  const updateApplicationMutation = useUpdateApplicationStatus()

  // Calculate stats from positions data
  const stats = useMemo(() => {
    if (!positionsResponse?.data) {
      return {
        totalJobs: 0,
        activeJobs: 0,
        pendingJobs: 0,
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0
      }
    }

    return positionsResponse.data.reduce(
      (acc: CompanyStats, position: Position) => {
        acc.totalJobs += 1
        if (position.status === 'ACTIVE') {
          acc.activeJobs += 1
        } else if (position.status === 'INACTIVE') {
          acc.pendingJobs += 1
        }
        
        position.applicantPositions?.forEach(application => {
          acc.totalApplications += 1
          if (application.status === 'PENDING') {
            acc.pendingApplications += 1
          } else if (application.status === 'ACCEPTED') {
            acc.acceptedApplications += 1
          } else if (application.status === 'REJECTED') {
            acc.rejectedApplications += 1
          }
        })
        
        return acc
      },
      {
        totalJobs: 0,
        activeJobs: 0,
        pendingJobs: 0,
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0
      } as CompanyStats
    )
  }, [positionsResponse?.data])

  // Filter positions based on search and status
  const filteredPositions = useMemo(() => {
    if (!positionsResponse?.data) return []

    return positionsResponse.data.filter((position: Position) => {
      const matchesSearch = 
        position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        position.jobDescription.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = 
        statusFilter === '' || 
        statusFilter === 'ALL' || 
        position.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [positionsResponse?.data, searchTerm, statusFilter])

  const handleViewApplicants = (positionId: number) => {
    const route = `/dashboard/companies/${hashedCompanyId}/applicants?position=${positionId}` as any
    router.push(route)
  }

  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/auth/login')
      } else {
        console.error('Failed to sign out')
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Handle invalid company ID
  if (companyId === null) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invalid Company ID</h3>
            <p className="text-muted-foreground">
              The company ID in the URL is invalid or corrupted.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-muted-foreground">Loading company dashboard...</p>
        </div>
      </div>
    )
  }

  // Handle unauthorized access
  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">
              You don't have permission to access this company dashboard.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-6 p-4 border-b">
        <div className="flex items-center gap-4 w-full">
          <div className="flex items-center gap-2 w-full">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">{userCompany?.title || 'Company'}</h1>
              <p className="text-sm text-muted-foreground">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">เบอร์ติดต่อ</h1>
              <p className="text-sm text-muted-foreground">{userCompany?.contactName} {userCompany?.contactPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPinHouse className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">ที่อยู่</h1>
              <p className="text-sm text-muted-foreground">{ userCompany?.address || '-'}</p>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Company Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your job positions and applications</p>
          </div>
          <Button asChild>
            <Link href={`/dashboard/companies/${hashedCompanyId}/create-job` as any}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeJobs} active, {stats.pendingJobs} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              Currently hiring
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingJobs}</div>
            <p className="text-xs text-muted-foreground">
              Inactive positions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acceptedApplications}</div>
            <p className="text-xs text-muted-foreground">
              Hired candidates
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedApplications}</div>
            <p className="text-xs text-muted-foreground">
              Not selected
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job Positions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Job Positions</CardTitle>
              <CardDescription>
                Manage and track all your job openings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Positions List */}
          <div className="space-y-4">
            {filteredPositions.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No positions found</h3>
                <p className="text-muted-foreground">
                  {positionsResponse?.data?.length === 0 
                    ? "Get started by creating your first job position."
                    : "No positions match your current filters."}
                </p>
                {positionsResponse?.data?.length === 0 && (
                  <Button asChild className="mt-4">
                    <Link href={`/dashboard/companies/${hashedCompanyId}/create-job` as any}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Your First Job
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              filteredPositions.map((position: Position) => (
                <div
                  key={position.id}
                  className="border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{position.title}</h3>
                        <Badge 
                          variant={
                            position.status === 'ACTIVE' ? 'outline' :
                            position.status === 'INACTIVE' ? 'secondary' : 'destructive'
                          }
                          className={
                            position.status === 'ACTIVE' ? 'border-green-500 text-green-700 bg-green-50' : ''
                          }
                        >
                          {position.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {position.jobDescription}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Applications: {position.applicantPositions?.length || 0}
                        </span>
                        <span>
                          Pending: {position.applicantPositions?.filter((app: any) => app.status === 'PENDING').length || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewApplicants(position.id)}
                        disabled={!position.applicantPositions || position.applicantPositions.length === 0}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Applicants ({position.applicantPositions?.length || 0})
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
