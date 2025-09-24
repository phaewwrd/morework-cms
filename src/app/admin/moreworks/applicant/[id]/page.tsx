'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit, 
  Save,
  X,
  GraduationCap,
  FileText,
  Building
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import AdminNavbar from '@/components/AdminNavbar'
import { useApplicantDetail, useUpdateApplicant, type ApplicantDetail } from '@/hooks/use-applicant-detail'

interface EditableFieldProps {
  value: string | number
  onSave: (value: string) => void
  type?: 'text' | 'email' | 'tel' | 'date' | 'number'
  placeholder?: string
}

function EditableField({ value, onSave, type = 'text', placeholder }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value?.toString())

  const handleSave = () => {
    onSave(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value.toString())
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8"
          placeholder={placeholder}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
        >
          <Save className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="flex-1">{value || placeholder}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  )
}

export default function ApplicantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicantId = params.id as string

  const { data: applicant, isLoading, error } = useApplicantDetail(applicantId)
  const updateApplicantMutation = useUpdateApplicant()

  const handleUpdateField = async (field: string, value: string) => {
    try {
      await updateApplicantMutation.mutateAsync({
        id: applicantId,
        data: { [field]: value }
      })
      toast({
        title: "Success",
        description: `${field} updated successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applicant details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !applicant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminNavbar />
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Applicant Not Found</h2>
            <Button asChild>
              <Link href="/admin/moreworks">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workers
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/moreworks">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workers
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {applicant.firstName} {applicant.lastName}
              </h1>
              <p className="text-gray-600">{applicant.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Applicant Basic Info */}
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
                    <label className="text-sm font-medium text-gray-500">First Name</label>
                    <EditableField
                      value={applicant.firstName}
                      onSave={(value) => handleUpdateField('firstName', value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    <EditableField
                      value={applicant.lastName}
                      onSave={(value) => handleUpdateField('lastName', value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <EditableField
                      value={applicant.email}
                      onSave={(value) => handleUpdateField('email', value)}
                      type="email"
                      placeholder="Enter email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <EditableField
                      value={applicant.phone}
                      onSave={(value) => handleUpdateField('phone', value)}
                      type="tel"
                      placeholder="Enter phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <EditableField
                      value={applicant.gender}
                      onSave={(value) => handleUpdateField('gender', value)}
                      placeholder="Enter gender"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age</label>
                    <EditableField
                      value={applicant.age}
                      onSave={(value) => handleUpdateField('age', value)}
                      type="number"
                      placeholder="Enter age"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Birth Date</label>
                    <EditableField
                      value={(() => {
                        try {
                          const date = new Date(applicant.birthDate)
                          return date.getTime() > 0 ? date.toISOString().split('T')[0] : '1970-01-01'
                        } catch {
                          return '1970-01-01'
                        }
                      })()}
                      onSave={(value) => handleUpdateField('birthDate', value)}
                      type="date"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Working Date</label>
                    <EditableField
                      value={(() => {
                        try {
                          const date = new Date(applicant.startWorkingDate)
                          return date.getTime() > 0 ? date.toISOString().split('T')[0] : '1970-01-01'
                        } catch {
                          return '1970-01-01'
                        }
                      })()}
                      onSave={(value) => handleUpdateField('startWorkingDate', value)}
                      type="date"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferred Location</label>
                    <EditableField
                      value={applicant.prefferedLocation}
                      onSave={(value) => handleUpdateField('prefferedLocation', value)}
                      placeholder="Enter preferred location"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Addresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicant.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.addresses.map((address) => (
                      <div key={address.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{address.address}</p>
                        <p className="text-sm text-gray-600">
                          {address.district.title}, {address.district.province.title}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No addresses on file</p>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicant.educations.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.educations.map((education) => (
                      <div key={education.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{education.field}</p>
                        <p className="text-sm text-gray-600">{education.institution}</p>
                        <p className="text-sm text-gray-600">
                          {education.educationLevel.title} • Graduated {education.graduationYear} • GPA: {education.gpa}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No education history on file</p>
                )}
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicant.workExperiences.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.workExperiences.map((experience) => (
                      <div key={experience.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{experience.position}</p>
                          {experience.currentPosition && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{experience.company}</p>
                        <p className="text-sm text-gray-600">
                          {(() => {
                            try {
                              const startDate = new Date(experience.startDate)
                              const endDate = experience.endDate ? new Date(experience.endDate) : null
                              const startStr = startDate.getTime() > 0 ? startDate.toLocaleDateString() : 'Invalid Date'
                              const endStr = endDate && endDate.getTime() > 0 ? endDate.toLocaleDateString() : (experience.endDate ? 'Invalid Date' : 'Present')
                              return `${startStr} - ${endStr}`
                            } catch {
                              return 'Invalid Date - Present'
                            }
                          })()} 
                        </p>
                        <p className="text-sm mt-2">{experience.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No work experience on file</p>
                )}
              </CardContent>
            </Card>

            {/* Trainings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Trainings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicant.trainings.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.trainings.map((training) => (
                      <div key={training.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{training.title}</p>
                        <p className="text-sm text-gray-600">Year: {training.trainingYear}</p>
                        <p className="text-sm mt-2">{training.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No trainings on file</p>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicant.documents.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.documents.map((document) => (
                      <div key={document.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{document.description}</p>
                          <Badge variant="outline">{document.documentType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{document.filePath}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No documents on file</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Job Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Types
                </CardTitle>
                <CardDescription>
                  Job types and categories this applicant is interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicant.jobTypes && applicant.jobTypes.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.jobTypes.map((jobType) => (
                      <div key={jobType.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{jobType.jobType.title}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No job types selected</p>
                )}
              </CardContent>
            </Card>

            {/* Applied Positions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Applied Positions
                </CardTitle>
                <CardDescription>
                  Positions this applicant has applied for
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicant.positions.length > 0 ? (
                  <div className="space-y-4">
                    {applicant.positions.map((application) => (
                      <div key={application.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{application.position.title}</h3>
                          <Badge 
                            variant={application.status === 'ACCEPTED' ? 'default' : 
                                   application.status === 'REJECTED' ? 'destructive' : 'secondary'}
                          >
                            {application.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {application.position.company.title} • {application.position.company.city}, {application.position.company.country}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          Applied: {(() => {
                            try {
                              const date = new Date(application.appliedAt)
                              return date.getTime() > 0 ? date.toLocaleDateString() : 'Unknown Date'
                            } catch {
                              return 'Unknown Date'
                            }
                          })()}
                        </p>
                        <p className="text-sm text-gray-700">
                          {application.position.jobDescription}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No applications on file</p>
                )}
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicant.socialMedia.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.socialMedia.map((social) => (
                      <div key={social.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{social.provider}</p>
                        <p className="text-sm text-gray-600">{social.sessionId}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No social media profiles on file</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
