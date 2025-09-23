'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Mail, Phone, DollarSign, Calendar, Briefcase, FileText, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ApplicantDetail {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  experience: number
  expectedSalary: number | null
  resume?: string
  coverLetter?: string
  skills?: string
  education?: string
  applications: Array<{
    id: number
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
    appliedAt: string
    coverLetter?: string
    resumeUrl?: string
    position: {
      id: number
      title: string
      description: string
    }
  }>
}

interface ApplicantDetailPageProps {
  params: {
    id: string
  }
}

export default function ApplicantDetailPage({ params }: ApplicantDetailPageProps) {
  const [applicant, setApplicant] = useState<ApplicantDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    fetchApplicant()
  }, [params.id])

  const fetchApplicant = async () => {
    try {
      const response = await fetch(`/api/applicants/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setApplicant(data.data)
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to fetch applicant details',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch applicant details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: number, newStatus: 'ACCEPTED' | 'REJECTED' | 'PENDING') => {
    setUpdating(applicationId)
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
        setApplicant(prev => 
          prev ? {
            ...prev,
            applications: prev.applications.map(application =>
              application.id === applicationId
                ? { ...application, status: newStatus }
                : application
            )
          } : null
        )
        toast({
          title: 'Success',
          description: `Application ${newStatus.toLowerCase()} successfully`,
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
    } finally {
      setUpdating(null)
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
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Applicant not found</h3>
          <p className="text-muted-foreground">The requested applicant could not be found.</p>
          <Button asChild className="mt-4">
            <Link href={"/dashboard/companies/applicants" as any}>
              Back to Applicants
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={"/dashboard/companies/applicants" as any}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applicants
            </Link>
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {applicant.firstName} {applicant.lastName}
              </h1>
              <p className="text-muted-foreground">Applicant Profile & Applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Applicant Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-sm text-muted-foreground">{applicant.experience} years</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {applicant.expectedSalary && (
                  <div>
                    <p className="text-sm font-medium">Expected Salary</p>
                    <p className="text-sm text-muted-foreground">
                      ${applicant.expectedSalary.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills & Education */}
          {(applicant.skills || applicant.education) && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {applicant.skills && (
                  <div>
                    <p className="text-sm font-medium mb-2">Skills</p>
                    <p className="text-sm text-muted-foreground">{applicant.skills}</p>
                  </div>
                )}
                {applicant.education && (
                  <div>
                    <p className="text-sm font-medium mb-2">Education</p>
                    <p className="text-sm text-muted-foreground">{applicant.education}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Applications */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Applications ({applicant.applications.length})</CardTitle>
              <CardDescription>
                All applications submitted by this candidate
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applicant.applications.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">No applications found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {applicant.applications.map((application) => (
                    <div
                      key={application.id}
                      className="border rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{application.position.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {application.position.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Applied: {new Date(application.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge 
                          variant={
                            application.status === 'ACCEPTED' ? 'default' :
                            application.status === 'PENDING' ? 'secondary' : 'destructive'
                          }
                          className="ml-4"
                        >
                          {application.status}
                        </Badge>
                      </div>

                      {/* Cover Letter */}
                      {application.coverLetter && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Cover Letter</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">{application.coverLetter}</p>
                          </div>
                        </div>
                      )}

                      {/* Resume Link */}
                      {application.resumeUrl && (
                        <div className="mb-4">
                          <Button asChild variant="outline" size="sm">
                            <Link 
                              href={application.resumeUrl as any} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Resume
                            </Link>
                          </Button>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        {application.status !== 'ACCEPTED' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                            disabled={updating === application.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {updating === application.id ? 'Updating...' : 'Accept'}
                          </Button>
                        )}
                        {application.status !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            disabled={updating === application.id}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {updating === application.id ? 'Updating...' : 'Reject'}
                          </Button>
                        )}
                        {(application.status === 'REJECTED' || application.status === 'ACCEPTED') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateApplicationStatus(application.id, 'PENDING')}
                            disabled={updating === application.id}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            {updating === application.id ? 'Updating...' : 'Reset to Pending'}
                          </Button>
                        )}
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/companies/positions/${application.position.id}` as any}>
                            View Job Details
                          </Link>
                        </Button>
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
