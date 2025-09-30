"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useCompanies } from "@/hooks/use-companies";
import { useUpdatePosition } from "@/hooks/use-positions";
import { useQueryClient } from "@tanstack/react-query";
import AdminNavbar from "@/components/AdminNavbar";
import { CircleChevronDown } from "lucide-react";
import { Position, Company } from "@/types";
import Link from "next/link";

interface AdminStats {
  totalCompanies: number;
  totalPositions: number;
  activePositions: number;
  pendingPositions: number;
  closedPositions: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
}

export default function AdminCompaniesPage() {
  const { data: companiesResponse, isLoading, error } = useCompanies();
  const companies = companiesResponse?.data || [];
  const updatePositionMutation = useUpdatePosition();
  const queryClient = useQueryClient();
  const [stats, setStats] = useState<AdminStats>({
    totalCompanies: 0,
    totalPositions: 0,
    activePositions: 0,
    pendingPositions: 0,
    closedPositions: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [positionStatusFilter, setPositionStatusFilter] = useState("");
  const [updatingPosition, setUpdatingPosition] = useState<number>();
  const [openApplicantsFor, setOpenApplicantsFor] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (companies.length > 0) {
      calculateStats(companies);
    }
  }, [companies]);

  const calculateStats = (companiesData: Company[]) => {
    const stats = companiesData.reduce(
      (acc, company) => {
        acc.totalCompanies += 1;

        company.positions?.forEach((position) => {
          acc.totalPositions += 1;
          if (position.status === "ACTIVE") {
            acc.activePositions += 1;
          } else if (position.status === "PENDING") {
            acc.pendingPositions += 1;
          } else if (position.status === "CLOSED") {
            acc.closedPositions += 1;
          }

          position.applicantPositions?.forEach((application) => {
            acc.totalApplications += 1;
            if (application.status === "PENDING") {
              acc.pendingApplications += 1;
            } else if (application.status === "ACCEPTED") {
              acc.acceptedApplications += 1;
            }
          });
        });

        return acc;
      },
      {
        totalCompanies: 0,
        totalPositions: 0,
        activePositions: 0,
        pendingPositions: 0,
        closedPositions: 0,
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
      }
    );
    setStats(stats);
  };

  const filteredCompanies = companies.filter((company: Company) => {
    const matchesSearch =
      company.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());

    // If no position status filter is selected, include all companies
    if (positionStatusFilter === "" || positionStatusFilter === "ALL") {
      return matchesSearch;
    }

    // Check if company has any positions with the selected status
    const hasMatchingPositions = company.positions?.some(
      (position) => position.status === positionStatusFilter
    );

    return matchesSearch && hasMatchingPositions;
  });

  const updatePositionStatus = async (
    positionId: number,
    newStatus: "ACTIVE" | "CLOSED" | "PENDING"
  ) => {
    setUpdatingPosition(positionId);

    updatePositionMutation.mutate(
      {
        id: positionId,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          // Invalidate companies query to refetch data
          queryClient.invalidateQueries({ queryKey: ["companies"] });
          setUpdatingPosition(undefined);
        },
        onError: () => {
          setUpdatingPosition(undefined);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading companies...</div>
        </div>
      </div>
    );
  }

  const moduleApplicants = (positionId: number) => {
    setOpenApplicantsFor((prev) => (prev === positionId ? null : positionId));
  };

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Admin Dashboard - Companies
              </h1>
              <p className="text-muted-foreground">
                Manage all companies, positions and applicants
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/positions/pending">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  Pending Positions ({stats.pendingPositions})
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mb-8">
          <h2 className="text-lg font-bold">COMPANIES</h2>
          <div className="grid grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Companies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              </CardContent>
            </Card>
          </div>
          <h2 className="text-lg font-bold">POSITIONS</h2>
          <div className="grid grid-cols-4 gap-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPositions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.activePositions}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pendingPositions}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Closed Postions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.closedPositions}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Search Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search by Company Name, Contact Name or Email
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Search companies..."
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="positionStatus" className="text-sm font-medium">
                  Filter by Position Status
                </label>
                <Select
                  value={positionStatusFilter}
                  onValueChange={setPositionStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Position Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Position Status</SelectItem>
                    <SelectItem value="ACTIVE">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Active Positions Only
                      </div>
                    </SelectItem>
                    <SelectItem value="PENDING">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Pending Positions Only
                      </div>
                    </SelectItem>
                    <SelectItem value="CLOSED">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Closed Positions Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies List */}
        <Card>
          <CardHeader>
            <CardTitle>All Companies ({filteredCompanies.length})</CardTitle>
            <CardDescription>
              Overview of all registered companies with their positions and
              applications. Use the dropdown to change position status directly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No companies found matching your search criteria.
              </div>
            ) : (
              <div className="space-y-8">
                {filteredCompanies.map((company: Company) => {
                  const totalApplications =
                    company.positions?.reduce(
                      (sum: number, pos: Position) =>
                        sum + (pos.applicantPositions?.length || 0),
                      0
                    ) || 0;
                  const activePositions =
                    company.positions?.filter(
                      (pos: Position) => pos.status === "ACTIVE"
                    ).length || 0;

                  return (
                    <div
                      key={company.id}
                      className="border rounded-lg p-6 space-y-6"
                    >
                      {/* Company Header */}
                      <div className="flex items-start justify-between border-b pb-4">
                        <div className="flex-1">
                          <h2 className="text-xl font-semibold text-blue-900">
                            {company.title}
                          </h2>
                          <div className="text-sm text-muted-foreground mt-2 space-y-1">
                            <p>
                              📍 {company.address}, {company.city},{" "}
                              {company.country}
                            </p>
                            <p>📧 {company.email}</p>
                            <p>
                              👤 {company.contactName} • 📞{" "}
                              {company.contactPhone}
                            </p>
                            <p>🔗 User: {company.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-6 text-center">
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {company?.positions?.length} position
                            {company?.positions?.length !== 1 ? "s" : ""}
                          </div>
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            {activePositions} active
                          </div>
                          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                            {totalApplications} application
                            {totalApplications !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>

                      {/* Positions List */}
                      {(company.positions?.length ?? 0) > 0 ? (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-800">
                              Positions & Applications
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              💡 Use dropdown to change position status
                            </p>
                          </div>
                          <div className="space-y-4">
                            {company?.positions?.map((position) => (
                              <div
                                key={position.id}
                                className="bg-gray-50 rounded-lg p-4"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="grid grid-cols-1">
                                    <h4 className="font-medium">
                                      {position.title}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-x-4">
                                      <div className="flex items-center gap-2 mt-1">
                                        {/* Status Display/Edit - Always show as Select */}
                                        <Select
                                          value={position.status}
                                          onValueChange={(value) =>
                                            updatePositionStatus(
                                              position.id,
                                              value as
                                                | "ACTIVE"
                                                | "CLOSED"
                                                | "PENDING"
                                            )
                                          }
                                          disabled={
                                            updatingPosition === position.id
                                          }
                                        >
                                          <SelectTrigger className="w-36 h-7">
                                            <SelectValue>
                                              <div className="flex items-center gap-2">
                                                <div
                                                  className={`w-2 h-2 rounded-full ${
                                                    position.status === "ACTIVE"
                                                      ? "bg-green-500"
                                                      : position.status ===
                                                        "PENDING"
                                                      ? "bg-yellow-500"
                                                      : "bg-red-500"
                                                  }`}
                                                ></div>
                                                <span className="text-xs font-medium">
                                                  {updatingPosition ===
                                                  position.id
                                                    ? "Updating..."
                                                    : position.status}
                                                </span>
                                              </div>
                                            </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="ACTIVE">
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                Active
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="PENDING">
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                                Pending
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="CLOSED">
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                Closed
                                              </div>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>

                                        {(position?.applicantPositions
                                          ?.length ?? 0) > 0 && (
                                          <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                                            {
                                              position?.applicantPositions
                                                ?.length
                                            }{" "}
                                            applicant
                                            {(position?.applicantPositions
                                              ?.length ?? 0) > 1
                                              ? "s"
                                              : ""}
                                          </div>
                                        )}
                                      </div>

                                      <Button
                                        className="text-xs w-[120px]"
                                        onClick={() =>
                                          moduleApplicants(position.id)
                                        }
                                      >
                                        Show Applicants
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Applications */}
                                {openApplicantsFor === position.id &&
                                  (position?.applicantPositions?.length ?? 0) >
                                    0 && (
                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                      <div className="space-y-2">
                                        {position?.applicantPositions?.map(
                                          (application) => (
                                            <div
                                              key={application.id}
                                              className="flex items-center justify-between p-2 bg-white rounded border"
                                            >
                                              <div>
                                                <p className="font-medium text-sm">
                                                  {
                                                    application?.applicant
                                                      ?.firstName
                                                  }{" "}
                                                  {
                                                    application?.applicant
                                                      ?.lastName
                                                  }
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                  {
                                                    application?.applicant
                                                      ?.email
                                                  }{" "}
                                                  • Applied:{" "}
                                                  {new Date(
                                                    application.appliedAt
                                                  ).toLocaleDateString()}
                                                </p>
                                              </div>
                                              <div
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                  application.status ===
                                                  "ACCEPTED"
                                                    ? "bg-green-100 text-green-800"
                                                    : application.status ===
                                                      "PENDING"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                              >
                                                {application.status}
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No positions created yet
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
