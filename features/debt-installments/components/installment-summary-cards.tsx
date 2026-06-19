import { DebtInstallmentSummaryData } from "../../../types/installment";
import { formatCurrency } from "../utils/formatters";
import { Card, CardContent } from "../../../components/ui/card";
import { ListChecks, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";

interface InstallmentSummaryCardsProps {
  data: DebtInstallmentSummaryData | null;
  loading: boolean;
}

export function InstallmentSummaryCards({ data, loading }: InstallmentSummaryCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Tagihan",
      value: formatCurrency(data.totalAmountDue),
      subtitle: `${data.totalInstallments} Total Cicilan`,
      icon: <ListChecks className="h-5 w-5 text-indigo-500" />,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
    },
    {
      title: "Total Dibayar",
      value: formatCurrency(data.totalAmountPaid),
      subtitle: `${data.paidCount} Lunas, ${data.partialCount} Sebagian`,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      title: "Sisa Tagihan",
      value: formatCurrency(data.totalRemainingAmount),
      subtitle: `${data.pendingCount} Menunggu`,
      icon: <TrendingDown className="h-5 w-5 text-amber-500" />,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      title: "Jatuh Tempo",
      value: data.overdueCount.toString(),
      subtitle: "Perlu tindakan segera",
      icon: <AlertCircle className="h-5 w-5 text-rose-500" />,
      bg: "bg-rose-50",
      color: "text-rose-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <Card key={idx} className="border-slate-100 shadow-sm overflow-hidden group">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${card.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <h3 className={`text-xl font-bold mt-0.5 ${card.color}`}>{card.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
