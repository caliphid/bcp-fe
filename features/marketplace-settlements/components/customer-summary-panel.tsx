import { useMarketplaceCustomerSummary } from "../hooks/use-marketplace-settlements";
import { Loader2, AlertCircle, User, Activity } from "lucide-react";
import { useAuthStore } from "../../../store/auth-store";
import { useTranslation } from "../../../hooks/use-translation";

export function CustomerSummaryPanel({ settlementId }: { settlementId: string }) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useMarketplaceCustomerSummary(settlementId);
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center min-h-[200px] text-slate-500">
        <AlertCircle className="w-5 h-5 mr-2 text-slate-400" />
        Failed to load customer summary.
      </div>
    );
  }

  const formatMoney = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">Customer Summary</h3>
          <p className="text-xs text-slate-500">Aggregated from matched settlement lines.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <span className="text-sm text-slate-500">Customer</span>
          <div className="text-right">
            {!data.customerId ? (
              <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">
                Unlinked Historical Order
              </span>
            ) : (
              <span className="font-medium text-slate-800">{data.customerName || 'Unknown'}</span>
            )}
            
            {data.customerId && data.customerStatus && ['INACTIVE', 'BLOCKED'].includes(data.customerStatus) && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  <AlertCircle className="w-3 h-3" /> {data.customerStatus}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <span className="text-sm text-slate-500">Total Matched Orders</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1">
            <Activity className="w-4 h-4 text-slate-400" /> {data.totalOrderCount}
          </span>
        </div>

        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <span className="text-sm text-slate-500">Gross Contribution</span>
          <span className="font-medium text-slate-700">{formatMoney(data.grossAmount)}</span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-sm font-semibold text-slate-700">Net Contribution</span>
          <span className="font-bold text-emerald-600 text-lg">{formatMoney(data.netAmount)}</span>
        </div>
      </div>
    </div>
  );
}
