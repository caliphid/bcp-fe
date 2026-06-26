import { Card, CardContent } from "../../../components/ui/card";
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, Target, Wallet, Activity } from "lucide-react";
import { useDashboardOverview } from "../hooks/use-dashboard-widgets";
import { useTranslation } from "../../../hooks/use-translation";

export function DashboardOverviewCards() {
  const { t } = useTranslation();
  const { data, loading } = useDashboardOverview();

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-[104px] bg-slate-100 rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;
  const { summary } = data;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{t("features.dashboard.overview.totalIncome")}</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(summary.totalIn)}</h3>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex items-center">
            <Target className="h-3 w-3 mr-1" />
            {summary.inCount} {t("features.dashboard.overview.transactions")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{t("features.dashboard.overview.totalExpense")}</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(summary.totalOut)}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full text-red-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex items-center">
            <Target className="h-3 w-3 mr-1" />
            {summary.outCount} {t("features.dashboard.overview.transactions")}
          </div>
        </CardContent>
      </Card>

      <Card className="border-indigo-100 shadow-indigo-100/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{t("features.dashboard.overview.netCashflow")}</p>
              <h3 className={`text-2xl font-bold mt-1 ${Number(summary.netCashflow) >= 0 ? "text-slate-900" : "text-red-600"}`}>
                {formatCurrency(summary.netCashflow)}
              </h3>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex items-center">
            <ArrowRightLeft className="h-3 w-3 mr-1" />
            {summary.transactionCount} {t("features.dashboard.overview.transactions")}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{t("features.dashboard.overview.currentBalance")}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {data.accountBalance ? formatCurrency(data.accountBalance.totalCurrentBalance) : "-"}
              </h3>
            </div>
            <div className="bg-amber-100 p-3 rounded-full text-amber-600">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 flex items-center">
            <Target className="h-3 w-3 mr-1" />
            {data.accountBalance ? `${data.accountBalance.activeAccountsCount} ${t("features.dashboard.overview.activeAccounts")}` : t("features.dashboard.overview.noData")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
