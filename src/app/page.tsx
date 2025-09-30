"use client";
import MainNavigation from "@/components/MainNavigation";
import { useUserCompany } from "@/hooks/use-companies";
import { createSecureId } from "@/lib/hash";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { data: company, isLoading, error } = useUserCompany();

  useEffect(() => {
    if (company?.id) {
      // Create hashed ID for the company and redirect
      const hashedId = createSecureId(company.id);
      router.replace(`/dashboard/companies/${hashedId}`);
    } else {
      router.push(`/auth/login`);
    }
  }, [company, router]);
  return <MainNavigation />;
}
