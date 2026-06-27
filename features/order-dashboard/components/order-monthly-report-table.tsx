import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useTranslation } from "../../../hooks/use-translation";
import { OrderDashboardMonthlyReportResponse } from "../../../types/order-dashboard";

interface OrderMonthlyReportTableProps {
  data?: OrderDashboardMonthlyReportResponse['data'];
  loading: boolean;
}

export function OrderMonthlyReportTable({ data, loading }: OrderMonthlyReportTableProps) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="h-12 bg-slate-100 border-b border-slate-50" />
        <CardContent className="h-64 bg-slate-50" />
      </Card>
    );
  }

  if (!data) return null;

  const { rows, currency } = data;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: currency || 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Monthly Sales Report</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {rows.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No monthly report data available for the selected period.
          </div>
        ) : (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("orderDashboard.monthlyReport.month")}</th>
                <th className="px-4 py-3 font-semibold text-right">{t("orderDashboard.monthlyReport.orders")}</th>
                <th className="px-4 py-3 font-semibold text-right">{t("orderDashboard.monthlyReport.completed")}</th>
                <th className="px-4 py-3 font-semibold text-right">{t("orderDashboard.monthlyReport.cancelled")}</th>
                <th className="px-4 py-3 font-semibold text-right">{t("orderDashboard.monthlyReport.grossSales")}</th>
                <th className="px-4 py-3 font-semibold text-right">Discount</th>
                <th className="px-4 py-3 font-semibold text-right">Total Refund</th>
                <th className="px-4 py-3 font-semibold text-right">{t("orderDashboard.monthlyReport.netSales")}</th>
                <th className="px-4 py-3 font-semibold text-right">{t("orderDashboard.monthlyReport.cogs")}</th>
                <th className="px-4 py-3 font-semibold text-right">{t("orderDashboard.monthlyReport.grossProfit")}</th>
                <th className="px-4 py-3 font-semibold text-right">Eff. Market Fee</th>
                <th className="px-4 py-3 font-semibold text-right">{t("orderDashboard.monthlyReport.adsCost")}</th>
                <th className="px-4 py-3 font-semibold text-right text-indigo-700">{t("orderDashboard.monthlyReport.netSalesProfit")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{row.month}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{formatNumber(row.orderCount)}</td>
                  <td className="px-4 py-3 text-right text-emerald-600">{formatNumber(row.completedOrderCount)}</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatNumber(row.cancelledOrderCount)}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.grossSales)}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.discountAmount)}</td>
                  <td className="px-4 py-3 text-right text-red-600">{formatCurrency(row.totalRefundAmount)}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(row.netSales)}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.cogs)}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(row.grossProfit)}</td>
                  <td className="px-4 py-3 text-right text-amber-700" title={`Variance: ${formatCurrency(row.feeVariance)}`}>
                    {formatCurrency(row.effectiveMarketplaceFee)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(row.adsCost)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${row.netSalesProfit >= 0 ? 'text-indigo-700' : 'text-red-600'}`}>
                    {formatCurrency(row.netSalesProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
