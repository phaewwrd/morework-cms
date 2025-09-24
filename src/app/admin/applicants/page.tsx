'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import AdminNavbar from '@/components/AdminNavbar'

interface Applicant {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  age: number
  gender: 'MALE' | 'FEMALE'
  birthDate: string
  startWorkingDate: string
  prefferedLocation: string
  positions: Array<{
    id: number
    title: string
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED'
    applicationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    company: {
      title: string
    }
  }>
}

interface ApplicantStats {
  totalApplicants: number
  maleApplicants: number
  femaleApplicants: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
}

export default function AdminApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [stats, setStats] = useState<ApplicantStats>({
    totalApplicants: 0,
    maleApplicants: 0,
    femaleApplicants: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')

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

  const calculateStats = (applicantsData: Applicant[]) => {
    const stats = applicantsData.reduce(
      (acc, applicant) => {
        acc.totalApplicants += 1
        if (applicant.gender === 'MALE') {
          acc.maleApplicants += 1
        } else if (applicant.gender === 'FEMALE') {
          acc.femaleApplicants += 1
        }
        
        applicant.positions.forEach(position => {
          acc.totalApplications += 1
          if (position.applicationStatus === 'PENDING') {
            acc.pendingApplications += 1
          } else if (position.applicationStatus === 'ACCEPTED') {
            acc.acceptedApplications += 1
          } else if (position.applicationStatus === 'REJECTED') {
            acc.rejectedApplications += 1
          }
        })
        
        return acc
      },
      {
        totalApplicants: 0,
        maleApplicants: 0,
        femaleApplicants: 0,
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0
      }
    )
    setStats(stats)
  }

  const filteredApplicants = applicants.filter(applicant => {
    const matchesSearch = 
      applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesGender = genderFilter === '' || applicant.gender === genderFilter
    
    const matchesStatus = statusFilter === '' || 
      applicant.positions.some(pos => pos.applicationStatus === statusFilter)
    
    return matchesSearch && matchesGender && matchesStatus
  })

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
    <>
      <AdminNavbar />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard - Applicants</h1>
          <p className="text-muted-foreground">Manage all job applicants and their applications</p>
        </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplicants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Male</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.maleApplicants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Female</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{stats.femaleApplicants}</div>
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
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.acceptedApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejectedApplications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search & Filter Applicants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search by Name or Email
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
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Filter by Application Status
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
          <CardTitle>All Applicants ({filteredApplicants.length})</CardTitle>
          <CardDescription>
            Overview of all job applicants with their application details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplicants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No applicants found matching your criteria.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="border rounded-lg p-6 space-y-4"
                >
                  {/* Applicant Header */}
                  <div className="flex items-start justify-between border-b pb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {applicant.firstName} {applicant.lastName}
                      </h2>
                      <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p>📧 {applicant.email}</p>
                        <p>📞 {applicant.phone}</p>
                        <p>🎂 Age: {applicant.age} • Gender: {applicant.gender}</p>
                        <p>📅 Available from: {new Date(applicant.startWorkingDate).toLocaleDateString()}</p>
                        <p>📍 Preferred Location: {applicant.prefferedLocation}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-6 text-center">
                      <Badge variant={applicant.gender === 'MALE' ? 'default' : 'secondary'}>
                        {applicant.gender}
                      </Badge>
                      <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                        {applicant.positions.length} application{applicant.positions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Applications */}
                  {applicant.positions.length > 0 ? (
                    <div>
                      <h3 className="font-medium mb-3 text-gray-800">Applications</h3>
                      <div className="space-y-3">
                        {applicant.positions.map((position, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{position.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  at {position.company.title}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={position.status === 'ACTIVE' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {position.status}
                                </Badge>
                                <Badge
                                  variant={
                                    position.applicationStatus === 'ACCEPTED' ? 'default' :
                                    position.applicationStatus === 'PENDING' ? 'secondary' :
                                    'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {position.applicationStatus}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No applications yet
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  )
}
