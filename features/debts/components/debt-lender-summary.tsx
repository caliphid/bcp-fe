import { DebtByLenderItem } from "../../../types/debt";
import { formatCurrency } from "../utils/formatters";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

interface DebtLenderSummaryProps {
  data: DebtByLenderItem[];
  loading: boolean;
}

export function DebtLenderSummary({ data, loading }: DebtLenderSummaryProps) {
  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm animate-pulse">
        <div className="h-64 bg-slate-100" />
      </Card>
    );
  }

  if (data.length === 0) return null;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm text-slate-700">Debt by Lender</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-slate-800 text-sm">{item.lenderName}</p>
                <p className="text-xs text-slate-500">{item.debtCount} Hutang</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-900 text-sm">{formatCurrency(item.totalCurrentBalance)}</p>
                <h3 className="text-sm font-bold text-slate-800 mb-4 px-1">Sisa Hutang per Kreditur</h3>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
