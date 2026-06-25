"use client";
import { useState } from "react";
import Link from "next/link";
import { usePurchaseOrders } from "../../../../../features/purchasing/hooks/use-purchasing";
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderPaymentStatus } from "../../../../../features/purchasing/types";
import { useAuthStore } from "../../../../../store/auth-store";
import { extractErrorMessage } from "../../../../../lib/error";
import { DataTable } from "../../../../../components/ui/data-table";
import { Button } from "../../../../../components/ui/button";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { PlusCircle, Search, FileText } from "lucide-react";
import { formatCurrency } from "../../../../../features/debts/utils/formatters";
import { formatDate } from "../../../../../lib/utils";

export default function PurchaseOrdersPage() {
  const user = useAuthStore((state) => state.user);
  const isStaff = user?.role === "STAFF_INPUT";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "">("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PurchaseOrderPaymentStatus | "">("");

  const { data, meta, isLoading, error } = usePurchaseOrders({
    page,
    limit: 10,
    search: search || undefined,
    orderStatus: statusFilter || undefined,
    paymentStatus: paymentStatusFilter || undefined,
  });

  const columns = [
    {
      header: "PO Number & Date",
      cell: (item: PurchaseOrder) => (
        <div>
          <Link href={`/dashboard/purchasing/purchase-orders/${item.id}`} className="font-semibold text-primary-600 hover:underline">
            {item.purchaseOrderCode}
          </Link>
          <div className="text-sm text-slate-500 mt-1">{formatDate(item.orderDate)}</div>
        </div>
      ),
    },
    {
      header: "Vendor",
      cell: (item: PurchaseOrder) => (
        <span className="font-medium text-slate-700">{item.vendor?.name || "-"}</span>
      ),
    },
    {
      header: "Status",
      cell: (item: PurchaseOrder) => {
        let bg = "bg-slate-100 text-slate-800";
        switch (item.status) {
          case PurchaseOrderStatus.DRAFT: bg = "bg-slate-100 text-slate-800"; break;
          case PurchaseOrderStatus.SUBMITTED: bg = "bg-blue-100 text-blue-800"; break;
          case PurchaseOrderStatus.APPROVED: bg = "bg-emerald-100 text-emerald-800"; break;
          case PurchaseOrderStatus.PARTIALLY_RECEIVED: bg = "bg-yellow-100 text-yellow-800"; break;
          case PurchaseOrderStatus.FULLY_RECEIVED: bg = "bg-indigo-100 text-indigo-800"; break;
          case PurchaseOrderStatus.CANCELLED: bg = "bg-rose-100 text-rose-800"; break;
          case PurchaseOrderStatus.CLOSED: bg = "bg-slate-200 text-slate-600"; break;
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}>
            {item.status.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      header: "Payment Status",
      cell: (item: PurchaseOrder) => {
        let bg = "bg-slate-100 text-slate-800";
        switch (item.paymentStatus) {
          case PurchaseOrderPaymentStatus.UNPAID: bg = "bg-red-100 text-red-800"; break;
          case PurchaseOrderPaymentStatus.PARTIALLY_PAID: bg = "bg-yellow-100 text-yellow-800"; break;
          case PurchaseOrderPaymentStatus.PAID: bg = "bg-emerald-100 text-emerald-800"; break;
          case PurchaseOrderPaymentStatus.CANCELLED: bg = "bg-slate-200 text-slate-600"; break;
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}>
            {item.paymentStatus.replace(/_/g, " ")}
          </span>
        );
      },
    },
  ];

  // Add cost columns if not staff
  if (!isStaff) {
    columns.push(
      {
        header: "Total Amount",
        cell: (item: PurchaseOrder) => (
          <span className="font-medium text-slate-900">{formatCurrency(Number(item.totalAmount || 0))}</span>
        ),
      },
      {
        header: "Outstanding",
        cell: (item: PurchaseOrder) => (
          <span className={`font-medium ${Number(item.outstandingAmount || 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatCurrency(Number(item.outstandingAmount || 0))}
          </span>
        ),
      }
    );
  }

  columns.push({
    header: "Actions",
    cell: (item: PurchaseOrder) => (
      <Link href={`/dashboard/purchasing/purchase-orders/${item.id}`}>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-1" /> View
        </Button>
      </Link>
    ),
  } as any);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Purchase Orders</h2>
          <p className="mt-1 text-sm text-slate-500">Manage purchasing from suppliers.</p>
        </div>
        <Link href="/dashboard/purchasing/purchase-orders/create">
          <Button className="w-full sm:w-auto shadow-primary-500/30 shadow-md">
            <PlusCircle className="mr-2 h-4 w-4" /> Create PO
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{extractErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search PO number..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex-shrink-0 w-full md:w-48">
          <select
            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as PurchaseOrderStatus | "");
              setPage(1);
            }}
          >
            <option value="">All PO Statuses</option>
            {Object.values(PurchaseOrderStatus).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div className="flex-shrink-0 w-full md:w-48">
          <select
            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value as PurchaseOrderPaymentStatus | "");
              setPage(1);
            }}
          >
            <option value="">All Payment Statuses</option>
            {Object.values(PurchaseOrderPaymentStatus).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        emptyMessage="No purchase orders found"
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
              Previous
            </Button>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page * meta.limit >= meta.total}
              variant="outline"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Showing <span className="font-medium">{(page - 1) * meta.limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * meta.limit, meta.total)}
                </span>{" "}
                of <span className="font-medium">{meta.total}</span> results
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
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="rounded-l-none rounded-r-md"
                  onClick={() => setPage(page + 1)}
                  disabled={page * meta.limit >= meta.total}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
