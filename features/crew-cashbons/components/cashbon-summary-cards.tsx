import { Users, Banknote, Target, FileWarning, Wallet, TrendingUp } from "lucide-react";
import { CashbonSummaryData } from "../../../types/crew-cashbon";
import { formatCurrency } from "../../debts/utils/formatters";
import { cn } from "../../../lib/utils";

interface CashbonSummaryCardsProps {
  data?: CashbonSummaryData;
  loading: boolean;
}

export function CashbonSummaryCards({ data, loading }: CashbonSummaryCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Sisa Outstanding",
      value: formatCurrency(data.totalOutstanding),
      icon: <Wallet className="h-5 w-5 text-indigo-600" />,
      bg: "bg-indigo-50",
      valueClassName: "text-indigo-700",
    },
    {
      title: "Total Terbayar",
      value: formatCurrency(data.totalPaid),
      subtitle: `${data.repaymentProgressPercentage.toFixed(1)}% dari Total Pokok`,
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "Total Pokok",
      value: formatCurrency(data.totalPrincipal),
      icon: <Banknote className="h-5 w-5 text-slate-600" />,
      bg: "bg-slate-50",
    },
    {
      title: "Avg. Cashbon per Transaksi",
      value: formatCurrency(data.averageCashbonAmount),
      icon: <Target className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: "Total Cashbon",
      value: data.totalCashbonCount.toLocaleString("id-ID"),
      subtitle: `${data.activeCount} Aktif / ${data.partialCount} Cicil / ${data.paidOffCount} Lunas`,
      icon: <Users className="h-5 w-5 text-slate-600" />,
      bg: "bg-slate-50",
    },
    {
      title: "Overdue (Jatuh Tempo)",
      value: data.overdueCount.toLocaleString("id-ID"),
      icon: <FileWarning className="h-5 w-5 text-rose-600" />,
      bg: "bg-rose-50",
      valueClassName: data.overdueCount > 0 ? "text-rose-600" : "text-slate-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <h3 className={cn("text-2xl font-bold mt-1 text-slate-900", card.valueClassName)}>
                {card.value}
              </h3>
              {card.subtitle && (
                <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
              )}
            </div>
            <div className={cn("p-2 rounded-xl", card.bg)}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
