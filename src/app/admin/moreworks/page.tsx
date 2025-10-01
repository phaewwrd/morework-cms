"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useApplicants } from "@/hooks/use-applicants";
import { Applicant } from "@/types";
import { Filter, FilterX } from "lucide-react";

interface ApplicantStats {
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
}

// Interface for the transformed position data from API
interface TransformedApplicantPosition {
  id: number;
  title: string;
  status: string; // Position status (ACTIVE, CLOSED, PENDING)
  applicationStatus: "PENDING" | "ACCEPTED" | "REJECTED"; // Application status
  company: {
    title: string;
  };
}

// Extended Applicant interface with transformed positions
interface ExtendedApplicant extends Omit<Applicant, "positions"> {
  positions?: TransformedApplicantPosition[];
}

export default function MoreWorksPage() {
  const router = useRouter();
  const { data: applicantsResponse, isLoading, error } = useApplicants();
  const applicants = (applicantsResponse?.data || []) as ExtendedApplicant[];
  const [stats, setStats] = useState<ApplicantStats>({
    total: 0,
    accepted: 0,
    pending: 0,
    rejected: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showOnlyWithPositions, setShowOnlyWithPositions] = useState(false);

  useEffect(() => {
    if (applicants.length > 0) {
      calculateStats(applicants);
    }
  }, [applicants]);

  console.log(applicants);
  const calculateStats = (applicantData: ExtendedApplicant[]) => {
    const stats = { total: 0, accepted: 0, pending: 0, rejected: 0 };

    applicantData.forEach((applicant) => {
      if (applicant.positions && applicant.positions.length > 0) {
        applicant.positions.forEach((position) => {
          stats.total += 1;
          switch (position.applicationStatus) {
            case "ACCEPTED":
              stats.accepted += 1;
              break;
            case "PENDING":
              stats.pending += 1;
              break;
            case "REJECTED":
              stats.rejected += 1;
              break;
          }
        });
      }
    });

    setStats(stats);
  };

  const filteredApplicants = applicants.filter(
    (applicant: ExtendedApplicant) => {
      const matchesSearch =
        applicant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGender =
        genderFilter === "ALL" || applicant.gender === genderFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (applicant.positions &&
          applicant.positions.some(
            (position) => position.applicationStatus === statusFilter
          ));

      const hasPositions = showOnlyWithPositions
        ? applicant.positions && applicant.positions.length > 0
        : true;

      return matchesSearch && matchesGender && matchesStatus && hasPositions;
    }
  );

  const handleViewApplicant = (applicantId: number) => {
    router.push(`/admin/moreworks/applicant/${applicantId}` as any);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading applicants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            MoreWorks Dashboard
          </h1>
          <p className="text-muted-foreground">Manage workers and applicants</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applicants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.accepted}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button
                variant={showOnlyWithPositions ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyWithPositions(!showOnlyWithPositions)}
                className="flex items-center gap-2"
              >
                {showOnlyWithPositions ? (
                  <>
                    <FilterX className="h-4 w-4" />
                    Show All Workers
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4" />
                    Only With Applications
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search by Name
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Search applicants..."
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Filter by Gender
                </label>
                <select
                  id="gender"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ALL">All Genders</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Filter by Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applicants List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Workers ({filteredApplicants.length})
              {showOnlyWithPositions && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - With Applications Only
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Manage applicant applications and statuses
              {showOnlyWithPositions &&
                ` • Showing applicants with job applications only`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredApplicants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No applicants found matching your criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplicants.map((applicant: ExtendedApplicant) => (
                  <div
                    key={applicant.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Email: {applicant.email}</p>
                        <p>Phone: {applicant.phone}</p>
                        <p>Gender: {applicant.gender}</p>
                        {applicant.positions &&
                          applicant.positions.length > 0 && (
                            <div>
                              <p className="font-medium text-foreground mb-1">
                                Applied Positions:
                              </p>
                              <div className="space-y-1">
                                {applicant.positions?.map(
                                  (
                                    applicantPosition: TransformedApplicantPosition
                                  ) => (
                                    <div
                                      key={applicantPosition.id}
                                      className="flex items-center gap-2 flex-wrap"
                                    >
                                      <span className="text-xs">
                                        {applicantPosition.title}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        at {applicantPosition.company?.title}
                                      </span>
                                      <Badge
                                        variant={
                                          applicantPosition.applicationStatus ===
                                          "ACCEPTED"
                                            ? "default"
                                            : applicantPosition.applicationStatus ===
                                              "PENDING"
                                            ? "secondary"
                                            : "destructive"
                                        }
                                        className={
                                          applicantPosition.applicationStatus ===
                                          "ACCEPTED"
                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                            : applicantPosition.applicationStatus ===
                                              "PENDING"
                                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                            : "bg-red-100 text-red-800 hover:bg-red-100"
                                        }
                                      >
                                        {applicantPosition.applicationStatus}
                                      </Badge>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={() => handleViewApplicant(applicant.id)}
                        >
                          View Details
                        </Button>
                      </div>
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
