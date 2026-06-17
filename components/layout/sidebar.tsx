"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import { LayoutDashboard, Users, Building, Settings, Sparkles, Building2, Wallet, FolderTree, Package, Briefcase } from "lucide-react";
import { cn } from "../../lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

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
    <div className="flex h-full w-72 flex-col bg-slate-900 text-slate-300 shadow-2xl">
      <div className="flex h-20 items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">BCP</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-6 px-4">
          {navGroups.map((group, index) => {
            const visibleItems = group.items.filter((item) =>
              item.allowedRoles.includes(role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={index} className="space-y-2">
                <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {group.groupLabel}
                </div>
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                          : "hover:bg-slate-800 hover:text-white"
                      )}
                    >
                      {item.icon}
                      <span>{item.title}</span>
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
