import { MonthlySummary } from "../../../types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

interface Props {
  data: MonthlySummary[];
  isLoading: boolean;
}

export function TransactionMonthlySummary({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent className="h-64 animate-pulse bg-slate-100 rounded-md m-6" />
      </Card>
    );
  }

  const formatCurrency = (val: string) => {
    const num = Number(val);
    if (isNaN(num) || num === 0) return "-";
    if (Math.abs(num) >= 1e9) return `Rp ${(num / 1e9).toFixed(1)}B`;
    if (Math.abs(num) >= 1e6) return `Rp ${(num / 1e6).toFixed(1)}M`;
    return `Rp ${(num / 1000).toFixed(0)}K`;
  };

  // Find max value for relative bar widths
  let maxVal = 1;
  data.forEach(d => {
    const totalIn = Number(d.totalIn);
    const totalOut = Number(d.totalOut);
    if (totalIn > maxVal) maxVal = totalIn;
    if (totalOut > maxVal) maxVal = totalOut;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((m) => {
            const inWidth = Math.max((Number(m.totalIn) / maxVal) * 100, 0);
            const outWidth = Math.max((Number(m.totalOut) / maxVal) * 100, 0);
            
            return (
              <div key={m.month} className="grid grid-cols-[80px_1fr] items-center gap-4">
                <div className="text-sm font-medium text-slate-600 truncate">
                  {m.monthName}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-emerald-500 rounded-sm" style={{ width: `${inWidth}%`, minWidth: inWidth > 0 ? '4px' : '0' }} />
                    <span className="text-xs text-slate-500 w-16">{formatCurrency(m.totalIn)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-red-500 rounded-sm" style={{ width: `${outWidth}%`, minWidth: outWidth > 0 ? '4px' : '0' }} />
                    <span className="text-xs text-slate-500 w-16">{formatCurrency(m.totalOut)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
            <span>Cash In</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span>Cash Out</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
