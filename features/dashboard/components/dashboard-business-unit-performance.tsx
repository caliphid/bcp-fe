import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { useBusinessUnitPerformance } from "../hooks/use-dashboard-widgets";
import { DataTable } from "../../../components/ui/data-table";

export function DashboardBusinessUnitPerformance() {
  const { data, loading } = useBusinessUnitPerformance();

  if (loading) {
    return <div className="h-[300px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Business Unit Performance</CardTitle></CardHeader>
        <CardContent className="h-[100px] flex items-center justify-center text-sm text-slate-500">
          No business unit data
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
  };

  const columns = [
    { 
      header: "Business Unit", 
      cell: (item: any) => (
        <span className="font-medium text-slate-900">
          {item.businessUnitName || "Global / Unassigned"}
        </span>
      )
    },
    { 
      header: "Total Income", 
      className: "text-right",
      cell: (item: any) => <span className="text-emerald-600">{formatCurrency(item.totalIn)}</span>
    },
    { 
      header: "Total Expense", 
      className: "text-right",
      cell: (item: any) => <span className="text-red-600">{formatCurrency(item.totalOut)}</span>
    },
    { 
      header: "Net Cashflow", 
      className: "text-right font-bold",
      cell: (item: any) => (
        <span className={Number(item.netCashflow) >= 0 ? "text-slate-900" : "text-red-600"}>
          {formatCurrency(item.netCashflow)}
        </span>
      )
    },
    { 
      header: "Transactions", 
      className: "text-right text-slate-500",
      cell: (item: any) => item.transactionCount 
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Business Unit Performance</CardTitle>
        <CardDescription>Income and expense breakdown by BU</CardDescription>
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
