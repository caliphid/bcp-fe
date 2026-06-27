"use client";

import { useAuthStore } from "@/store/auth-store";
import { OrderDashboardView } from "@/features/order-dashboard/components/order-dashboard-view";

export default function OrderDashboardPage() {
  const { user } = useAuthStore();

  const isAuthorized = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  if (!isAuthorized) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">You do not have permission to view the Order Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <OrderDashboardView />
    </div>
  );
}
