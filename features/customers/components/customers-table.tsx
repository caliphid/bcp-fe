import { Customer, CustomerStatus, CustomerType, CustomerSource } from "../../../types/customer";
import { PaginationMeta } from "../../../types/common";
import { Pagination } from "../../../components/ui/pagination";
import dayjs from "dayjs";
import { Eye, Edit, CheckCircle2, Ban, Lock, GitMerge } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../../../store/auth-store";
import { useTranslation } from "../../../hooks/use-translation";

interface CustomersTableProps {
  data?: Customer[];
  meta?: PaginationMeta;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function CustomersTable({ data, meta, loading, onPageChange }: CustomersTableProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const isStaff = user?.role === "STAFF_INPUT";

  const renderStatus = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.ACTIVE:
        return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider"><CheckCircle2 className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      case CustomerStatus.INACTIVE:
        return <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider"><Ban className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      case CustomerStatus.BLOCKED:
        return <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider"><Lock className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      case CustomerStatus.MERGED:
        return <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider"><GitMerge className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      default:
        return <span className="text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <p className="text-slate-500">{t('common.labels.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Kode & Nama</th>
              {!isStaff && <th className="px-6 py-4">Kontak</th>}
              <th className="px-6 py-4">Tipe & Sumber</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{row.fullName}</div>
                  <div className="text-xs text-slate-500 mt-1">{row.customerCode}</div>
                </td>
                {!isStaff && (
                  <td className="px-6 py-4">
                    {row.phone && <div className="text-xs text-slate-700">{row.phone}</div>}
                    {row.email && <div className="text-xs text-slate-500">{row.email}</div>}
                  </td>
                )}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider">
                      {t(`common.labels.${row.customerType}`)}
                    </span>
                    <span className="inline-flex items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider">
                      {t(`common.labels.${row.source}`)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {renderStatus(row.status)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link 
                      href={`/dashboard/customers/${row.id}`}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {canEdit && row.status !== CustomerStatus.MERGED && (
                      <Link 
                        href={`/dashboard/customers/${row.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Customer"
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
