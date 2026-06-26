"use client";

import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { useSalesOrdersStore } from "@/features/sales-orders/store/sales-orders-store";
import { useSalesOrders } from "@/features/sales-orders/hooks/use-sales-orders";
import { SalesOrdersFilterBar } from "@/features/sales-orders/components/sales-orders-filter-bar";
import { SalesOrdersTable } from "@/features/sales-orders/components/sales-orders-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

export default function SalesOrdersPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { filters, setFilter } = useSalesOrdersStore();

  const isAuthorized = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE" || user?.role === "STAFF_INPUT";
  const canCreate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const { data, meta, isLoading } = useSalesOrders({
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    status: filters.status || undefined,
    salesChannel: filters.salesChannel || undefined,
    orderType: filters.orderType || undefined,
    businessUnitId: filters.businessUnitId || undefined,
    warehouseId: filters.warehouseId || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  });

  if (!isAuthorized) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">{t("pages.salesOrders.noAccess")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <PageHeader
          title={t("pages.salesOrders.title")}
          description={t("pages.salesOrders.subtitle")}
        />
        {canCreate && (
          <Link href="/dashboard/sales-orders/create">
            <Button className="shadow-md shadow-primary-500/20">
              <Plus className="w-4 h-4 mr-2" /> {t("pages.salesOrders.createOrder")}
            </Button>
          </Link>
        )}
      </div>

      <SalesOrdersFilterBar />
      
      <SalesOrdersTable 
        data={data} 
        meta={meta} 
        loading={isLoading} 
        onPageChange={(p) => setFilter("page", p)} 
      />
    </div>
  );
}
