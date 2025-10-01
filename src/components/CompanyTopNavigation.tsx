"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Briefcase, LogOut, Phone, MapPinHouse } from "lucide-react";

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

export default function CompanyTopNavigation({
  company,
}: CompanyTopNavigationProps) {
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
    <div className="border-b bg-gradient-to-r from-slate-50 to-slate-150 flex justify-center">
      <div className="flex w-6/12 justify-between p-6">
        <div className=" grid grid-cols-3 gap-20 ">
          {/* Company Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2.5 bg-primary/90 rounded-xl shadow-sm">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-semibold text-base text-gray-900 truncate">
                {company?.title || "Company"}
              </h1>
              <p className="text-xs text-gray-500 font-medium">Dashboard</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex items-center gap-3 flex-1 pl-6 border-l border-gray-200">
            <div className="p-2.5 bg-primary/90 rounded-xl shadow-sm">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-sm text-gray-900 mb-0.5">
                ข้อมูลผู้ติดต่อ
              </h2>
              <p className="text-xs text-gray-600 truncate">
                {company?.contactName || "-"}
              </p>
              <p className="text-xs text-gray-500">
                {company?.contactPhone || "-"}
              </p>
            </div>
          </div>

          {/* Address Info */}
          <div className="flex items-center gap-3 flex-1 pl-6 border-l border-gray-200">
            <div className="p-2.5 bg-primary/90 rounded-xl shadow-sm">
              <MapPinHouse className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-sm text-gray-900 mb-0.5">
                ที่อยู่
              </h2>
              <p className="text-xs text-gray-600 line-clamp-2">
                {company?.address || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="flex items-center gap-2 ml-6 border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors shadow-sm flex-shrink-0"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
