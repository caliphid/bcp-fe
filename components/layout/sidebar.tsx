"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import { LayoutDashboard, Users, Building, Settings, Sparkles, Building2, Wallet, FolderTree, Package, Briefcase, ArrowRightLeft, UploadCloud, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!user) return null;

  const role = user.role;

  const navGroups = [
    {
      groupLabel: "Main Menu",
      items: [
        {
          title: "Overview",
          href: "/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          title: "Transactions",
          href: "/dashboard/transactions",
          icon: <ArrowRightLeft className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          title: "Import Cashflow",
          href: "/dashboard/imports/cashflow",
          icon: <UploadCloud className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
      ],
    },
    {
      groupLabel: "Reports & Analytics",
      items: [
        {
          title: "Cashflow Reports",
          href: "/dashboard/reports/cashflow",
          icon: <LayoutDashboard className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          title: "Account Balances",
          href: "/dashboard/reports/balances",
          icon: <Wallet className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
      ],
    },
    {
      groupLabel: "Master Data",
      items: [
        {
          title: "Business Units",
          href: "/dashboard/business-units",
          icon: <Building2 className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          title: "Accounts",
          href: "/dashboard/accounts",
          icon: <Wallet className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          title: "Categories",
          href: "/dashboard/categories",
          icon: <FolderTree className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          title: "Products",
          href: "/dashboard/products",
          icon: <Package className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          title: "Crew",
          href: "/dashboard/crew",
          icon: <Users className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
      ],
    },
    {
      groupLabel: "Settings & Admin",
      items: [
        {
          title: "Users",
          href: "/dashboard/users",
          icon: <Users className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          title: "Business Profile",
          href: "/dashboard/business-profile",
          icon: <Briefcase className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          title: "App Settings",
          href: "/dashboard/app-settings",
          icon: <Settings className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
      ],
    },
  ];

  return (
    <div className={cn("flex h-full flex-col bg-slate-900 text-slate-300 shadow-2xl transition-all duration-300 relative", isMinimized ? "w-20" : "w-72")}>
      <button 
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors"
      >
        {isMinimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      <div className={cn("flex h-20 items-center border-b border-slate-800", isMinimized ? "justify-center px-0" : "px-6")}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          {!isMinimized && <h1 className="text-2xl font-bold tracking-tight text-white whitespace-nowrap overflow-hidden">BCP</h1>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6">
        <nav className={cn("space-y-6", isMinimized ? "px-2" : "px-4")}>
          {navGroups.map((group, index) => {
            const visibleItems = group.items.filter((item) =>
              item.allowedRoles.includes(role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={index} className="space-y-2">
                {!isMinimized && (
                  <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap overflow-hidden">
                    {group.groupLabel}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isMinimized ? item.title : undefined}
                      className={cn(
                        "flex items-center space-x-3 rounded-xl py-3 text-sm font-medium transition-all duration-200",
                        isMinimized ? "px-0 justify-center" : "px-4",
                        isActive
                          ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                          : "hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      <div className="shrink-0">{item.icon}</div>
                      {!isMinimized && <span className="whitespace-nowrap overflow-hidden">{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
