"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import {
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  Wallet,
  FolderTree,
  Package,
  Briefcase,
  ArrowRightLeft,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sliders,
  Megaphone,
  Target,
  FileSpreadsheet,
  TrendingUp,
  Banknote,
  Landmark,
} from "lucide-react";
import { cn } from "../../lib/utils";

function SidebarTooltip({
  text,
  children,
  isMinimized,
}: {
  text: string;
  children: React.ReactElement;
  isMinimized: boolean;
}) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLAnchorElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleMouseEnter = () => {
    if (!isMinimized) return;
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
      setShow(true);
    }
  };

  const handleMouseLeave = () => {
    setShow(false);
  };

  useEffect(() => {
    if (!isMinimized) setShow(false);
  }, [isMinimized]);

  return (
    <>
      {React.cloneElement(children, {
        ref: ref as React.Ref<any>,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      })}
      {mounted &&
        show &&
        createPortal(
          <div
            className="fixed z-[9999] px-3.5 py-2 bg-white text-slate-900 text-[13px] font-medium rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] flex items-center pointer-events-none"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translateY(-50%)",
            }}
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_minimized") === "true";
    }
    return false;
  });

  const toggleMinimize = () => {
    const newVal = !isMinimized;
    setIsMinimized(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar_minimized", String(newVal));
    }
  };

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
          title: "Manajemen Hutang",
          href: "/dashboard/debts",
          icon: <Wallet className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          title: "Cicilan Hutang",
          href: "/dashboard/debt-installments",
          icon: <CalendarDays className="h-5 w-5" />,
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
      groupLabel: "Ads & Sales",
      items: [
        {
          title: "Ad Platforms",
          href: "/dashboard/ad-platforms",
          icon: <Megaphone className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          title: "Ad Campaigns",
          href: "/dashboard/ad-campaigns",
          icon: <Target className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          title: "Ads Reports",
          href: "/dashboard/ads-reports",
          icon: <FileSpreadsheet className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          title: "Performance Analytics",
          href: "/dashboard/ads-analytics",
          icon: <TrendingUp className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
      ],
    },
    {
      groupLabel: "Crew Finance",
      items: [
        {
          title: "Crew Cashbon",
          href: "/dashboard/crew-cashbons",
          icon: <Banknote className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
      ],
    },
    {
      groupLabel: "Uang Eksternal",
      items: [
        {
          title: "Pihak Eksternal",
          href: "/dashboard/external-parties",
          icon: <Users className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          title: "Piutang",
          href: "/dashboard/receivables",
          icon: <Banknote className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          title: "Ringkasan Piutang",
          href: "/dashboard/receivable-summary",
          icon: <TrendingUp className="h-5 w-5" />,
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
    <div
      className={cn(
        "flex h-full flex-col bg-slate-900 text-slate-300 shadow-2xl transition-all duration-300 relative",
        isMinimized ? "w-20" : "w-72",
      )}
    >
      <button
        onClick={toggleMinimize}
        className="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors"
      >
        {isMinimized ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div
        className={cn(
          "flex h-20 items-center border-b border-slate-800",
          isMinimized ? "justify-center px-0" : "px-6",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 shrink-0">
            <Sliders className="h-5 w-5" />
          </div>
          {!isMinimized && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-2xl font-bold tracking-tight text-white leading-none">
                Business
              </span>
              <span className="text-[13px] font-medium text-slate-300 mt-1.5 leading-none tracking-wide">
                Control Panel
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6">
        <nav className={cn("space-y-6", isMinimized ? "px-2" : "px-2")}>
          {navGroups.map((group, index) => {
            const visibleItems = group.items.filter((item) =>
              item.allowedRoles.includes(role),
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
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}/`));
                  return (
                    <SidebarTooltip
                      key={item.href}
                      text={item.title}
                      isMinimized={isMinimized}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "relative flex items-center rounded-xl font-medium transition-all duration-200",
                          isMinimized
                            ? "w-11 h-11 justify-center mx-auto"
                            : "px-4 py-3 space-x-3 text-sm",
                          isActive
                            ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                            : "hover:bg-slate-800 hover:text-white",
                        )}
                      >
                        <div className="shrink-0">{item.icon}</div>
                        {!isMinimized && (
                          <span className="whitespace-nowrap overflow-hidden">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </SidebarTooltip>
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
