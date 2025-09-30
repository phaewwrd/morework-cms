"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Users,
  Eye,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Loader2,
  XCircle,
} from "lucide-react";
import { useCompanyApplicants, useUserCompany } from "@/hooks/use-companies";
import { usePositions } from "@/hooks/use-positions";
import { useUpdateApplicationStatus } from "@/hooks/use-applications";
import CompanyTopNavigation from "@/components/CompanyTopNavigation";

interface Applicant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experience: number;
  expectedSalary: number | null;
  applications: Array<{
    id: number;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    appliedAt: string;
    position: {
      id: number;
      title: string;
    };
  }>;
}

export default function AllApplicantsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const searchParams = useSearchParams();
  const params = useParams();
  const hashedCompanyId = params.id as string;
  const {
    data: applicantsResponse,
    isLoading: applicantsLoading,
    error: applicantsError,
    refetch: refetchApplicants,
  } = useCompanyApplicants();
  const { data: companyData } = useUserCompany();
  const { data: positionsResponse, isLoading: positionsLoading } =
    usePositions();
  const updateApplicationMutation = useUpdateApplicationStatus();

  useEffect(() => {
    const positionId = searchParams.get("position");
    if (positionId) {
      setJobFilter(positionId);
    }
  }, [searchParams]);

  const filteredApplicants = useMemo(() => {
    if (!applicantsResponse?.data) return [];

    return applicantsResponse.data.filter((applicant: Applicant) => {
      const matchesSearch =
        applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "" ||
        statusFilter === "ALL" ||
        applicant.applications.some((app) => app.status === statusFilter);

      const matchesJob =
        jobFilter === "" ||
        jobFilter === "ALL" ||
        applicant.applications.some(
          (app) => app.position.id.toString() === jobFilter
        );

      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [applicantsResponse?.data, searchTerm, statusFilter, jobFilter]);

  const updateApplicationStatus = (
    applicationId: number,
    newStatus: "ACCEPTED" | "REJECTED" | "PENDING"
  ) => {
    updateApplicationMutation.mutate(
      {
        id: applicationId,
        status: newStatus,
      },
      {
        onSuccess: () => {
          // Refetch applicants to get updated data
          refetchApplicants();
        },
      }
    );
  };

  // Handle loading state
  if (applicantsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading applicants...</span>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (applicantsError) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load applicants
            </h3>
            <p className="text-muted-foreground mb-4">
              {applicantsError instanceof Error
                ? applicantsError.message
                : "An unexpected error occurred"}
            </p>
            <Button onClick={() => refetchApplicants()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <CompanyTopNavigation company={companyData} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/companies/${hashedCompanyId}` as any}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {jobFilter && positionsResponse?.data
                ? `Applicants for ${
                    positionsResponse.data.find(
                      (p: any) => p.id.toString() === jobFilter
                    )?.title || "Position"
                  }`
                : "All Applicants"}
            </h1>
            <p className="text-muted-foreground">
              {jobFilter
                ? "Review and manage applications for this specific position"
                : "Review and manage all applications to your job postings"}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <div className="flex justify-end">
            {jobFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setJobFilter("")}
              >
                Clear Position Filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                Search Applicants
              </label>
              <Input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Application Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Job</label>
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Jobs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Jobs</SelectItem>
                  {positionsResponse?.data?.map((position: any) => (
                    <SelectItem
                      key={position.id}
                      value={position.id.toString()}
                    >
                      {position.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicants List */}
      <Card>
        <CardHeader>
          <CardTitle>Applicants ({filteredApplicants.length})</CardTitle>
          <CardDescription>
            Manage all applicants across your job postings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplicants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                No applicants found
              </h3>
              <p className="text-muted-foreground">
                {!applicantsResponse?.data?.length
                  ? "No applications have been received yet."
                  : "No applicants match your current filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplicants.map((applicant: Applicant) => (
                <div key={applicant.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {applicant.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {applicant.phone}
                        </span>
                      </div>
                      {applicant.expectedSalary && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Expected Salary: $
                          {applicant.expectedSalary.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={
                          `/dashboard/companies/${hashedCompanyId}/applicants/${applicant.id}` as any
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Link>
                    </Button>
                  </div>

                  {/* Applications */}
                  <div className="space-y-3">
                    <h4 className="font-medium">
                      Applications ({applicant.applications.length})
                    </h4>
                    {applicant.applications.map((application) => (
                      <div
                        key={application.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {application.position.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Applied:{" "}
                            {new Date(
                              application.appliedAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              application.status === "ACCEPTED"
                                ? "default"
                                : application.status === "PENDING"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {application.status}
                          </Badge>
                          <div className="flex gap-1">
                            {application.status !== "ACCEPTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-50 h-8 px-2"
                                onClick={() =>
                                  updateApplicationStatus(
                                    application.id,
                                    "ACCEPTED"
                                  )
                                }
                                disabled={updateApplicationMutation.isPending}
                              >
                                {updateApplicationMutation.isPending
                                  ? "Updating..."
                                  : "Accept"}
                              </Button>
                            )}
                            {application.status !== "REJECTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50 h-8 px-2"
                                onClick={() =>
                                  updateApplicationStatus(
                                    application.id,
                                    "REJECTED"
                                  )
                                }
                                disabled={updateApplicationMutation.isPending}
                              >
                                {updateApplicationMutation.isPending
                                  ? "Updating..."
                                  : "Reject"}
                              </Button>
                            )}
                            {application.status === "REJECTED" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 hover:bg-blue-50 h-8 px-2"
                                onClick={() =>
                                  updateApplicationStatus(
                                    application.id,
                                    "PENDING"
                                  )
                                }
                                disabled={updateApplicationMutation.isPending}
                              >
                                {updateApplicationMutation.isPending
                                  ? "Updating..."
                                  : "Reconsider"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
