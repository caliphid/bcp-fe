"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store/auth-store";
import { useTranslation } from "../../hooks/use-translation";
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
  BookOpen,
  Scale,
  ShoppingCart,
  Warehouse,
  ClipboardList,
  AlertTriangle,
  History,
  Truck,
  Box,
  BadgeDollarSign,
  FileText,
  ListChecks,
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
  const ref = useRef<HTMLElement>(null);

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

  return (
    <>
      {React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>>, {
        ref,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      })}
      {show && isMinimized &&
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
  const activePortal = useAuthStore((state) => state.activePortal);
  const { t } = useTranslation();
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
      groupKey: "sidebar.groups.mainMenu",
      portals: ["FINANCE"],
      items: [
        {
          titleKey: "sidebar.items.overview",
          href: "/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />, iconColor: "text-blue-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.transactions",
          href: "/dashboard/transactions",
          icon: <ArrowRightLeft className="h-5 w-5" />, iconColor: "text-emerald-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.debtManagement",
          href: "/dashboard/debts",
          icon: <Wallet className="h-5 w-5" />, iconColor: "text-amber-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.debtInstallments",
          href: "/dashboard/debt-installments",
          icon: <CalendarDays className="h-5 w-5" />, iconColor: "text-purple-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.importCashflow",
          href: "/dashboard/imports/cashflow",
          icon: <UploadCloud className="h-5 w-5" />, iconColor: "text-pink-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.orderInventory",
      portals: ["OMS"],
      items: [
        {
          titleKey: "sidebar.items.orderDashboard",
          href: "/dashboard/order-dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />, iconColor: "text-cyan-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.salesOrders",
          href: "/dashboard/sales-orders",
          icon: <ShoppingCart className="h-5 w-5" />, iconColor: "text-rose-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.customerReturns",
          href: "/dashboard/customer-returns",
          icon: <ArrowRightLeft className="h-5 w-5" />, iconColor: "text-indigo-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.returnReports",
          href: "/dashboard/return-reports",
          icon: <FileText className="h-5 w-5" />, iconColor: "text-teal-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.stockOpnames",
          href: "/dashboard/stock-opnames",
          icon: <ListChecks className="h-5 w-5" />, iconColor: "text-orange-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.purchasing",
      portals: ["OMS"],
      items: [
        {
          titleKey: "sidebar.items.vendors",
          href: "/dashboard/purchasing/vendors",
          icon: <Truck className="h-5 w-5" />, iconColor: "text-fuchsia-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.purchaseOrders",
          href: "/dashboard/purchasing/purchase-orders",
          icon: <ShoppingCart className="h-5 w-5" />, iconColor: "text-sky-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.goodsReceipts",
          href: "/dashboard/purchasing/goods-receipts",
          icon: <Box className="h-5 w-5" />, iconColor: "text-violet-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.vendorPayments",
          href: "/dashboard/purchasing/vendor-payments",
          icon: <BadgeDollarSign className="h-5 w-5" />, iconColor: "text-blue-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.purchaseReports",
          href: "/dashboard/purchasing/reports",
          icon: <FileText className="h-5 w-5" />, iconColor: "text-emerald-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.inventoryManagement",
      portals: ["OMS"],
      items: [
        {
          titleKey: "sidebar.items.inventory",
          href: "/dashboard/inventory/stock",
          icon: <ClipboardList className="h-5 w-5" />, iconColor: "text-amber-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.lowStockAlert",
          href: "/dashboard/inventory/low-stock",
          icon: <AlertTriangle className="h-5 w-5" />, iconColor: "text-purple-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.movementsLog",
          href: "/dashboard/inventory/movements",
          icon: <History className="h-5 w-5" />, iconColor: "text-pink-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.adsSales",
      portals: ["FINANCE"],
      items: [
        {
          titleKey: "sidebar.items.adPlatforms",
          href: "/dashboard/ad-platforms",
          icon: <Megaphone className="h-5 w-5" />, iconColor: "text-cyan-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.adCampaigns",
          href: "/dashboard/ad-campaigns",
          icon: <Target className="h-5 w-5" />, iconColor: "text-rose-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.adsReports",
          href: "/dashboard/ads-reports",
          icon: <FileSpreadsheet className="h-5 w-5" />, iconColor: "text-indigo-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.performanceAnalytics",
          href: "/dashboard/ads-analytics",
          icon: <TrendingUp className="h-5 w-5" />, iconColor: "text-teal-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.crewFinance",
      portals: ["FINANCE"],
      items: [
        {
          titleKey: "sidebar.items.crewCashbon",
          href: "/dashboard/crew-cashbons",
          icon: <Banknote className="h-5 w-5" />, iconColor: "text-orange-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.externalMoney",
      portals: ["FINANCE"],
      items: [
        {
          titleKey: "sidebar.items.externalParties",
          href: "/dashboard/external-parties",
          icon: <Users className="h-5 w-5" />, iconColor: "text-fuchsia-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.receivables",
          href: "/dashboard/receivables",
          icon: <Banknote className="h-5 w-5" />, iconColor: "text-sky-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.receivableSummary",
          href: "/dashboard/receivable-summary",
          icon: <TrendingUp className="h-5 w-5" />, iconColor: "text-violet-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.financeControl",
      portals: ["FINANCE"],
      items: [
        {
          titleKey: "sidebar.items.monthlyOverview",
          href: "/dashboard/finance/overview",
          icon: <LayoutDashboard className="h-5 w-5" />, iconColor: "text-blue-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.accountLedger",
          href: "/dashboard/finance/ledger",
          icon: <BookOpen className="h-5 w-5" />, iconColor: "text-emerald-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.accountTransfers",
          href: "/dashboard/finance/transfers",
          icon: <ArrowRightLeft className="h-5 w-5" />, iconColor: "text-amber-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.balanceReconciliation",
          href: "/dashboard/finance/reconciliation",
          icon: <Scale className="h-5 w-5" />, iconColor: "text-purple-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          titleKey: "sidebar.items.financialPeriods",
          href: "/dashboard/finance/periods",
          icon: <CalendarDays className="h-5 w-5" />, iconColor: "text-pink-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.marketplaceSettlements",
          href: "/dashboard/marketplace-settlements",
          icon: <Banknote className="h-5 w-5" />, iconColor: "text-cyan-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.reportsAnalytics",
      portals: ["FINANCE"],
      items: [
        {
          titleKey: "sidebar.items.cashflowReports",
          href: "/dashboard/reports/cashflow",
          icon: <LayoutDashboard className="h-5 w-5" />, iconColor: "text-rose-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          titleKey: "sidebar.items.accountBalances",
          href: "/dashboard/reports/balances",
          icon: <Wallet className="h-5 w-5" />, iconColor: "text-indigo-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.masterData",
      portals: ["FINANCE", "OMS"],
      items: [
        {
          titleKey: "sidebar.items.customers",
          href: "/dashboard/customers",
          icon: <Users className="h-5 w-5" />, iconColor: "text-teal-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.productCategories",
          href: "/dashboard/product-categories",
          icon: <FolderTree className="h-5 w-5" />, iconColor: "text-orange-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          titleKey: "sidebar.items.products",
          href: "/dashboard/products",
          icon: <Package className="h-5 w-5" />, iconColor: "text-fuchsia-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          titleKey: "sidebar.items.warehouses",
          href: "/dashboard/warehouses",
          icon: <Warehouse className="h-5 w-5" />, iconColor: "text-sky-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.financeMaster",
      portals: ["FINANCE"],
      items: [
        {
          titleKey: "sidebar.items.businessUnits",
          href: "/dashboard/business-units",
          icon: <Building2 className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          titleKey: "sidebar.items.accounts",
          href: "/dashboard/accounts",
          icon: <Wallet className="h-5 w-5" />, iconColor: "text-violet-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          titleKey: "sidebar.items.categories",
          href: "/dashboard/categories",
          icon: <FolderTree className="h-5 w-5" />, iconColor: "text-blue-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          titleKey: "sidebar.items.crew",
          href: "/dashboard/crew",
          icon: <Users className="h-5 w-5" />, iconColor: "text-emerald-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          titleKey: "sidebar.items.marketplaceAccounts",
          href: "/dashboard/marketplace-accounts",
          icon: <Building2 className="h-5 w-5" />,
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
      ],
    },
    {
      groupKey: "sidebar.groups.settingsAdmin",
      portals: ["FINANCE", "OMS"],
      items: [
        {
          titleKey: "sidebar.items.users",
          href: "/dashboard/users",
          icon: <Users className="h-5 w-5" />, iconColor: "text-amber-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE"],
        },
        {
          titleKey: "sidebar.items.businessProfile",
          href: "/dashboard/business-profile",
          icon: <Briefcase className="h-5 w-5" />, iconColor: "text-purple-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
        {
          titleKey: "sidebar.items.appSettings",
          href: "/dashboard/app-settings",
          icon: <Settings className="h-5 w-5" />, iconColor: "text-pink-500",
          allowedRoles: ["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"],
        },
      ],
    },
  ];

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-white text-slate-600 shadow-xl transition-all duration-300 relative border-r border-slate-200",
        isMinimized ? "w-20" : "w-72",
      )}
    >
      <button
        onClick={toggleMinimize}
        className="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-400 border border-slate-200 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
      >
        {isMinimized ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div
        className={cn(
          "flex h-20 items-center border-b border-slate-100",
          isMinimized ? "justify-center px-0" : "px-6",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F65F1] text-[#D4FF00] shadow-md shrink-0">
            <Sliders className="h-5 w-5" />
          </div>
          {!isMinimized && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                {activePortal === "OMS"
                  ? t("sidebar.brand.oms.title")
                  : t("sidebar.brand.finance.title")}
              </span>
              <span className="text-[13px] font-medium text-slate-500 mt-1.5 leading-none tracking-wide">
                {activePortal === "OMS"
                  ? t("sidebar.brand.oms.subtitle")
                  : t("sidebar.brand.finance.subtitle")}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <nav className={cn("space-y-6", isMinimized ? "px-2" : "px-3")}>
          {navGroups.map((group, index) => {
            if (activePortal && group.portals && !group.portals.includes(activePortal)) {
              return null;
            }

            const visibleItems = group.items.filter((item) =>
              item.allowedRoles.includes(role),
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={index} className="space-y-2">
                {!isMinimized && (
                  <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap overflow-hidden">
                    {t(group.groupKey)}
                  </div>
                )}
                {visibleItems.map((item) => {
                  const title = t(item.titleKey);
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}/`));
                      
                  // Safelist for Tailwind: group-hover:text-blue-500 group-hover:text-emerald-500 group-hover:text-amber-500 group-hover:text-purple-500 group-hover:text-pink-500 group-hover:text-cyan-500 group-hover:text-rose-500 group-hover:text-indigo-500 group-hover:text-teal-500 group-hover:text-orange-500 group-hover:text-fuchsia-500 group-hover:text-sky-500 group-hover:text-violet-500 group-hover:text-blue-700
                  const itemIconColor = (item as { iconColor?: string }).iconColor || "text-blue-700";
                  const hoverIconColor = itemIconColor.replace("text-", "group-hover:text-");

                  return (
                    <SidebarTooltip
                      key={item.href}
                      text={title}
                      isMinimized={isMinimized}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center rounded-xl font-medium transition-all duration-200",
                          isMinimized
                            ? "w-11 h-11 justify-center mx-auto"
                            : "px-4 py-3 space-x-3 text-sm",
                          isActive
                            ? "bg-[#EEF7A2] text-blue-700"
                            : "hover:bg-slate-50 hover:text-slate-900 text-slate-500",
                        )}
                      >
                        <div className={cn("shrink-0 transition-colors duration-200", isActive ? itemIconColor : `text-slate-400 ${hoverIconColor}`)}>{item.icon}</div>
                        {!isMinimized && (
                          <span className="whitespace-nowrap overflow-hidden">
                            {title}
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
