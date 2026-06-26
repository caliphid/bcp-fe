"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { useCustomerReturns } from "../../../../features/customer-returns/hooks/use-customer-returns";
import { CustomerReturn, CustomerReturnStatus, CustomerReturnType } from "../../../../features/customer-returns/types";
import { DataTable } from "../../../../components/ui/data-table";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { PageHeader } from "../../../../components/ui/page-header";
import { ReturnStatusBadge, ReturnTypeBadge } from "../../../../features/customer-returns/components/status-badge";
import { Plus, Search, Filter } from "lucide-react";
import { formatDate } from "../../../../lib/utils";
import { useDebounce } from "../../../../hooks/use-debounce";

export default function CustomerReturnsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState<string>("");
  const [returnType, setReturnType] = useState<string>("");

  const { data, isLoading } = useCustomerReturns({
    page,
    limit: 10,
    ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    ...(status ? { status } : {}),
    ...(returnType ? { returnType } : {}),
  });

  const returns = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0 };

  const columns = [
    {
      header: t("pages.customerReturns.columns.returnCode"),
      cell: (row: CustomerReturn) => (
        <div>
          <Link href={`/dashboard/customer-returns/${row.id}`} className="font-semibold text-primary-600 hover:underline">
            {row.returnCode}
          </Link>
          <div className="text-xs text-slate-500 mt-0.5">{formatDate(row.returnDate)}</div>
        </div>
      ),
    },
    {
      header: t("pages.customerReturns.columns.salesOrder"),
      cell: (row: CustomerReturn) => (
        row.salesOrder ? (
          <Link href={`/dashboard/sales-orders/${row.salesOrder.id}`} className="font-medium text-slate-700 hover:underline">
            {row.salesOrder.orderCode}
          </Link>
        ) : "-"
      ),
    },
    {
      header: t("pages.customerReturns.columns.customer"),
      cell: (row: CustomerReturn) => {
        const hasCustomer = !!row.customer;
        const name = row.customer?.fullName || row.customerName || row.salesOrder?.customer?.name || "-";
        
        return (
          <div>
            <div className="font-medium text-slate-800 flex items-center gap-1.5">
              {name}
              {hasCustomer && (
                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 font-bold" title="Linked to Master Customer">
                  LINKED
                </span>
              )}
            </div>
            {row.customer?.customerCode && (
              <div className="text-xs text-slate-500 mt-0.5 font-mono">{row.customer.customerCode}</div>
            )}
          </div>
        );
      },
    },
    {
      header: t("pages.customerReturns.columns.type"),
      cell: (row: CustomerReturn) => <ReturnTypeBadge type={row.returnType} />,
    },
    {
      header: t("pages.customerReturns.columns.status"),
      cell: (row: CustomerReturn) => <ReturnStatusBadge status={row.status} />,
    },
    {
      header: t("pages.customerReturns.columns.warehouse"),
      cell: (row: CustomerReturn) => <span className="text-sm text-slate-600">{row.warehouse?.name || "-"}</span>,
    }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader 
          title={t("pages.customerReturns.title")}
          description={t("pages.customerReturns.subtitle")}
        />
        <Button onClick={() => router.push("/dashboard/customer-returns/create")} className="shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> {t("pages.customerReturns.newReturn")}
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder={t("pages.customerReturns.searchPlaceholder")}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <select 
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{t("pages.customerReturns.allStatuses")}</option>
            {Object.values(CustomerReturnStatus).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>

          <select 
            className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 min-w-[150px]"
            value={returnType}
            onChange={(e) => setReturnType(e.target.value)}
          >
            <option value="">{t("pages.customerReturns.allTypes")}</option>
            {Object.values(CustomerReturnType).map(t => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={returns}
          isLoading={isLoading}
          pagination={{
            page: meta.page,
            limit: meta.limit,
            total: meta.total,
            onPageChange: setPage,
          }}
          onRowClick={(row) => router.push(`/dashboard/customer-returns/${row.id}`)}
        />
      </div>
    </div>
  );
}
