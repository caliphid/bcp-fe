import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { useRecentTransactions } from "../hooks/use-dashboard-widgets";
import { DataTable } from "../../../components/ui/data-table";
import { useTranslation } from "../../../hooks/use-translation";

export function DashboardRecentTransactions() {
  const { t } = useTranslation();
  const { data, loading } = useRecentTransactions();

  if (loading) {
    return <div className="h-[400px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>{t("features.dashboard.recentTx.title")}</CardTitle></CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center text-sm text-slate-500">
          {t("features.dashboard.recentTx.noData")}
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(val));
  };

  const columns = [
    {
      header: t("features.dashboard.recentTx.colCode"),
      cell: (item: any) => <span className="font-mono text-xs">{item.transactionCode}</span>
    },
    {
      header: t("features.dashboard.recentTx.colDate"),
      cell: (item: any) => new Date(item.transactionDate).toLocaleDateString()
    },
    {
      header: t("features.dashboard.recentTx.colDescription"),
      cell: (item: any) => item.description || "-"
    },
    {
      header: t("features.dashboard.recentTx.colType"),
      cell: (item: any) => (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
          item.type === "IN" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {item.type}
        </span>
      )
    },
    {
      header: t("features.dashboard.recentTx.colAmount"),
      className: "text-right font-medium",
      cell: (item: any) => (
        <span className={item.type === "IN" ? "text-emerald-600" : "text-red-600"}>
          {item.type === "IN" ? "+" : "-"}{formatCurrency(item.amount)}
        </span>
      )
    },
    {
      header: t("features.dashboard.recentTx.colAccount"),
      cell: (item: any) => item.account?.name || "-"
    },
    {
      header: t("features.dashboard.recentTx.colCategory"),
      cell: (item: any) => item.category?.name || "-"
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>{t("features.dashboard.recentTx.title")}</CardTitle>
        <CardDescription>{t("features.dashboard.recentTx.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 border-t border-slate-100">
        <DataTable
          data={data}
          columns={columns}
          isLoading={false}
        />
      </CardContent>
    </Card>
  );
}
