'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Briefcase, Phone, Mail, MapPin, Calendar, DollarSign } from 'lucide-react'
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

interface Position {
  id: number
  title: string
  jobDescription: string
  status: string
  company: {
    title: string
    city: string
    country: string
  }
  appliedAt: string
}

export default function ApplicantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [applicant, setApplicant] = useState<Applicant | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const applicantId = params.id

  useEffect(() => {
    if (applicantId) {
      fetchApplicantData()
    }
  }, [applicantId])

  const fetchApplicantData = async () => {
    try {
      setLoading(true)
      
      // Fetch applicant details
      const applicantResponse = await fetch(`/api/applicants/${applicantId}`)
      const applicantData = await applicantResponse.json()
      
      if (applicantData.success) {
        setApplicant(applicantData.data)
      }

      // Fetch applicant's position applications
      const positionsResponse = await fetch(`/api/applicants/${applicantId}/positions`)
      const positionsData = await positionsResponse.json()
      
      if (positionsData.success) {
        setPositions(positionsData.data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applicant data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading applicant details...</div>
        </div>
      </div>
    )
  }

  if (!applicant) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Applicant Not Found</h2>
          <Button asChild>
            <Link href="/admin/moreworks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to More Works
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/moreworks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to More Works
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {applicant.firstName} {applicant.lastName}
            </h1>
            <p className="text-muted-foreground">Applicant Details & Applications</p>
          </div>
          <Badge
            variant={
              applicant.applicationStatus === 'ACCEPTED' ? 'default' :
              applicant.applicationStatus === 'PENDING' ? 'secondary' : 'destructive'
            }
            className="ml-auto"
          >
            {applicant.applicationStatus}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Side - Applicant Data */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{applicant.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-sm text-muted-foreground">{applicant.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {applicant.address}, {applicant.city}, {applicant.country} {applicant.zipCode}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Birth Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(applicant.birthDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Gender</p>
                  <p className="text-sm text-muted-foreground">{applicant.gender}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Experience</p>
                  <p className="text-sm text-muted-foreground">{applicant.experience} years</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Expected Salary</p>
                    <p className="text-sm text-muted-foreground">
                      ${applicant.expectedSalary?.toLocaleString() || 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Currently Employed</p>
                  <Badge variant={applicant.currentlyEmployed ? 'default' : 'secondary'}>
                    {applicant.currentlyEmployed ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2">Skills</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {applicant.skills || 'No skills listed'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Position Applications */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Position Applications
              </CardTitle>
              <CardDescription>
                All positions this applicant has applied for
              </CardDescription>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Applications</h3>
                  <p className="text-muted-foreground">
                    This applicant hasn't applied to any positions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.map((position) => (
                    <div
                      key={position.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{position.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {position.company?.title} • {position.company?.city}, {position.company?.country}
                          </p>
                          <Badge
                            variant={
                              position.status === 'ACTIVE' ? 'outline' : 
                              position.status === 'CLOSED' ? 'destructive' : 'secondary'
                            }
                            className={
                              position.status === 'ACTIVE' ? 'border-green-500 text-green-700 bg-green-50' : ''
                            }
                          >
                            {position.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p className="mb-3 line-clamp-3">{position.jobDescription}</p>
                        <p>
                          <span className="font-medium">Applied:</span>{' '}
                          {new Date(position.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
