import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { useRecentTransactions } from "../hooks/use-dashboard-widgets";
import { DataTable } from "../../../components/ui/data-table";

export function DashboardRecentTransactions() {
  const { data, loading } = useRecentTransactions();

  if (loading) {
    return <div className="h-[400px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center text-sm text-slate-500">
          No recent transactions
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(val));
  };

  const columns = [
    { 
      header: "Code", 
      cell: (item: any) => <span className="font-mono text-xs">{item.transactionCode}</span>
    },
    { 
      header: "Date", 
      cell: (item: any) => new Date(item.transactionDate).toLocaleDateString()
    },
    { 
      header: "Description", 
      cell: (item: any) => item.description || "-" 
    },
    {
      header: "Type",
      cell: (item: any) => (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
          item.type === "IN" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {item.type}
        </span>
      )
    },
    { 
      header: "Amount", 
      className: "text-right font-medium",
      cell: (item: any) => (
        <span className={item.type === "IN" ? "text-emerald-600" : "text-red-600"}>
          {item.type === "IN" ? "+" : "-"}{formatCurrency(item.amount)}
        </span>
      )
    },
    { 
      header: "Account", 
      cell: (item: any) => item.account?.name || "-" 
    },
    { 
      header: "Category", 
      cell: (item: any) => item.category?.name || "-" 
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest posted transactions</CardDescription>
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
