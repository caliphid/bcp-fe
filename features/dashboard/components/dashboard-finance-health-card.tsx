import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useFinanceHealth } from "../hooks/use-dashboard-widgets";
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle } from "lucide-react";

export function DashboardFinanceHealthCard() {
  const { data, loading } = useFinanceHealth();

  if (loading) {
    return <div className="h-[200px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (!data) return null;

  const getStatusConfig = () => {
    switch (data.status) {
      case "HEALTHY":
        return { color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: ShieldCheck };
      case "WARNING":
        return { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: AlertTriangle };
      case "DANGER":
        return { color: "text-red-600", bg: "bg-red-50 border-red-200", icon: ShieldAlert };
      default:
        return { color: "text-slate-600", bg: "bg-slate-50 border-slate-200", icon: Shield };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className={`border ${config.bg} shadow-sm`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
          Finance Health Indicator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-white shadow-sm ${config.color}`}>
            <Icon className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${config.color} capitalize`}>{data.status.toLowerCase()}</h3>
            <p className="text-sm text-slate-600 mt-1">{data.message}</p>
            
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="bg-white px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Net Cashflow</span>
                <span className={data.netCashflowStatus === "POSITIVE" ? "text-emerald-600" : "text-red-600"}>
                  {data.netCashflowStatus}
                </span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Expense Ratio</span>
                <span className="text-slate-700">{typeof data.expenseRatio === 'number' ? data.expenseRatio.toFixed(1) + '%' : '-'}</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-100">
                <span className="text-slate-400 block mb-0.5">In/Out Ratio</span>
                <span className="text-slate-700">{typeof data.incomeToExpenseRatio === 'number' ? data.incomeToExpenseRatio.toFixed(2) + 'x' : '-'}</span>
              </div>
            </div>

            {data.warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                {data.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-600 bg-red-50/50 p-2 rounded">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{w.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
