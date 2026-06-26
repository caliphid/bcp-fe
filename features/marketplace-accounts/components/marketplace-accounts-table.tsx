import { MarketplaceAccount, MarketplaceAccountStatus } from "../../../types/marketplace";
import { PaginationMeta } from "../../../types/common";
import { Pagination } from "../../../components/ui/pagination";
import dayjs from "dayjs";
import { Eye, Edit, CheckCircle2, Ban } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../../../store/auth-store";
import { useTranslation } from "../../../hooks/use-translation";

interface MarketplaceAccountsTableProps {
  data?: MarketplaceAccount[];
  meta?: PaginationMeta;
  loading: boolean;
  onPageChange: (page: number) => void;
  onToggleStatus: (account: MarketplaceAccount) => void;
}

export function MarketplaceAccountsTable({ data, meta, loading, onPageChange, onToggleStatus }: MarketplaceAccountsTableProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const renderStatus = (status: MarketplaceAccountStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> {t('common.status.active')}</span>;
      case 'INACTIVE':
        return <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold"><Ban className="w-3 h-3"/> {t('common.status.inactive')}</span>;
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
        <p className="text-slate-500">{t('marketplace.account.table.noAccounts')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">{t('marketplace.account.table.info')}</th>
              <th className="px-6 py-4">{t('marketplace.account.table.marketplace')}</th>
              <th className="px-6 py-4">{t('marketplace.account.table.businessUnit')}</th>
              <th className="px-6 py-4">{t('marketplace.account.table.settlementRef')}</th>
              <th className="px-6 py-4">{t('marketplace.account.table.status')}</th>
              <th className="px-6 py-4 text-center">{t('marketplace.account.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{row.name}</div>
                  <div className="text-xs text-slate-500 mt-1">Code: {row.code}</div>
                  {row.sellerAccountId && <div className="text-xs text-slate-500">Seller ID: {row.sellerAccountId}</div>}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700">{row.marketplaceType}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-700">{row.businessUnit?.name || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-slate-600">
                    <div>Acct: {row.settlementAccount?.name || '-'}</div>
                    <div className="mt-0.5">Cat: {row.settlementClearingCategory?.name || '-'}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {renderStatus(row.status)}
                  <div className="text-[10px] text-slate-400 mt-1">Upd: {dayjs(row.updatedAt).format("DD MMM YYYY")}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link 
                      href={`/dashboard/marketplace-accounts/${row.id}`}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {canEdit && (
                      <>
                        <Link 
                          href={`/dashboard/marketplace-accounts/${row.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => onToggleStatus(row)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs font-semibold"
                          title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          {row.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                        </button>
                      </>
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
