import { TransactionSummary } from "../../../types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet, Activity } from "lucide-react";

interface Props {
  summary: TransactionSummary | null | undefined;
  isLoading: boolean;
}

export function TransactionSummaryCards({ summary, isLoading }: Props) {
  const formatCurrency = (val: string | undefined) => {
    if (!val) return "Rp 0";
    const num = Number(val);
    return isNaN(num) ? "Rp 0" : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  if (isLoading || !summary) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
              <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-3/4 bg-slate-200 rounded mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Net Cashflow</CardTitle>
          <Wallet className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${Number(summary.netCashflow) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(summary.netCashflow)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total In - Total Out
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total In</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalIn)}</div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.inCount} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Out</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOut)}</div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.outCount} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Transactions</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{summary.transactionCount}</div>
          <p className="text-xs text-slate-500 mt-1">
            Posted transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
