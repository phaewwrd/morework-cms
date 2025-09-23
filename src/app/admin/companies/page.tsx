'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

interface Position {
  id: number
  title: string
  jobDescription: string
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED'
  companyId: number
  company: {
    id: number
    title: string
    city: string
    country: string
  }
  applicantPositions: Array<{
    id: number
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    appliedAt: string
    applicant: {
      id: number
      firstName: string
      lastName: string
    }
  }>
}

interface CompanyStats {
  totalPositions: number
  activePositions: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
}

export default function CompaniesPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [stats, setStats] = useState<CompanyStats>({
    totalPositions: 0,
    activePositions: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchPositions()
  }, [])

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions')
      const data = await response.json()
      
      if (data.success) {
        setPositions(data.data)
        calculateStats(data.data)
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch positions',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch positions',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (positionData: Position[]) => {
    const stats = positionData.reduce(
      (acc, position) => {
        acc.totalPositions += 1
        if (position.status === 'ACTIVE') {
          acc.activePositions += 1
        }
        
        position.applicantPositions.forEach(application => {
          acc.totalApplications += 1
          if (application.status === 'PENDING') {
            acc.pendingApplications += 1
          } else if (application.status === 'ACCEPTED') {
            acc.acceptedApplications += 1
          }
        })
        
        return acc
      },
      {
        totalPositions: 0,
        activePositions: 0,
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0
      }
    )
    setStats(stats)
  }

  const filteredPositions = positions.filter(position => {
    const matchesSearch = position.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === '' || position.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const updatePositionStatus = async (positionId: number, newStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED') => {
    try {
      const response = await fetch(`/api/positions/${positionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      
      if (data.success) {
        setPositions(prev => 
          prev.map(position => 
            position.id === positionId 
              ? { ...position, status: newStatus }
              : position
          )
        )
        calculateStats(positions.map(position => 
          position.id === positionId 
            ? { ...position, status: newStatus }
            : position
        ))
        toast({
          title: 'Success',
          description: 'Position status updated successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update position status',
        variant: 'destructive',
      })
    }
  }

  const updateApplicationStatus = async (applicationId: number, newStatus: 'ACCEPTED' | 'REJECTED' | 'PENDING') => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()
      
      if (data.success) {
        setPositions(prev => 
          prev.map(position => ({
            ...position,
            applicantPositions: position.applicantPositions.map(application =>
              application.id === applicationId
                ? { ...application, status: newStatus }
                : application
            )
          }))
        )
        toast({
          title: 'Success',
          description: 'Application status updated successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update status',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading positions...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Companies Dashboard</h1>
        <p className="text-muted-foreground">Manage positions and applicants</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPositions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activePositions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.acceptedApplications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search by Position Title
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Search positions..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Filter by Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions List */}
      <Card>
        <CardHeader>
          <CardTitle>Positions ({filteredPositions.length})</CardTitle>
          <CardDescription>
            Manage your job positions and their applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPositions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No positions found matching your criteria.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPositions.map((position) => (
                <div
                  key={position.id}
                  className="border rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{position.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {position.company.title} • {position.company.city}, {position.company.country}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {position.jobDescription.substring(0, 200)}...
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <div className={`px-2 py-1 rounded text-xs font-medium text-center ${
                        position.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        position.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {position.status}
                      </div>
                      <div className="flex gap-1">
                        {position.status !== 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => updatePositionStatus(position.id, 'ACTIVE')}
                          >
                            Activate
                          </Button>
                        )}
                        {position.status !== 'CLOSED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => updatePositionStatus(position.id, 'CLOSED')}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Applications for this position */}
                  {position.applicantPositions.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">
                        Applications ({position.applicantPositions.length})
                      </h4>
                      <div className="space-y-3">
                        {position.applicantPositions.map((application) => (
                          <div
                            key={application.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                {application.applicant.firstName} {application.applicant.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Applied: {new Date(application.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {application.status}
                              </div>
                              <div className="flex gap-1">
                                {application.status !== 'ACCEPTED' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:bg-green-50"
                                    onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                                  >
                                    Accept
                                  </Button>
                                )}
                                {application.status !== 'REJECTED' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                                  >
                                    Reject
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
