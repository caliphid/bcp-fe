import { AdsProductPerformanceItem, AdsPlatformPerformanceItem, AdsCampaignPerformanceItem } from "../../../types/ads";
import { formatCurrency } from "../../debts/utils/formatters";
import { cn } from "../../../lib/utils";

export function AdsProductPerformanceTable({ data, loading }: { data: AdsProductPerformanceItem[], loading: boolean }) {
  if (loading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-xl border border-slate-100"></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Product Performance (Estimated)</h3>
        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">Ad spend allocated proportionally</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-white text-xs uppercase text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium text-right">Qty</th>
              <th className="px-4 py-3 font-medium text-right">Orders</th>
              <th className="px-4 py-3 font-medium text-right">Revenue</th>
              <th className="px-4 py-3 font-medium text-right">Alloc. Ad Spend</th>
              <th className="px-4 py-3 font-medium text-right">Est. Net Profit</th>
              <th className="px-4 py-3 font-medium text-right">Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, i) => {
              const isLoss = parseFloat(item.estimatedNetProfit) < 0;
              return (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.productName}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{item.orders}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(item.revenue)}</td>
                  <td className="px-4 py-3 text-right text-rose-600 font-medium">{formatCurrency(item.allocatedAdSpend)}</td>
                  <td className={cn("px-4 py-3 text-right font-bold", isLoss ? "text-rose-600" : "text-emerald-600")}>
                    {formatCurrency(item.estimatedNetProfit)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{(item.estimatedMargin || 0).toFixed(1)}%</td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No product data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdsPlatformPerformanceTable({ data, loading }: { data: AdsPlatformPerformanceItem[], loading: boolean }) {
  if (loading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-xl border border-slate-100"></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">Platform Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-white text-xs uppercase text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium text-right">Reports</th>
              <th className="px-4 py-3 font-medium text-right">Revenue</th>
              <th className="px-4 py-3 font-medium text-right">Ad Spend</th>
              <th className="px-4 py-3 font-medium text-right">Net Profit</th>
              <th className="px-4 py-3 font-medium text-right">ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, i) => {
              const isLoss = parseFloat(item.netProfit) < 0;
              return (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.platformName || (item as any).name}</td>
                  <td className="px-4 py-3 text-right">{item.reportsCount || (item as any).reportCount}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(item.totalRevenue)}</td>
                  <td className="px-4 py-3 text-right text-rose-600 font-medium">{formatCurrency(item.totalAdSpend)}</td>
                  <td className={cn("px-4 py-3 text-right font-bold", isLoss ? "text-rose-600" : "text-emerald-600")}>
                    {formatCurrency(item.netProfit)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{(item.roas || 0).toFixed(2)}x</td>
                </tr>
              );
            })}
             {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No platform data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdsCampaignPerformanceTable({ data, loading }: { data: AdsCampaignPerformanceItem[], loading: boolean }) {
  if (loading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-xl border border-slate-100"></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-100">
        <h3 className="font-bold text-slate-800">Campaign Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-white text-xs uppercase text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 font-medium text-right">Reports</th>
              <th className="px-4 py-3 font-medium text-right">Revenue</th>
              <th className="px-4 py-3 font-medium text-right">Ad Spend</th>
              <th className="px-4 py-3 font-medium text-right">Net Profit</th>
              <th className="px-4 py-3 font-medium text-right">ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item, i) => {
              const isLoss = parseFloat(item.netProfit) < 0;
              return (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{item.campaignName || (item as any).name || "Unassigned"}</td>
                  <td className="px-4 py-3 text-right">{item.reportsCount || (item as any).reportCount}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(item.totalRevenue)}</td>
                  <td className="px-4 py-3 text-right text-rose-600 font-medium">{formatCurrency(item.totalAdSpend)}</td>
                  <td className={cn("px-4 py-3 text-right font-bold", isLoss ? "text-rose-600" : "text-emerald-600")}>
                    {formatCurrency(item.netProfit)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{(item.roas || 0).toFixed(2)}x</td>
                </tr>
              );
            })}
             {data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No campaign data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
