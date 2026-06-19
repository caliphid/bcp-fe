import React from "react";
import { ReceivableSummaryData } from "@/types/receivable";
import { formatMoney, formatPercent } from "../../utils/formatters";
import { Card, CardContent } from "../../../../components/ui/card";
import { Banknote, AlertCircle, CheckCircle2, TrendingUp, HelpCircle } from "lucide-react";

interface ReceivableSummaryCardsProps {
  data: ReceivableSummaryData | null;
  loading: boolean;
}

export function ReceivableSummaryCards({ data, loading }: ReceivableSummaryCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-slate-50/50">
            <CardContent className="p-6 h-28"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Saldo Pokok",
      value: formatMoney(data.totalPrincipal),
      subtext: `${data.totalReceivableCount} Total Data`,
      icon: <Banknote className="h-6 w-6 text-indigo-500" />,
      color: "bg-indigo-50",
    },
    {
      title: "Total Terkumpul",
      value: formatMoney(data.totalCollected),
      subtext: `${formatPercent(data.collectionProgressPercentage)} Progress`,
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
      color: "bg-emerald-50",
    },
    {
      title: "Total Belum Dibayar",
      value: formatMoney(data.totalOutstanding),
      subtext: `${data.activeCount} Active / ${data.partialCount} Partial`,
      icon: <TrendingUp className="h-6 w-6 text-amber-500" />,
      color: "bg-amber-50",
    },
    {
      title: "Jatuh Tempo",
      value: "-", // API summary only gives overdueCount, but outstanding usually includes overdue.
      subtext: `${data.overdueCount} Tagihan Jatuh Tempo`,
      icon: <AlertCircle className="h-6 w-6 text-rose-500" />,
      color: "bg-rose-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <Card key={idx} className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500">
              {card.subtext}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Additional Stats */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">Lunas</div>
          <div className="font-bold text-slate-700">{data.paidOffCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">Total Dihapuskan (Jumlah)</div>
          <div className="font-bold text-slate-700">{data.writtenOffCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">Total Dihapuskan (Nominal)</div>
          <div className="font-bold text-rose-600">{formatMoney(data.totalWrittenOff)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
          <div className="text-sm text-slate-500">Tingkat Penagihan</div>
          <div className="font-bold text-emerald-600">{formatPercent(data.collectionProgressPercentage)}</div>
        </div>
      </div>
    </div>
  );
}
