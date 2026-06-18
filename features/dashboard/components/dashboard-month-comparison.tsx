import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useMonthComparison } from "../hooks/use-dashboard-widgets";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function DashboardMonthComparison() {
  const { data, loading } = useMonthComparison();

  if (loading) {
    return <div className="h-[200px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (!data) return null;

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
  };

  const GrowthBadge = ({ value }: { value: number | null }) => {
    if (value === null) return <span className="text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">N/A</span>;
    if (value > 0) return (
      <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
        <TrendingUp className="h-3 w-3 mr-1" /> +{value.toFixed(1)}%
      </span>
    );
    if (value < 0) return (
      <span className="inline-flex items-center text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
        <TrendingDown className="h-3 w-3 mr-1" /> {value.toFixed(1)}%
      </span>
    );
    return (
      <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
        <Minus className="h-3 w-3 mr-1" /> 0%
      </span>
    );
  };

  return (
    <Card className="bg-slate-900 text-white border-slate-800 shadow-xl shadow-slate-900/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-medium text-slate-300">Month Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 divide-x divide-slate-800">
          <div className="pr-6">
            <p className="text-sm text-slate-400 mb-1">Total Income</p>
            <p className="text-xl font-bold text-white mb-2">{formatCurrency(data.current.totalIn)}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Prev: {formatCurrency(data.previous.totalIn)}</span>
              <GrowthBadge value={data.growth.totalInGrowthPercentage} />
            </div>
          </div>
          
          <div className="px-6">
            <p className="text-sm text-slate-400 mb-1">Total Expense</p>
            <p className="text-xl font-bold text-white mb-2">{formatCurrency(data.current.totalOut)}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Prev: {formatCurrency(data.previous.totalOut)}</span>
              <GrowthBadge value={data.growth.totalOutGrowthPercentage} />
            </div>
          </div>

          <div className="pl-6">
            <p className="text-sm text-slate-400 mb-1">Net Cashflow</p>
            <p className={`text-xl font-bold mb-2 ${Number(data.current.netCashflow) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(data.current.netCashflow)}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Prev: {formatCurrency(data.previous.netCashflow)}</span>
              <GrowthBadge value={data.growth.netCashflowGrowthPercentage} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
