import { DollarSign, TrendingUp, Target, ShoppingCart, Percent, FileText } from "lucide-react";
import { AdsSummaryData } from "../../../types/ads";
import { formatCurrency } from "../../debts/utils/formatters";
import { cn } from "../../../lib/utils";

interface AdsSummaryCardsProps {
  data?: AdsSummaryData;
  loading: boolean;
}

export function AdsSummaryCards({ data, loading }: AdsSummaryCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const isLoss = parseFloat(data.netProfit || "0") < 0;

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue),
      icon: <DollarSign className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      title: "Total Ad Spend",
      value: formatCurrency(data.totalAdSpend),
      icon: <Target className="h-5 w-5 text-indigo-600" />,
      bg: "bg-indigo-50",
    },
    {
      title: "Gross Profit",
      value: formatCurrency(data.grossProfit),
      icon: <TrendingUp className="h-5 w-5 text-slate-600" />,
      bg: "bg-slate-50",
    },
    {
      title: "Net Profit",
      value: formatCurrency(data.netProfit),
      icon: <TrendingUp className={cn("h-5 w-5", isLoss ? "text-rose-600" : "text-emerald-600")} />,
      bg: isLoss ? "bg-rose-50" : "bg-emerald-50",
      valueClassName: isLoss ? "text-rose-600" : "text-emerald-600",
    },
    {
      title: "Total Orders",
      value: data.totalOrders.toLocaleString("id-ID"),
      subtitle: `Avg. CPO: ${formatCurrency(data.costPerOrder)}`,
      icon: <ShoppingCart className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      title: "ROAS",
      value: `${(data.roas || 0).toFixed(2)}x`,
      icon: <Target className="h-5 w-5 text-amber-600" />,
      bg: "bg-amber-50",
    },
    {
      title: "Profit Margin",
      value: `${(data.profitMargin || 0).toFixed(1)}%`,
      icon: <Percent className="h-5 w-5 text-purple-600" />,
      bg: "bg-purple-50",
    },
    {
      title: "Total Reports",
      value: data.totalReports.toLocaleString("id-ID"),
      subtitle: `${data.profitableReportCount} Profitable / ${data.lossReportCount} Loss`,
      icon: <FileText className="h-5 w-5 text-slate-600" />,
      bg: "bg-slate-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
