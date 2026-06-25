"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import { Sidebar } from "../../components/layout/sidebar";
import { Topbar } from "../../components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const activePortal = useAuthStore((state) => state.activePortal);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!token) {
        router.push("/login");
      } else if (!activePortal) {
        router.push("/portals");
      } else {
        fetchMe();
      }
    }
  }, [mounted, token, activePortal, router, fetchMe]);

  // Prevent hydration mismatch and hide content while checking auth
  if (!mounted || !token || !activePortal) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
