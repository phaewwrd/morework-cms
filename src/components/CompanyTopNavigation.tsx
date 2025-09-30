"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  LogOut,
  Phone,
  MapPinHouse,
} from "lucide-react";

interface Company {
  id: number;
  title: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
}

interface CompanyTopNavigationProps {
  company?: Company;
}

export default function CompanyTopNavigation({ company }: CompanyTopNavigationProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/auth/login");
      } else {
        console.error("Failed to sign out");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex items-center justify-between mb-6 p-4 border-b">
      <div className="flex items-center gap-4 w-full">
        <div className="flex items-center gap-2 w-full">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">
              {company?.title || "Company"}
            </h1>
            <p className="text-sm text-muted-foreground">Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">เบอร์ติดต่อ</h1>
            <p className="text-sm text-muted-foreground">
              {company?.contactName} {company?.contactPhone}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPinHouse className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">ที่อยู่</h1>
            <p className="text-sm text-muted-foreground">
              {company?.address || "-"}
            </p>
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={handleSignOut}
        className="flex items-center gap-2"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
