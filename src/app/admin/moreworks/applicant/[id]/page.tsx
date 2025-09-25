'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
import { useJobTypes, useUpdateApplicantJobTypes } from '@/hooks/use-job-types'

export default function ApplicantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicantId = params.id as string

  const { data: applicant, isLoading, error } = useApplicantDetail(applicantId)
  const updateApplicantMutation = useUpdateApplicant()
  const { data: allJobTypes, isLoading: jobTypesLoading } = useJobTypes()
  const updateJobTypesMutation = useUpdateApplicantJobTypes()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<ApplicantDetail>>({})
  const [selectedJobTypes, setSelectedJobTypes] = useState<number[]>([])

  // Initialize form data when applicant data loads
  useEffect(() => {
    if (applicant) {
      setFormData({
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        phone: applicant.phone,
        gender: applicant.gender,
        age: applicant.age,
        startWorkingDate: applicant.startWorkingDate,
        prefferedLocation: applicant.prefferedLocation,
      })
      // Initialize selected job types
      setSelectedJobTypes(applicant.jobTypes?.map(jt => jt.jobType.id) || [])
    }
  }, [applicant])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }


const handleSave = async () => {
    try {
      // Prepare data in the format expected by the API
      const apiData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        age: formData.age,
        StartWorkingDate: formData.startWorkingDate,
        prefferedLocation: formData.prefferedLocation,
        preferred_job_type: selectedJobTypes
      }

      // Update applicant information using the existing API
      const response = await fetch(`/api/applicants/${applicantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        throw new Error('Failed to update applicant')
      }

      toast({
        title: "Success",
        description: "Applicant information updated successfully",
      })
      setIsEditing(false)
      
      // Refetch the data to show updated values
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update applicant information",
        variant: "destructive",
      })
    } 
  }


  const handleCancel = () => {
    // Reset form data to original values
    if (applicant) {
      setFormData({
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        phone: applicant.phone,
        gender: applicant.gender,
        age: applicant.age,
        startWorkingDate: applicant.startWorkingDate,
        prefferedLocation: applicant.prefferedLocation,
      })
      setSelectedJobTypes(applicant.jobTypes?.map(jt => jt.jobType.id) || [])
    }
    setIsEditing(false)
  }

  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.getTime() > 0 ? date.toISOString().split('T')[0] : '1970-01-01'
    } catch {
      return '1970-01-01'
    }
  }

const formatDateForDisplay = (dateString: string) => {
  try {
    const date = new Date(dateString)
   return  date.toISOString().split('T')[0] 
  } catch {
    // return 'N/A'
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

  const isUpdating = updateApplicantMutation.isPending || updateJobTypesMutation.isPending

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/moreworks">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workers
              </Link>
            </Button>
            
            {/* Edit/Save/Cancel Buttons */}
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSave} 
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline"
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? formData.first_name || '' : applicant.first_name} {isEditing ? formData.last_name || '' : applicant.last_name}
              </h1>
              <p className="text-gray-600">{isEditing ? formData.email || '' : applicant.email}</p>
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
                    {isEditing ? (
                      <Input
                        value={formData.first_name || ''}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        placeholder="Enter first name"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{applicant.first_name}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    {isEditing ? (
                      <Input
                        value={formData.last_name || ''}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        placeholder="Enter last name"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{applicant.last_name}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{applicant.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{applicant.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    {isEditing ? (
                      <Select
                        value={formData.gender || ''}
                        onValueChange={(value) => handleInputChange('gender', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-sm">{applicant.gender}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Age</label>
                    {isEditing ? (
                      <Input
                      type='number'
                        value={formData.age || ''}
                        onChange={(e) => handleInputChange('age', e.target.value || 0)}
                        placeholder="Enter age"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{applicant.age}</p>
                    )}
                  </div>
                  
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Working Date</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formatDateForInput(formData.startWorkingDate || '')}
                        onChange={(e) => handleInputChange('startWorkingDate', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{formatDateForDisplay(applicant.startWorkingDate)}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preferred Location</label>
                    {isEditing ? (
                      <Input
                        value={formData.prefferedLocation || ''}
                        onChange={(e) => handleInputChange('prefferedLocation', e.target.value)}
                        placeholder="Enter preferred location"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{applicant.prefferedLocation}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Addresses - Read Only */}
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

            {/* Education - Read Only */}
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

            {/* Work Experience - Read Only */}
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
                          {formatDateForDisplay(experience.startDate)} - {
                            experience.endDate ? formatDateForDisplay(experience.endDate) : 'Present'
                          }
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

            {/* Trainings - Read Only */}
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

            {/* Documents - Read Only */}
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
            {/* Job Types - Editable */}
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
                {isEditing ? (
                  <div className="space-y-4">
                    {jobTypesLoading ? (
                      <p className="text-gray-500">Loading job types...</p>
                    ) : (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Select Job Types:</label>
                        <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                          {allJobTypes?.map((jobType) => (
                            <div key={jobType.id} className="flex items-center space-x-2 py-2">
                              <input
                                type="checkbox"
                                id={`jobType-${jobType.id}`}
                                checked={selectedJobTypes.includes(jobType.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedJobTypes(prev => [...prev, jobType.id])
                                  } else {
                                    setSelectedJobTypes(prev => prev.filter(id => id !== jobType.id))
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              />
                              <label 
                                htmlFor={`jobType-${jobType.id}`}
                                className="text-sm font-medium text-gray-700 cursor-pointer"
                              >
                                {jobType.title}
                              </label>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Selected: {selectedJobTypes.length} job type{selectedJobTypes.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
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
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Applied Positions - Read Only */}
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
                          Applied: {formatDateForDisplay(application.appliedAt)}
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

            {/* Social Media - Read Only */}
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