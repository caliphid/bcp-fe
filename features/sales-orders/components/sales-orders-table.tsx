import { SalesOrder, SalesOrderStatus } from "../../../types/sales-order";
import { PaginationMeta } from "../../../types/common";
import { Pagination } from "../../../components/ui/pagination";
import dayjs from "dayjs";
import { Eye, Edit, Clock, CheckCircle2, Loader2, Ban, CreditCard } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../../../store/auth-store";

interface SalesOrdersTableProps {
  data?: SalesOrder[];
  meta?: PaginationMeta;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function SalesOrdersTable({ data, meta, loading, onPageChange }: SalesOrdersTableProps) {
  const { user } = useAuthStore();
  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(val));
  };

  const renderStatus = (status: SalesOrderStatus) => {
    switch (status) {
      case SalesOrderStatus.DRAFT:
        return <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold"><Clock className="w-3 h-3"/> DRAFT</span>;
      case SalesOrderStatus.CONFIRMED:
        return <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> CONFIRMED</span>;
      case SalesOrderStatus.PROCESSING:
        return <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-semibold"><Loader2 className="w-3 h-3"/> PROCESSING</span>;
      case SalesOrderStatus.FULFILLED:
        return <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> FULFILLED</span>;
      case SalesOrderStatus.COMPLETED:
        return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> COMPLETED</span>;
      case SalesOrderStatus.CANCELLED:
        return <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold"><Ban className="w-3 h-3"/> CANCELLED</span>;
      default:
        return <span className="text-xs font-semibold">{status}</span>;
    }
  };

  const renderPaymentStatus = (status: string) => {
    if (status === 'PAID') return <span className="text-emerald-600 font-medium text-xs"><CreditCard className="w-3 h-3 inline mr-1" />PAID</span>;
    if (status === 'PARTIAL') return <span className="text-amber-600 font-medium text-xs"><CreditCard className="w-3 h-3 inline mr-1" />PARTIAL</span>;
    return <span className="text-red-500 font-medium text-xs"><CreditCard className="w-3 h-3 inline mr-1" />UNPAID</span>;
  };

  if (loading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <p className="text-slate-500">Tidak ada data Sales Order ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Order Info</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Status & Payment</th>
              <th className="px-6 py-4 text-center">Items</th>
              <th className="px-6 py-4 text-right">Grand Total</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{row.orderCode}</div>
                  <div className="text-xs text-slate-500 mt-1">{dayjs(row.orderDate).format("DD MMM YYYY")}</div>
                  <div className="mt-1 flex gap-2 text-[10px] uppercase font-semibold text-slate-400">
                    <span>{row.salesChannel}</span>
                    <span>•</span>
                    <span>{row.orderType}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700">{row.customerName}</div>
                  {row.customerPhone && <div className="text-xs text-slate-500 mt-0.5">{row.customerPhone}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2 items-start">
                    {renderStatus(row.status)}
                    {renderPaymentStatus(row.paymentStatus)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center justify-center bg-slate-100 text-slate-600 h-6 w-6 rounded-full text-xs font-bold">
                    {row.items?.length || 0}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">
                  {formatMoney(row.grandTotal)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link 
                      href={`/dashboard/sales-orders/${row.id}`}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {canEdit && row.status === 'DRAFT' && (
                      <Link 
                        href={`/dashboard/sales-orders/${row.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Draft"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
}
