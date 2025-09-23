'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Briefcase } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface JobFormData {
  title: string
  jobDescription: string
  status: 'ACTIVE' | 'INACTIVE'
}

export default function CreateJobPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    jobDescription: '',
    status: 'ACTIVE'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Job title is required',
        variant: 'destructive',
      })
      return
    }

    if (!formData.jobDescription.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Job description is required',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Job created successfully!',
        })
        router.push('/dashboard/companies')
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to create job',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
            <p className="text-muted-foreground">Post a new position to attract qualified candidates</p>
          </div>
        </div>
      </div>

      {/* Create Job Form */}
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Fill in the information below to create your job posting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Job Title *
              </label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g. Senior Software Engineer, Marketing Manager..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Be specific and descriptive to attract the right candidates
              </p>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label htmlFor="jobDescription" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Job Description *
              </label>
              <textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                placeholder="Describe the role, responsibilities, requirements, qualifications, and what you offer..."
                required
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Include responsibilities, requirements, qualifications, and benefits. Be detailed to set clear expectations.
              </p>
            </div>

            {/* Job Status */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Initial Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ACTIVE">Active - Start accepting applications immediately</option>
                <option value="INACTIVE">Inactive - Create as draft for later activation</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Active jobs will be visible to candidates and accept applications
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Creating Job...' : 'Create Job Posting'}
              </Button>
              <Button asChild variant="outline" disabled={isLoading}>
                <Link href="/dashboard/companies">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips for Great Job Postings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-sm">Be Specific</h4>
              <p className="text-xs text-muted-foreground">Use clear, specific job titles and detailed descriptions</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Include Requirements</h4>
              <p className="text-xs text-muted-foreground">List required skills, experience, and qualifications</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Highlight Benefits</h4>
              <p className="text-xs text-muted-foreground">Mention salary range, benefits, and growth opportunities</p>
            </div>
            <div>
              <h4 className="font-medium text-sm">Set Expectations</h4>
              <p className="text-xs text-muted-foreground">Describe work environment, schedule, and responsibilities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
