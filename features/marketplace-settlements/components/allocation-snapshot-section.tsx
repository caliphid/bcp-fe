import { useTranslation } from "../../../hooks/use-translation";
import { MarketplaceSettlementAllocation } from "../../../types/marketplace";

interface AllocationSnapshotSectionProps {
  allocations?: MarketplaceSettlementAllocation[];
}

export function AllocationSnapshotSection({ allocations }: AllocationSnapshotSectionProps) {
  const { t } = useTranslation();
  if (!allocations || allocations.length === 0) return null;

  const formatMoney = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800">Allocation Snapshot</h3>
        <p className="text-xs text-slate-500 mt-1">Historical snapshot of order allocation amounts. Read-only.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Order Code</th>
              <th className="px-6 py-4">Customer Info</th>
              <th className="px-6 py-4 text-right">Gross</th>
              <th className="px-6 py-4 text-right">Fees & Pen.</th>
              <th className="px-6 py-4 text-right">Refund</th>
              <th className="px-6 py-4 text-right">Tax</th>
              <th className="px-6 py-4 text-right">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allocations.map((alloc) => (
              <tr key={alloc.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800">{alloc.orderCodeSnapshot || '-'}</div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 mt-1">{alloc.salesChannelSnapshot || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700">{alloc.customerNameSnapshot || '-'}</div>
                  <div className="text-xs text-slate-500">{alloc.customerPhoneSnapshot || '-'}</div>
                  {alloc.customerStatusSnapshot && (
                    <div className="text-[10px] text-slate-400 uppercase mt-0.5">{alloc.customerStatusSnapshot}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-700">
                  {formatMoney(alloc.grossAmount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-red-600 font-medium">{formatMoney(alloc.feeAmount)}</div>
                  {alloc.penaltyAmount > 0 && (
                    <div className="text-red-500 text-xs mt-0.5">Pen: {formatMoney(alloc.penaltyAmount)}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-red-500 font-medium">
                  {formatMoney(alloc.refundAmount)}
                </td>
                <td className="px-6 py-4 text-right text-slate-600 font-medium">
                  {formatMoney(alloc.taxAmount)}
                </td>
                <td className="px-6 py-4 text-right font-bold text-emerald-700">
                  {formatMoney(alloc.netAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
