'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Briefcase, Loader2 } from 'lucide-react'
import { useCreatePosition } from '@/hooks/use-positions'

interface JobFormData {
  title: string
  jobDescription: string
  status: 'ACTIVE' | 'PENDING'
}

export default function CreateJobPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    jobDescription: '',
    status: 'ACTIVE'
  })

  const createPositionMutation = useCreatePosition()

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      return
    }

    if (!formData.jobDescription.trim()) {
      return
    }

    createPositionMutation.mutate(formData, {
      onSuccess: () => {
        // Navigate back to dashboard after successful creation
        router.push('/dashboard/companies')
      }
    })
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={"/dashboard/companies" as any}>
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
            <p className="text-muted-foreground">Add a new position to attract candidates</p>
          </div>
        </div>
      </div>

      {/* Centered Form */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Provide information about the position you want to post
            </CardDescription>
          </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Job Title *
                  </label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Job Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.jobDescription}
                    onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                    placeholder="Describe the role, responsibilities, requirements, and benefits..."
                    className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'ACTIVE' | 'PENDING') => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active - Start accepting applications</SelectItem>
                      <SelectItem value="PENDING">Draft - Save for later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={createPositionMutation.isPending}
                    className="flex-1"
                  >
                    {createPositionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Job...
                      </>
                    ) : (
                      'Create Job Position'
                    )}
                  </Button>
                  <Button asChild type="button" variant="outline">
                    <Link href={"/dashboard/companies" as any}>
                      Cancel
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}
