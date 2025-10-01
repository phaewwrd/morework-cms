"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Building, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePositions } from "@/hooks/use-positions";
import { useMoreWorkPositions } from "@/hooks/use-morework";
import { Position } from "@/types";
import { useEffect } from "react";

interface AdminNavbarProps {
  className?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  active: boolean;
  notificationCount?: number;
}

export default function AdminNavbar({ className }: AdminNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Fetch positions to count pending ones
  const { data: positionsResponse } = useMoreWorkPositions();
  const positions = positionsResponse?.data || [];

  // Count pending positions
  // const pendingPositionsCount = positions.filter(
  //   (position: Position) => position.status === "PENDING"
  // ).length;

  const pendingPositionsCount = (positionData: Position[]) => {
    const res = positionData.reduce((acc, position) => {
      if (position.status === "PENDING") {
        acc += 1;
      }
      return acc;
    }, 0);
    return res;
  };

  useEffect(() => {
    if (positions.length > 0) {
      pendingPositionsCount(positions);
    }
  }, [positions]);

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

  const navItems = [
    {
      name: "WORKERS",
      href: "/admin/moreworks",
      icon: Users,
      active: pathname.startsWith("/admin/moreworks"),
    },
    {
      name: "COMPANIES",
      href: "/admin/companies",
      icon: Building,
      active: pathname.startsWith("/admin/companies"),
      notificationCount: pendingPositionsCount(positions),
    },
  ];

  return (
    <nav
      className={cn("bg-white border-b border-gray-200 shadow-sm", className)}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Admin branding and navigation */}
          <div className="flex items-center space-x-8">
            {/* Admin Brand */}
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-600 rounded">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-gray-900">
                MoreWork Back office
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors relative",
                      item.active
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.notificationCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                        {item.notificationCount > 99
                          ? "99+"
                          : item.notificationCount}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Sign out button */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative",
                    item.active
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                  {item.notificationCount && item.notificationCount > 0 && (
                    <div
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]"
                      title={`${item.notificationCount} pending position${
                        item.notificationCount === 1 ? "" : "s"
                      }`}
                    >
                      {item.notificationCount > 99
                        ? "99+"
                        : item.notificationCount}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
