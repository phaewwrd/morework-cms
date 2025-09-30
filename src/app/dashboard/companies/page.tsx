"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useUserCompany } from "@/hooks/use-companies";
import { createSecureId } from "@/lib/hash";

export default function CompaniesPage() {
  const router = useRouter();
  const { data: company, isLoading, error } = useUserCompany();

  useEffect(() => {
    if (company?.id) {
      // Create hashed ID for the company and redirect
      const hashedId = createSecureId(company.id);
      router.replace(`/dashboard/companies/${hashedId}`);
    }
  }, [company, router]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">
          Loading your company dashboard...
        </p>
      </div>
    </div>
  );
}
