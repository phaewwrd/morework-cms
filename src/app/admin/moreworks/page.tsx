'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

interface Applicant {
  id: number
  firstName: string
  lastName: string
  gender: string
  birthDate: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  zipCode: string
  skills: string
  experience: number
  expectedSalary: number
  currentlyEmployed: boolean
  applicationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

interface ApplicantStats {
  total: number
  accepted: number
  pending: number
  rejected: number
}

export default function MoreWorksPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [stats, setStats] = useState<ApplicantStats>({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      const response = await fetch('/api/applicants')
      const data = await response.json()
      
      if (data.success) {
        setApplicants(data.data)
        calculateStats(data.data)
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch applicants',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applicants',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (applicantData: Applicant[]) => {
    const stats = applicantData.reduce(
      (acc, applicant) => {
        acc.total += 1
        switch (applicant.applicationStatus) {
          case 'ACCEPTED':
            acc.accepted += 1
            break
          case 'PENDING':
            acc.pending += 1
            break
          case 'REJECTED':
            acc.rejected += 1
            break
        }
        return acc
      },
      { total: 0, accepted: 0, pending: 0, rejected: 0 }
    )
    setStats(stats)
  }

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = 
      applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGender = genderFilter === '' || applicant.gender === genderFilter
    const matchesStatus = statusFilter === '' || applicant.applicationStatus === statusFilter
    
    return matchesSearch && matchesGender && matchesStatus
  })

  const updateApplicantStatus = async (applicantId: number, newStatus: 'ACCEPTED' | 'REJECTED' | 'PENDING') => {
    try {
      const response = await fetch(`/api/applicants/${applicantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationStatus: newStatus }),
      })

      const data = await response.json()
      
      if (data.success) {
        setApplicants(prev => 
          prev.map(applicant => 
            applicant.id === applicantId 
              ? { ...applicant, applicationStatus: newStatus }
              : applicant
          )
        )
        calculateStats(applicants.map(applicant => 
          applicant.id === applicantId 
            ? { ...applicant, applicationStatus: newStatus }
            : applicant
        ))
        toast({
          title: 'Success',
          description: 'Applicant status updated successfully',
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
        description: 'Failed to update applicant status',
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
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">MoreWorks Dashboard</h1>
        <p className="text-muted-foreground">Manage workers and applicants</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search by Name
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Search applicants..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="gender" className="text-sm font-medium">
                Filter by Gender
              </label>
              <select
                id="gender"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
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
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      <Card>
        <CardHeader>
          <CardTitle>Applicants ({filteredApplicants.length})</CardTitle>
          <CardDescription>
            Manage applicant applications and statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplicants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No applicants found matching your criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {applicant.firstName} {applicant.lastName}
                    </h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Email: {applicant.email}</p>
                      <p>Phone: {applicant.phone}</p>
                      <p>Gender: {applicant.gender}</p>
                      <p>Experience: {applicant.experience} years</p>
                      <p>Expected Salary: ${applicant.expectedSalary?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <div className={`px-2 py-1 rounded text-xs font-medium text-center ${
                      applicant.applicationStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      applicant.applicationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {applicant.applicationStatus}
                    </div>
                    <div className="flex gap-1">
                      {applicant.applicationStatus !== 'ACCEPTED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => updateApplicantStatus(applicant.id, 'ACCEPTED')}
                        >
                          Accept
                        </Button>
                      )}
                      {applicant.applicationStatus !== 'REJECTED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => updateApplicantStatus(applicant.id, 'REJECTED')}
                        >
                          Reject
                        </Button>
                      )}
                      {applicant.applicationStatus !== 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-yellow-600 hover:bg-yellow-50"
                          onClick={() => updateApplicantStatus(applicant.id, 'PENDING')}
                        >
                          Pending
                        </Button>
                      )}
                    </div>
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
