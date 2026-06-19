import React from "react";
import { ReceivableAgingBucket } from "@/types/receivable";
import { formatMoney } from "../../utils/formatters";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

interface AgingSummaryProps {
  data: ReceivableAgingBucket[];
  loading: boolean;
}

export function AgingSummary({ data, loading }: AgingSummaryProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle className="bg-slate-200 h-6 w-1/3 rounded"></CardTitle>
        </CardHeader>
        <CardContent className="h-64"></CardContent>
      </Card>
    );
  }

  const bucketLabels: Record<string, string> = {
    NOT_DUE: "Belum Jatuh Tempo",
    "1_TO_30_DAYS": "1-30 Hari",
    "31_TO_60_DAYS": "31-60 Hari",
    "61_TO_90_DAYS": "61-90 Hari",
    OVER_90_DAYS: "> 90 Hari",
  };

  const maxAmount = Math.max(
    ...data.map((d) => parseFloat(d.totalOutstanding)),
    1,
  ); // Avoid div by 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aging Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => {
            const amount = parseFloat(item.totalOutstanding);
            const percentage = (amount / maxAmount) * 100;
            const isOverdue = item.bucket !== "NOT_DUE";

            return (
              <div key={item.bucket} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-slate-600">
                  {bucketLabels[item.bucket] || item.bucket}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${isOverdue ? "bg-rose-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.max(percentage, 1)}%` }} // At least 1% if > 0 so it's visible
                      />
                    </div>
                    <div className="w-28 text-right text-sm font-bold text-slate-700">
                      {formatMoney(amount)}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {item.receivableCount} items
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
