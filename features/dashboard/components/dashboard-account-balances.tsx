import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { useAccountBalances } from "../hooks/use-dashboard-widgets";
import { DataTable } from "../../../components/ui/data-table";

export function DashboardAccountBalances() {
  const { data, loading } = useAccountBalances();

  if (loading) {
    return <div className="h-[300px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (!data || !data.accounts || data.accounts.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Account Balances</CardTitle></CardHeader>
        <CardContent className="h-[100px] flex items-center justify-center text-sm text-slate-500">
          No accounts found
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(val));
  };

  const columns = [
    { 
      header: "Account", 
      cell: (item: any) => (
        <div>
          <p className="font-medium text-slate-900">{item.accountName}</p>
          <p className="text-xs text-slate-500">{item.accountType}</p>
        </div>
      )
    },
    { 
      header: "Business Unit", 
      cell: (item: any) => item.businessUnit?.name || "-" 
    },
    { 
      header: "Current Balance", 
      className: "text-right font-bold text-slate-900",
      cell: (item: any) => formatCurrency(item.currentBalance)
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Account Balances</CardTitle>
            <CardDescription>Current balance across all active accounts</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Total Balance</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.totalCurrentBalance)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 border-t border-slate-100">
        <DataTable
          data={data.accounts}
          columns={columns}
          isLoading={false}
        />
      </CardContent>
    </Card>
  );
}
