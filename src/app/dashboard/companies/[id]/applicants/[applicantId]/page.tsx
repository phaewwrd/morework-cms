'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Mail, Phone, DollarSign, Calendar, Briefcase, FileText, CheckCircle, XCircle, RotateCcw, Loader2, MapPin, GraduationCap, Building2 } from 'lucide-react'
import { useApplicant } from '@/hooks/use-applicants'
import { useUpdateApplicationStatus } from '@/hooks/use-applications'
import { useParams } from 'next/navigation'


interface ApplicantDetailPageProps {
  params: {
    id: string
  }
}

export default  function ApplicantDetailPage() {
  const { id: companyId, applicantId: applicantIdParam } = useParams()
  const applicantId = parseInt(applicantIdParam as string)
  const hashedCompanyId = companyId as string

  // Fetch applicant details using TanStack Query
  const { 
    data: applicantResponse, 
    isLoading, 
    error,
    refetch 
  } = useApplicant(applicantId, !isNaN(applicantId))

  // Update application status mutation
  const updateApplicationMutation = useUpdateApplicationStatus()

  const applicant = useMemo(() => applicantResponse?.data, [applicantResponse])

  const updateApplicationStatus = (applicationId: number, newStatus: 'ACCEPTED' | 'REJECTED' | 'PENDING') => {
    updateApplicationMutation.mutate({
      id: applicationId,
      status: newStatus
    }, {
      onSuccess: () => {
        // Refetch applicant data to get updated application statuses
        refetch()
      }
    })
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading applicant details...</span>
          </div>
        </div>
      </div>
    )
  }

  // Handle error state
  if (error || !applicant) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Applicant not found</h3>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'The requested applicant could not be found.'}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={() => refetch()}>
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href={"/dashboard/companies/applicants" as any}>
                Back to Applicants
              </Link>
            </Button>
          </div>
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
            <Link href={`/dashboard/companies/${hashedCompanyId}/applicants` as any}>
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
                {applicant.first_name} {applicant.last_name}
              </h1>
              <p className="text-muted-foreground">Applicant Profile & Applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Personal Information */}
        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">First Name</p>
                  <p className="text-sm">{applicant.first_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Name</p>
                  <p className="text-sm">{applicant.last_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gender</p>
                  <p className="text-sm">{applicant.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="text-sm">{applicant.age}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Birth Date</p>
                  <p className="text-sm">{applicant.birth_date ? new Date(applicant.birth_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Working Date</p>
                  <p className="text-sm">{applicant.start_working_date ? new Date(applicant.start_working_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Preferred Location</p>
                  <p className="text-sm">{applicant.prefferedLocation || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
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
            </CardContent>
          </Card>

          {/* Addresses */}
          {applicant.addresses && applicant.addresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Addresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applicant.addresses.map((address: any, index: number) => (
                    <div key={address.id || index} className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {address.address}, {address.district?.title}, {address.district?.province?.title}
                      </p>
                   
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social Media */}
          {applicant.socialMedia && applicant.socialMedia.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applicant.socialMedia.map((social: any) => (
                    <div key={social.id} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">{social.provider}</p>
                      <p className="text-sm text-muted-foreground">{social.sessionId}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Professional Information */}
        <div className="space-y-6">
          {/* Job Types */}
          {applicant.jobTypes && applicant.jobTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {applicant.jobTypes.map((jobType: any) => (
                    <Badge key={jobType.id} variant="secondary">
                      {jobType.jobType.title}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {applicant.educations && applicant.educations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applicant.educations.map((education: any) => (
                    <div key={education.id} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">{education.field}</p>
                      <p className="text-sm text-muted-foreground">{education.institution}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {education.educationLevel?.title} • {education.graduationYear}
                        </span>
                        <Badge variant="outline">GPA: {education.gpa}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Experience */}
          {applicant.workExperiences && applicant.workExperiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applicant.workExperiences.map((experience: any, index: number) => (
                    <div key={experience.id || index} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">{experience.position}</p>
                      <p className="text-sm text-muted-foreground">{experience.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {experience.start_date ? new Date(experience.start_date).toLocaleDateString() : 'N/A'} - 
                        {experience.end_date ? new Date(experience.end_date).toLocaleDateString() : 'Present'}
                      </p>
                      {experience.description && (
                        <p className="text-sm mt-2">{experience.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trainings */}
          {applicant.trainings && applicant.trainings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Trainings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applicant.trainings.map((training: any) => (
                    <div key={training.id} className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">{training.title}</p>
                      <p className="text-sm text-muted-foreground">Year: {training.trainingYear}</p>
                      {training.description && (
                        <p className="text-sm mt-2">{training.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {applicant.documents && applicant.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applicant.documents.map((document: any) => (
                    <div key={document.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{document.description}</p>
                        <Badge variant="outline">{document.documentType}</Badge>
                      </div>
                      {document.filePath && (
                        <p className="text-xs text-muted-foreground mt-1">
                          File: {document.filePath}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
