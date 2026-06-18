import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { useYearlySummary } from "../hooks/use-dashboard-widgets";

export function DashboardYearlySummary() {
  const { data, loading } = useYearlySummary();

  if (loading) {
    return <div className="h-[200px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (!data) return null;

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Yearly Summary ({data.year})</CardTitle>
        <CardDescription>Aggregate statistics for the entire year</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Income</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(data.totalIn)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Avg / Month</p>
              <p className="text-sm font-semibold text-slate-700">{formatCurrency(data.averageMonthlyIn)}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Expense</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(data.totalOut)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Avg / Month</p>
              <p className="text-sm font-semibold text-slate-700">{formatCurrency(data.averageMonthlyOut)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Net Cashflow</p>
              <p className={`text-xl font-bold ${Number(data.netCashflow) >= 0 ? "text-slate-900" : "text-red-600"}`}>
                {formatCurrency(data.netCashflow)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Avg / Month</p>
              <p className="text-sm font-semibold text-slate-700">{formatCurrency(data.averageMonthlyNet)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider mb-1">Best Month</p>
              <p className="text-sm font-bold text-emerald-900">{data.bestMonth.monthName}</p>
              <p className="text-xs text-emerald-600 mt-0.5">{formatCurrency(data.bestMonth.netCashflow)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-medium text-red-700 uppercase tracking-wider mb-1">Worst Month</p>
              <p className="text-sm font-bold text-red-900">{data.worstMonth.monthName}</p>
              <p className="text-xs text-red-600 mt-0.5">{formatCurrency(data.worstMonth.netCashflow)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
