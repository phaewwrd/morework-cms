'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'MoreWorks Dashboard',
    href: '/moreworks',
    description: 'Worker & Applicant Management'
  },
  {
    name: 'Company Dashboard',
    href: '/companies',
    description: 'Company & Position Management'
  },
  {
    name: 'API Health',
    href: '/api/health',
    description: 'Check API Status'
  }
]

export default function MainNavigation() {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            MoreWork Management System
          </h1>
          <p className="text-xl text-slate-300">
            Comprehensive platform for managing workers, applicants, companies, and job positions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {navigation.map((item) => (
            <Card key={item.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {item.name}
                </CardTitle>
                <CardDescription>
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={item.href}>
                    Access Module
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>System Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">MoreWorks Module:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Applicant statistics dashboard</li>
                    <li>• Filter by gender & status</li>
                    <li>• Search applicants by name</li>
                    <li>• Detailed applicant profiles</li>
                    <li>• Editable applicant information</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Company Module:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Company & position statistics</li>
                    <li>• Job creation & management</li>
                    <li>• Application status tracking</li>
                    <li>• Applicant filtering & search</li>
                    <li>• Application status updates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/auth/register">Register Account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
