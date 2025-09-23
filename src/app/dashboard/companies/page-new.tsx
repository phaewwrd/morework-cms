'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, Briefcase, Users, Clock, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react'
import { usePositions, useUpdatePosition } from '@/hooks/use-positions'
import { useUpdateApplicationStatus } from '@/hooks/use-applications'

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
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
}

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Fetch positions using TanStack Query
  const { 
    data: positionsResponse, 
    isLoading, 
    error,
    refetch 
  } = usePositions()

  // Update position mutation
  const updatePositionMutation = useUpdatePosition()

  // Update application status mutation
  const updateApplicationMutation = useUpdateApplicationStatus()

  // Calculate stats from positions data
  const stats = useMemo(() => {
    if (!positionsResponse?.data) {
      return {
        totalJobs: 0,
        activeJobs: 0,
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
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0
      }
    )
  }, [positionsResponse?.data])

  // Filter positions based on search and status
  const filteredPositions = useMemo(() => {
    if (!positionsResponse?.data) return []
    
    return positionsResponse.data.filter((position: Position) => {
      const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === '' || position.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [positionsResponse?.data, searchTerm, statusFilter])

  const updatePositionStatus = (positionId: number, newStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED') => {
    updatePositionMutation.mutate({
      id: positionId,
      data: { status: newStatus }
    })
  }

  const updateApplicationStatus = (applicationId: number, newStatus: 'ACCEPTED' | 'REJECTED' | 'PENDING') => {
    updateApplicationMutation.mutate({
      id: applicationId,
      status: newStatus
    })
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading dashboard...</span>
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
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
            <p className="text-muted-foreground">Manage your job positions and applications</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/companies/create-job">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeJobs} active
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
              All applications received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting decision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.acceptedApplications}</div>
            <p className="text-xs text-muted-foreground">
              Successful applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejectedApplications}</div>
            <p className="text-xs text-muted-foreground">
              Not suitable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">
              Currently hiring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for managing your positions</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/companies/create-job">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Job
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/companies/applicants">
                <Users className="h-4 w-4 mr-2" />
                View All Applicants
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Summary</CardTitle>
            <CardDescription>Overview of recent application activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pending Reviews:</span>
                <Badge variant="secondary">{stats.pendingApplications}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>This Week's Applications:</span>
                <Badge variant="outline">--</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Response Rate:</span>
                <Badge variant="outline">
                  {stats.totalApplications > 0 
                    ? `${Math.round(((stats.acceptedApplications + stats.rejectedApplications) / stats.totalApplications) * 100)}%`
                    : '0%'
                  }
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Job Positions</CardTitle>
              <CardDescription>
                Manage your job postings and view applications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
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
                    <Link href="/dashboard/companies/create-job">
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
                            position.status === 'ACTIVE' ? 'default' :
                            position.status === 'INACTIVE' ? 'secondary' : 'destructive'
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
                        <span>
                          Created: {position.createdAt ? new Date(position.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View ({position.applicantPositions?.length || 0})
                      </Button>
                    </div>
                  </div>

                  {/* Quick Status Update */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <span className="text-sm font-medium">Status:</span>
                    {position.status !== 'ACTIVE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => updatePositionStatus(position.id, 'ACTIVE')}
                        disabled={updatePositionMutation.isPending}
                      >
                        Activate
                      </Button>
                    )}
                    {position.status !== 'INACTIVE' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-orange-600 hover:bg-orange-50"
                        onClick={() => updatePositionStatus(position.id, 'INACTIVE')}
                        disabled={updatePositionMutation.isPending}
                      >
                        Pause
                      </Button>
                    )}
                    {position.status !== 'CLOSED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => updatePositionStatus(position.id, 'CLOSED')}
                        disabled={updatePositionMutation.isPending}
                      >
                        Close
                      </Button>
                    )}
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
