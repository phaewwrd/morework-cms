'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

interface Company {
  id: number
  title: string
  address: string
  city: string
  country: string
  email: string
  contactName: string
  contactPhone: string
  userId: string
  user: {
    id: string
    email: string
    createdAt: string
  }
  positions: Array<{
    id: number
    title: string
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED'
    applicantPositions: Array<{
      id: number
      status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
      appliedAt: string
      applicant: {
        id: number
        firstName: string
        lastName: string
        email: string
      }
    }>
  }>
}

interface AdminStats {
  totalCompanies: number
  totalPositions: number
  activePositions: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalCompanies: 0,
    totalPositions: 0,
    activePositions: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies')
      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.data)
        calculateStats(data.data)
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch companies',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch companies',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (companiesData: Company[]) => {
    const stats = companiesData.reduce(
      (acc, company) => {
        acc.totalCompanies += 1
        
        company.positions.forEach(position => {
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
        })
        
        return acc
      },
      {
        totalCompanies: 0,
        totalPositions: 0,
        activePositions: 0,
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0
      }
    )
    setStats(stats)
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading companies...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard - Companies</h1>
        <p className="text-muted-foreground">Manage all companies, positions and applicants</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          </CardContent>
        </Card>
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

      {/* Search Filter */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium">
              Search by Company Name, Contact Name or Email
            </label>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Search companies..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>All Companies ({filteredCompanies.length})</CardTitle>
          <CardDescription>
            Overview of all registered companies with their positions and applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No companies found matching your search criteria.
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCompanies.map((company) => {
                const totalApplications = company.positions.reduce((sum, pos) => sum + pos.applicantPositions.length, 0)
                const activePositions = company.positions.filter(pos => pos.status === 'ACTIVE').length
                
                return (
                  <div
                    key={company.id}
                    className="border rounded-lg p-6 space-y-6"
                  >
                    {/* Company Header */}
                    <div className="flex items-start justify-between border-b pb-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-blue-900">{company.title}</h2>
                        <div className="text-sm text-muted-foreground mt-2 space-y-1">
                          <p>📍 {company.address}, {company.city}, {company.country}</p>
                          <p>📧 {company.email}</p>
                          <p>👤 {company.contactName} • 📞 {company.contactPhone}</p>
                          <p>🔗 User: {company.user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-6 text-center">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {company.positions.length} position{company.positions.length !== 1 ? 's' : ''}
                        </div>
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          {activePositions} active
                        </div>
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                          {totalApplications} application{totalApplications !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Positions List */}
                    {company.positions.length > 0 ? (
                      <div>
                        <h3 className="font-medium mb-4 text-gray-800">Positions & Applications</h3>
                        <div className="space-y-4">
                          {company.positions.map((position) => (
                            <div key={position.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium">{position.title}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                                      position.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                      position.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {position.status}
                                    </div>
                                    {position.applicantPositions.length > 0 && (
                                      <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                        {position.applicantPositions.length} applicant{position.applicantPositions.length > 1 ? 's' : ''}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Applications */}
                              {position.applicantPositions.length > 0 && (
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                  <div className="space-y-2">
                                    {position.applicantPositions.map((application) => (
                                      <div
                                        key={application.id}
                                        className="flex items-center justify-between p-2 bg-white rounded border"
                                      >
                                        <div>
                                          <p className="font-medium text-sm">
                                            {application.applicant.firstName} {application.applicant.lastName}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {application.applicant.email} • Applied: {new Date(application.appliedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                                          application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                          application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {application.status}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No positions created yet
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
