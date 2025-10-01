"use client";

import { ReactNode } from "react";
import CompanyTopNavigation from "@/components/CompanyTopNavigation";
import { useUserCompany } from "@/hooks/use-companies";

interface CompanyLayoutProps {
  children: ReactNode;
}

export default function CompanyLayout({ children }: CompanyLayoutProps) {
  // Fetch user's company for the navigation
  const { data: userCompany } = useUserCompany();

  return (
    <div className="min-h-screen bg-gray-50">
      <CompanyTopNavigation company={userCompany} />
      <main>{children}</main>
    </div>
  );
}
