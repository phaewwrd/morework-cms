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
import { toast } from "@/hooks/use-toast";
import AdminNavbar from "@/components/AdminNavbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPosition, setUpdatingPosition] = useState<number>();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      const data = await response.json();

      if (data.success) {
        setCompanies(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch companies",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePositionStatus = async (
    positionId: number,
    newStatus: "ACTIVE" | "CLOSED" | "PENDING"
  ) => {
    try {
      setUpdatingPosition(positionId);

      const response = await fetch(`/api/positions/${positionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the companies state
        setCompanies((prev) =>
          prev.map((company) => ({
            ...company,
            positions: company.positions.map((position) =>
              position.id === positionId
                ? { ...position, status: newStatus }
                : position
            ),
          }))
        );

        toast({
          title: "Success",
          description: "Position status updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update position status",
        variant: "destructive",
      });
    } finally {
      setUpdatingPosition(undefined);
    }
  };

  // Get all pending positions across all companies
  const pendingPositions = companies.flatMap((company) =>
    company.positions
      .filter((pos) => pos.status === "PENDING")
      .map((pos) => ({
        ...pos,
        company: { id: company.id, title: company.title },
      }))
  );

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
                {pendingPositions.map((position) => (
                  <div
                    key={position.id}
                    className="border rounded-lg p-4 bg-yellow-50 border-yellow-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          {position.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {position.company.title}
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
                    {position.applicantPositions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-yellow-200">
                        <p className="text-sm text-gray-600">
                          {position.applicantPositions.length} applicant
                          {position.applicantPositions.length > 1
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
