'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Users, Eye, Mail, Phone, Calendar, Briefcase } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Applicant {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  experience: number
  expectedSalary: number | null
  applications: Array<{
    id: number
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    appliedAt: string
    position: {
      id: number
      title: string
    }
  }>
}

export default function AllApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [jobFilter, setJobFilter] = useState('')
  const [positions, setPositions] = useState<Array<{id: number, title: string}>>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch positions to get job filter options
      const positionsResponse = await fetch('/api/positions')
      const positionsData = await positionsResponse.json()
      
      if (positionsData.success) {
        setPositions(positionsData.data.map((p: any) => ({ id: p.id, title: p.title })))
      }

      // Fetch all applicants with their applications
      const applicantsResponse = await fetch('/api/companies/applicants')
      const applicantsData = await applicantsResponse.json()
      
      if (applicantsData.success) {
        setApplicants(applicantsData.data)
      } else {
        toast({
          title: 'Error',
          description: applicantsData.message || 'Failed to fetch applicants',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applicants data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = 
      applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === '' || 
      applicant.applications.some(app => app.status === statusFilter)
    
    const matchesJob = jobFilter === '' ||
      applicant.applications.some(app => app.position.id.toString() === jobFilter)
    
    return matchesSearch && matchesStatus && matchesJob
  })

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
        setApplicants(prev => 
          prev.map(applicant => ({
            ...applicant,
            applications: applicant.applications.map(application =>
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
          <div className="text-lg">Loading applicants...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/companies">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Applicants</h1>
            <p className="text-muted-foreground">Review and manage all applications to your job postings</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search Applicants
              </label>
              <Input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Application Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Job</label>
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Jobs</SelectItem>
                  {positions.map((position) => (
                    <SelectItem key={position.id} value={position.id.toString()}>
                      {position.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      <Card>
        <CardHeader>
          <CardTitle>Applicants ({filteredApplicants.length})</CardTitle>
          <CardDescription>
            Manage all applicants across your job postings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplicants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No applicants found</h3>
              <p className="text-muted-foreground">
                {applicants.length === 0 
                  ? "No applications have been received yet."
                  : "No applicants match your current filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {applicant.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {applicant.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {applicant.experience} years experience
                        </span>
                      </div>
                      {applicant.expectedSalary && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Expected Salary: ${applicant.expectedSalary.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/companies/applicants/${applicant.id}` as any}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                  </div>

                  {/* Applications */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Applications ({applicant.applications.length})</h4>
                    {applicant.applications.map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{application.position.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Applied: {new Date(application.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              application.status === 'ACCEPTED' ? 'default' :
                              application.status === 'PENDING' ? 'secondary' : 'destructive'
                            }
                          >
                            {application.status}
                          </Badge>
                          <div className="flex gap-1">
                            {application.status !== 'ACCEPTED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-50 h-8 px-2"
                                onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                              >
                                Accept
                              </Button>
                            )}
                            {application.status !== 'REJECTED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 h-8 px-2"
                                onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                            )}
                            {application.status === 'REJECTED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 hover:bg-blue-50 h-8 px-2"
                                onClick={() => updateApplicationStatus(application.id, 'PENDING')}
                              >
                                Reconsider
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
