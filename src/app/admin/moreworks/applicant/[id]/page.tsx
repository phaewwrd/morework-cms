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
  const [editingSections, setEditingSections] = useState({
    addresses: false,
    educations: false,
    workExperiences: false,
    trainings: false,
    documents: false,
    jobTypes: false
  })
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
        birthDate: applicant.birthDate,
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
      await updateApplicantMutation.mutateAsync({
        id: applicantId,
        data: formData
      })
      toast({
        title: "Success",
        description: "Applicant information updated successfully",
      })
      setIsEditing(false)
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
        birthDate: applicant.birthDate,
        startWorkingDate: applicant.startWorkingDate,
        prefferedLocation: applicant.prefferedLocation,
      })
    }
    setIsEditing(false)
  }

  const toggleSectionEdit = (section: keyof typeof editingSections) => {
    setEditingSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSectionSave = async (section: keyof typeof editingSections) => {
    try {
      if (section === 'jobTypes') {
        // Handle job types update specifically
        await updateJobTypesMutation.mutateAsync({
          applicantId: applicantId,
          jobTypeIds: selectedJobTypes
        })
      }
      // For other sections, just toggle off edit mode for now
      // TODO: Implement actual save functionality for other sections
      
      setEditingSections(prev => ({ ...prev, [section]: false }))
      toast({
        title: "Success",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update ${section}`,
        variant: "destructive",
      })
    }
  }

  const handleSectionCancel = (section: keyof typeof editingSections) => {
    // Reset any changes and exit edit mode
    if (section === 'jobTypes' && applicant) {
      setSelectedJobTypes(applicant.jobTypes?.map(jt => jt.jobType.id) || [])
    }
    setEditingSections(prev => ({ ...prev, [section]: false }))
  }

  const formatDateForInput = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.getTime() > 0 ? date.toISOString().split('T')[0] : '1970-01-01'
    } catch {
      return '1970-01-01'
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
                    disabled={updateApplicantMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateApplicantMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline"
                    disabled={updateApplicantMutation.isPending}
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
                {isEditing ? formData.firstName || '' : applicant.firstName} {isEditing ? formData.lastName || '' : applicant.lastName}
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
                        value={formData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{applicant.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    {isEditing ? (
                      <Input
                        value={formData.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{applicant.lastName}</p>
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

                <div className="grid grid-cols-3 gap-4">
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
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                        placeholder="Enter age"
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{applicant.age}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Birth Date</label>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={formatDateForInput(formData.birthDate || '')}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 text-sm">{formatDateForInput(applicant.birthDate)}</p>
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
                      <p className="mt-1 text-sm">{formatDateForInput(applicant.startWorkingDate)}</p>
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

            {/* Addresses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Addresses
                  </CardTitle>
                  <div className="flex gap-2">
                    {editingSections.addresses ? (
                      <>
                        <Button size="sm" onClick={() => handleSectionSave('addresses')}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSectionCancel('addresses')}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => toggleSectionEdit('addresses')}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {applicant.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.addresses.map((address, index) => (
                      <div key={address.id} className="p-3 border rounded-lg">
                        {editingSections.addresses ? (
                          <div className="space-y-3">
                            <Input
                              placeholder="Address"
                              defaultValue={address.address}
                              className="mb-2"
                            />
                            <div className="text-sm text-gray-600">
                              <Input
                                placeholder="District"
                                defaultValue={address.district.title}
                                className="mb-2"
                              />
                              <Input
                                placeholder="Province"
                                defaultValue={address.district.province.title}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-medium">{address.address}</p>
                            <p className="text-sm text-gray-600">
                              {address.district.title}, {address.district.province.title}
                            </p>
                          </>
                        )}
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                  <div className="flex gap-2">
                    {editingSections.educations ? (
                      <>
                        <Button size="sm" onClick={() => handleSectionSave('educations')}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSectionCancel('educations')}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => toggleSectionEdit('educations')}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {applicant.educations.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.educations.map((education) => (
                      <div key={education.id} className="p-3 border rounded-lg">
                        {editingSections.educations ? (
                          <div className="space-y-3">
                            <Input
                              placeholder="Field of Study"
                              defaultValue={education.field}
                              className="mb-2"
                            />
                            <Input
                              placeholder="Institution"
                              defaultValue={education.institution}
                              className="mb-2"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Graduation Year"
                                type="number"
                                defaultValue={education.graduationYear}
                              />
                              <Input
                                placeholder="GPA"
                                type="number"
                                step="0.01"
                                defaultValue={education.gpa}
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-medium">{education.field}</p>
                            <p className="text-sm text-gray-600">{education.institution}</p>
                            <p className="text-sm text-gray-600">
                              {education.educationLevel.title} • Graduated {education.graduationYear} • GPA: {education.gpa}
                            </p>
                          </>
                        )}
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </CardTitle>
                  <div className="flex gap-2">
                    {editingSections.workExperiences ? (
                      <>
                        <Button size="sm" onClick={() => handleSectionSave('workExperiences')}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSectionCancel('workExperiences')}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => toggleSectionEdit('workExperiences')}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {applicant.workExperiences.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.workExperiences.map((experience) => (
                      <div key={experience.id} className="p-3 border rounded-lg">
                        {editingSections.workExperiences ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Input
                                placeholder="Position"
                                defaultValue={experience.position}
                                className="flex-1 mr-2"
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  defaultChecked={experience.currentPosition}
                                  className="mr-1"
                                />
                                <span className="text-sm">Current</span>
                              </div>
                            </div>
                            <Input
                              placeholder="Company"
                              defaultValue={experience.company}
                              className="mb-2"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="Start Date"
                                type="date"
                                defaultValue={experience.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : ''}
                              />
                              <Input
                                placeholder="End Date"
                                type="date"
                                defaultValue={experience.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : ''}
                                disabled={experience.currentPosition}
                              />
                            </div>
                            <textarea
                              placeholder="Description"
                              defaultValue={experience.description}
                              className="w-full p-2 border rounded-md resize-none"
                              rows={3}
                            />
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Trainings
                  </CardTitle>
                  <div className="flex gap-2">
                    {editingSections.trainings ? (
                      <>
                        <Button size="sm" onClick={() => handleSectionSave('trainings')}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSectionCancel('trainings')}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => toggleSectionEdit('trainings')}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {applicant.trainings.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.trainings.map((training) => (
                      <div key={training.id} className="p-3 border rounded-lg">
                        {editingSections.trainings ? (
                          <div className="space-y-3">
                            <Input
                              placeholder="Training Title"
                              defaultValue={training.title}
                              className="mb-2"
                            />
                            <Input
                              placeholder="Training Year"
                              type="number"
                              defaultValue={training.trainingYear}
                              className="mb-2"
                            />
                            <textarea
                              placeholder="Description"
                              defaultValue={training.description}
                              className="w-full p-2 border rounded-md resize-none"
                              rows={3}
                            />
                          </div>
                        ) : (
                          <>
                            <p className="font-medium">{training.title}</p>
                            <p className="text-sm text-gray-600">Year: {training.trainingYear}</p>
                            <p className="text-sm mt-2">{training.description}</p>
                          </>
                        )}
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                  <div className="flex gap-2">
                    {editingSections.documents ? (
                      <>
                        <Button size="sm" onClick={() => handleSectionSave('documents')}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSectionCancel('documents')}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => toggleSectionEdit('documents')}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {applicant.documents.length > 0 ? (
                  <div className="space-y-3">
                    {applicant.documents.map((document) => (
                      <div key={document.id} className="p-3 border rounded-lg">
                        {editingSections.documents ? (
                          <div className="space-y-3">
                            <Input
                              placeholder="Description"
                              defaultValue={document.description}
                              className="mb-2"
                            />
                            <Select defaultValue={document.documentType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Document Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="RESUME">Resume</SelectItem>
                                <SelectItem value="COVER_LETTER">Cover Letter</SelectItem>
                                <SelectItem value="TRANSCRIPT">Transcript</SelectItem>
                                <SelectItem value="PORTFOLIO">Portfolio</SelectItem>
                                <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="File Path"
                              defaultValue={document.filePath}
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{document.description}</p>
                              <Badge variant="outline">{document.documentType}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{document.filePath}</p>
                          </>
                        )}
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Types
                  </CardTitle>
                  <div className="flex gap-2">
                    {editingSections.jobTypes ? (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => handleSectionSave('jobTypes')}
                          disabled={updateJobTypesMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {updateJobTypesMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleSectionCancel('jobTypes')}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => toggleSectionEdit('jobTypes')}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>
                  Job types and categories this applicant is interested in
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editingSections.jobTypes ? (
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
