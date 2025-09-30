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
import AdminNavbar from "@/components/AdminNavbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCompanies } from "@/hooks/use-companies";
import { usePositions, useUpdatePositionStatus } from "@/hooks/use-positions";
import { Position } from "@prisma/client";
import { useMoreWorkPositions } from "@/hooks/use-morework";

interface Company {
  id: number;
  title: string;
  address: string;
  city: string;
  country: string;
  email: string;
  contactName: string;
  contactPhone: string;
  userId: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  positions: Array<{
    id: number;
    title: string;
    status: "ACTIVE" | "CLOSED" | "PENDING";
    applicantPositions: Array<{
      id: number;
      status: "PENDING" | "ACCEPTED" | "REJECTED";
      appliedAt: string;
      applicant: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
      };
    }>;
  }>;
}

export default function PendingPositionsPage() {
  const { data: companiesResponse, isLoading, error } = useCompanies();
  const {
    data: positionsData,
    isLoading: positionsLoading,
    error: positionsError,
  } = useMoreWorkPositions();
  const positions = positionsData?.data || [];
  const companies = companiesResponse?.data || [];
  const [loading, setLoading] = useState(true);
  const updateApplicantMutation = useUpdatePositionStatus();

  const [updatingPosition, setUpdatingPosition] = useState<number>();

  const updatePositionStatus = async (
    positionId: number,
    newStatus: "ACTIVE" | "CLOSED" | "PENDING"
  ) => {
    setUpdatingPosition(positionId);

    updateApplicantMutation.mutate({
      id: positionId,
      status: newStatus,
    });
  };

  // Get all pending positions across all companies
  const pendingPositions = positions.flatMap((position: Position) =>
    position.status === "PENDING"
      ? [{ ...position, company: { id: position.id, title: position.title } }]
      : []
  );

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading pending positions...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/companies">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Pending Positions
          </h1>
          <p className="text-muted-foreground">
            Manage positions awaiting approval
          </p>
        </div>

        {/* Pending Positions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Positions
              <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                {pendingPositions.length}
              </div>
            </CardTitle>
            <CardDescription>
              Positions awaiting approval - click Approve to activate or Deny to
              close
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingPositions.length > 0 ? (
              <div className="space-y-4">
                {pendingPositions.map((position: Position) => (
                  <div
                    key={position.id}
                    className="border rounded-lg p-4 bg-yellow-50 border-yellow-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          {position.title}
                        </h4>
                        <p className="font-semibold text-md">
                          {
                            companies.find(
                              (c: Company) => c.id === position.companyId
                            )?.title
                          }
                        </p>

                        <p className="text-sm text-muted-foreground mb-2">
                          {position.jobDescription}
                        </p>

                        <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium inline-block">
                          PENDING APPROVAL
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() =>
                            updatePositionStatus(position.id, "ACTIVE")
                          }
                          disabled={updatingPosition === position.id}
                        >
                          {updatingPosition === position.id
                            ? "..."
                            : "✓ Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            updatePositionStatus(position.id, "CLOSED")
                          }
                          disabled={updatingPosition === position.id}
                        >
                          {updatingPosition === position.id ? "..." : "✗ Deny"}
                        </Button>
                      </div>
                    </div>
                    {position?.applicantPositions?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-yellow-200">
                        <p className="text-sm text-gray-600">
                          {position?.applicantPositions?.length} applicant
                          {position?.applicantPositions?.length > 1
                            ? "s"
                            : ""}{" "}
                          waiting
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Empty state with nice message */}
                <div className="text-center py-12">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">✓</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    No pending positions at the moment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    New positions will appear here when they need approval
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
