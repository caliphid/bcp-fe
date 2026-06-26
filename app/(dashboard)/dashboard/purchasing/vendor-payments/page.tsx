"use client";
import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { useVendorPayments } from "../../../../../features/purchasing/hooks/use-purchasing";
import { VendorPayment, VendorPaymentStatus, PaymentMethod } from "../../../../../features/purchasing/types";
import { useAuthStore } from "../../../../../store/auth-store";
import { extractErrorMessage } from "../../../../../lib/error";
import { DataTable } from "../../../../../components/ui/data-table";
import { Button } from "../../../../../components/ui/button";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { Search, FileText } from "lucide-react";
import { formatCurrency } from "../../../../../features/debts/utils/formatters";
import { formatDate } from "../../../../../lib/utils";

export default function VendorPaymentsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isStaff = user?.role === "STAFF_INPUT";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<VendorPaymentStatus | "">("");

  const { data, meta, isLoading, error } = useVendorPayments({
    page,
    limit: 10,
    paymentStatus: statusFilter || undefined,
  });

  const columns = [
    {
      header: t("pages.vendorPayments.columns.paymentRefDate"),
      cell: (item: VendorPayment) => (
        <div>
          <Link href={`/dashboard/purchasing/vendor-payments/${item.id}`} className="font-semibold text-primary-600 hover:underline">
            {item.vendorPaymentCode}
          </Link>
          <div className="text-sm text-slate-500 mt-1">{formatDate(item.paymentDate)}</div>
        </div>
      ),
    },
    {
      header: t("pages.vendorPayments.columns.purchaseOrder"),
      cell: (item: VendorPayment) => (
        <Link href={`/dashboard/purchasing/purchase-orders/${item.purchaseOrderId}`} className="font-medium text-slate-700 hover:underline hover:text-primary-600">
          {item.purchaseOrder?.purchaseOrderCode || "-"}
        </Link>
      ),
    },
    {
      header: t("pages.vendorPayments.columns.vendor"),
      cell: (item: VendorPayment) => (
        <span className="font-medium text-slate-700">{item.vendor?.name || "-"}</span>
      ),
    },
    {
      header: t("pages.vendorPayments.columns.method"),
      cell: (item: VendorPayment) => (
        <span className="text-slate-700">{item.paymentMethod.replace(/_/g, " ")}</span>
      ),
    },
    {
      header: t("pages.vendorPayments.columns.status"),
      cell: (item: VendorPayment) => {
        let bg = "bg-slate-100 text-slate-800";
        switch (item.status) {
          case VendorPaymentStatus.POSTED: bg = "bg-emerald-100 text-emerald-800"; break;
          case VendorPaymentStatus.VOID: bg = "bg-rose-100 text-rose-800"; break;
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}>
            {item.status}
          </span>
        );
      },
    },
    {
      header: t("pages.vendorPayments.columns.amount"),
      cell: (item: VendorPayment) => (
        <span className="font-medium text-slate-900">{formatCurrency(Number(item.amount || 0))}</span>
      ),
    },
    {
      header: t("pages.vendorPayments.columns.actions"),
      cell: (item: VendorPayment) => (
        <Link href={`/dashboard/purchasing/vendor-payments/${item.id}`}>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-1" /> View
          </Button>
        </Link>
      ),
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("pages.vendorPayments.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("pages.vendorPayments.subtitle")}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{extractErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-end">
        <div className="flex-shrink-0 w-full md:w-48">
          <select
            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as VendorPaymentStatus | "");
              setPage(1);
            }}
          >
            <option value="">{t("pages.vendorPayments.allStatuses")}</option>
            {Object.values(VendorPaymentStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns as any}
        data={data || []}
        isLoading={isLoading}
        emptyMessage={t("pages.vendorPayments.noPaymentsFound")}
      />

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-slate-200 sm:px-6 rounded-b-xl shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
            >
              {t("common.actions.previous")}
            </Button>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page * meta.limit >= meta.total}
              variant="outline"
            >
              {t("common.actions.next")}
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                {t("common.labels.showing")} <span className="font-medium">{(page - 1) * meta.limit + 1}</span> {t("common.labels.to")}{" "}
                <span className="font-medium">
                  {Math.min(page * meta.limit, meta.total)}
                </span>{" "}
                {t("common.labels.of")} <span className="font-medium">{meta.total}</span> {t("common.labels.results")}
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="rounded-l-md rounded-r-none"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  {t("common.actions.previous")}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-l-none rounded-r-md"
                  onClick={() => setPage(page + 1)}
                  disabled={page * meta.limit >= meta.total}
                >
                  {t("common.actions.next")}
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
