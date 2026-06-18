import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { useTopExpenses, useTopIncomeSources } from "../hooks/use-dashboard-widgets";

const formatCurrency = (val: string) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(val));
};

function TopList({ data, title, isExpense }: { data: any[], title: string, isExpense: boolean }) {
  if (!data || data.length === 0) {
    return (
      <Card className="flex-1">
        <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center text-sm text-slate-500">
          No transactions found
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Highest value transactions</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {data.slice(0, 5).map((item) => (
            <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.description || item.categoryName}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded">{item.categoryName}</span>
                  <span className="truncate">{item.accountName}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${isExpense ? "text-red-600" : "text-emerald-600"}`}>
                  {isExpense ? "-" : "+"}{formatCurrency(item.amount)}
                </p>
                <p className="text-xs text-slate-400 mt-1">{new Date(item.transactionDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardTopTransactions() {
  const { data: expenses, loading: expensesLoading } = useTopExpenses();
  const { data: incomes, loading: incomesLoading } = useTopIncomeSources();

  if (expensesLoading || incomesLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-6">
        <div className="h-[400px] flex-1 bg-slate-100 rounded-lg animate-pulse" />
        <div className="h-[400px] flex-1 bg-slate-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-stretch">
      <TopList data={expenses || []} title="Top Expenses" isExpense={true} />
      <TopList data={incomes || []} title="Top Income Sources" isExpense={false} />
    </div>
  );
}
