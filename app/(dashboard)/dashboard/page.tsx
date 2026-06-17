"use client";

import { useAuthStore } from "../../../store/auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Users, Building, Settings, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="mt-2 text-slate-500">Welcome back, {user.name}. Here's what's happening.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="relative overflow-hidden border-t-4 border-t-indigo-500">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-indigo-50 opacity-50 blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Role Status</CardTitle>
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{user.role}</div>
            <p className="mt-1 text-xs text-slate-500">Current access level</p>
          </CardContent>
        </Card>

        {["OWNER", "ADMIN_FINANCE"].includes(user.role) && (
          <Card className="relative overflow-hidden group hover:border-blue-500/50 transition-colors">
            <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-blue-50 opacity-50 blur-2xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Users</CardTitle>
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">Manage</div>
              <Link href="/dashboard/users" className="mt-1 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700">
                View Staff <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-emerald-50 opacity-50 blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Business Profile</CardTitle>
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Building className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">Access</div>
            <Link href="/dashboard/business-profile" className="mt-1 inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              View Profile <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:border-amber-500/50 transition-colors">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-amber-50 opacity-50 blur-2xl"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">App Settings</CardTitle>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Settings className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">Configure</div>
            <Link href="/dashboard/app-settings" className="mt-1 inline-flex items-center text-xs font-semibold text-amber-600 hover:text-amber-700">
              View Settings <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
