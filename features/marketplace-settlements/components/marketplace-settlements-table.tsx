import { MarketplaceSettlement, MarketplaceSettlementStatus, SettlementPostingStatus } from "../../../types/marketplace";
import { PaginationMeta } from "../../../types/common";
import { Pagination } from "../../../components/ui/pagination";
import dayjs from "dayjs";
import { Eye, Edit, Clock, CheckCircle2, Loader2, Ban, AlertCircle } from "lucide-react";
import { useTranslation } from "../../../hooks/use-translation";
import Link from "next/link";
import { useAuthStore } from "../../../store/auth-store";

interface MarketplaceSettlementsTableProps {
  data?: MarketplaceSettlement[];
  meta?: PaginationMeta;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export function MarketplaceSettlementsTable({ data, meta, loading, onPageChange }: MarketplaceSettlementsTableProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const formatMoney = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const renderStatus = (status: MarketplaceSettlementStatus) => {
    switch (status) {
      case 'DRAFT':
        return <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold"><Clock className="w-3 h-3"/> {t('marketplace.settlement.status.draft')}</span>;
      case 'VALIDATING':
        return <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-semibold"><Loader2 className="w-3 h-3"/> {t('marketplace.settlement.status.validating')}</span>;
      case 'NEEDS_REVIEW':
        return <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-semibold"><AlertCircle className="w-3 h-3"/> {t('marketplace.settlement.status.needs_review')}</span>;
      case 'READY':
        return <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> {t('marketplace.settlement.status.ready')}</span>;
      case 'POSTED':
        return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> {t('marketplace.settlement.status.posted')}</span>;
      case 'VOID':
        return <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold"><Ban className="w-3 h-3"/> {t('marketplace.settlement.status.void')}</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold"><Ban className="w-3 h-3"/> {t('marketplace.settlement.status.failed')}</span>;
      default:
        return <span className="text-xs font-semibold">{status}</span>;
    }
  };

  const renderPostingStatus = (status: SettlementPostingStatus) => {
    if (status === 'POSTED') return <span className="text-emerald-600 font-medium text-xs">{t('marketplace.settlement.posting_status.posted')}</span>;
    if (status === 'VOID') return <span className="text-red-500 font-medium text-xs">{t('marketplace.settlement.posting_status.void')}</span>;
    return <span className="text-slate-500 font-medium text-xs">{t('marketplace.settlement.posting_status.unposted')}</span>;
  };

  if (loading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <p className="text-slate-500">{t('marketplace.settlement.no_data')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">{t('marketplace.settlement.table.info')}</th>
              <th className="px-6 py-4">{t('marketplace.settlement.table.account')}</th>
              <th className="px-6 py-4">{t('marketplace.settlement.table.status')}</th>
              <th className="px-6 py-4 text-right">{t('marketplace.settlement.table.gross_amount')}</th>
              <th className="px-6 py-4 text-right">{t('marketplace.settlement.table.fees')}</th>
              <th className="px-6 py-4 text-right">{t('marketplace.settlement.table.net_amount')}</th>
              <th className="px-6 py-4 text-center">{t('marketplace.settlement.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{row.settlementCode}</div>
                  <div className="text-xs text-slate-500 mt-1">Ext ID: {row.externalSettlementId}</div>
                  <div className="mt-1 flex gap-2 text-[10px] font-semibold text-slate-400">
                    <span>Settled: {dayjs(row.settlementDate).format("DD MMM YYYY")}</span>
                    {row.payoutDate && (
                      <>
                        <span>•</span>
                        <span>Payout: {dayjs(row.payoutDate).format("DD MMM YYYY")}</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700">{row.marketplaceAccount?.name || '-'}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{row.marketplaceAccount?.marketplaceType || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2 items-start">
                    {renderStatus(row.status)}
                    {renderPostingStatus(row.postingStatus)}
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  {formatMoney(row.summary?.grossSettlementAmount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-red-600 font-medium">{formatMoney(row.summary?.totalFeeAmount)}</div>
                  {row.summary?.totalPenaltyAmount > 0 && <div className="text-red-500 text-xs">Penalty: {formatMoney(row.summary?.totalPenaltyAmount)}</div>}
                  {row.summary?.totalRefundAmount > 0 && <div className="text-red-500 text-xs">Refund: {formatMoney(row.summary?.totalRefundAmount)}</div>}
                </td>
                <td className="px-6 py-4 text-right font-bold text-emerald-700">
                  {formatMoney(row.summary?.netSettlementAmount)}
                  {row.summary?.reconciliationDifference !== 0 && (
                    <div className="text-xs text-red-500 font-semibold mt-1">Diff: {formatMoney(row.summary?.reconciliationDifference)}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link 
                      href={`/dashboard/marketplace-settlements/${row.id}`}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {canEdit && ['DRAFT', 'VALIDATING', 'NEEDS_REVIEW'].includes(row.status) && (
                      <Link 
                        href={`/dashboard/marketplace-settlements/${row.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Edit Settlement"
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
