"use client";

import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Briefcase, ShoppingCart, ArrowRight } from "lucide-react";

export default function PortalsPage() {
  const router = useRouter();
  const { user, setActivePortal } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleSelectPortal = (portal: 'FINANCE' | 'OMS') => {
    setActivePortal(portal);
    if (portal === 'OMS') {
      router.push("/dashboard/order-dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Welcome, {user.name}
          </h1>
          <p className="text-lg text-slate-500">
            Please select the portal you want to access
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Finance Portal Card */}
          <div 
            onClick={() => handleSelectPortal('FINANCE')}
            className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary-500 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
              <ArrowRight className="w-6 h-6 text-primary-500" />
            </div>
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Finance & Control</h2>
            <p className="text-slate-500 leading-relaxed">
              Access financial dashboards, manage ledgers, track cashflow, process debts, and view complete business overview.
            </p>
          </div>

          {/* OMS Portal Card */}
          <div 
            onClick={() => handleSelectPortal('OMS')}
            className="group relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:indigo-500 transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
              <ArrowRight className="w-6 h-6 text-indigo-500" />
            </div>
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Order & Inventory</h2>
            <p className="text-slate-500 leading-relaxed">
              Manage sales orders, create drafts, handle order items, and process fulfillments for customers.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={() => {
              useAuthStore.getState().logout();
              router.push("/login");
            }}
            className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
