import { Wallet, TrendingUp, ArrowRightLeft, DollarSign } from "lucide-react";
import { MonthlyOverviewResponse } from "../../../types/finance";

interface MonthlyOverviewSummaryCardsProps {
  data?: MonthlyOverviewResponse;
  loading: boolean;
}

export function MonthlyOverviewSummaryCards({
  data,
  loading,
}: MonthlyOverviewSummaryCardsProps) {
  const formatMoney = (val?: string) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(val));
  };

  const cards = [
    {
      title: "Total Pendapatan",
      value: formatMoney(data?.profitability.revenue),
      icon: <DollarSign className="h-6 w-6 text-indigo-600" />,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      description: "Pendapatan dari penjualan kotor",
    },
    {
      title: "Laba Bersih",
      value: formatMoney(data?.profitability.netProfit),
      icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      description: "Pendapatan dikurangi HPP & beban",
    },
    {
      title: "Net Cashflow",
      value: formatMoney(data?.cashPosition.netCashflow),
      icon: <ArrowRightLeft className="h-6 w-6 text-amber-600" />,
      bg: "bg-amber-50",
      border: "border-amber-100",
      description: "Total uang masuk dikurangi uang keluar",
    },
    {
      title: "Saldo Akhir",
      value: formatMoney(data?.cashPosition.closingBalance),
      icon: <Wallet className="h-6 w-6 text-blue-600" />,
      bg: "bg-blue-50",
      border: "border-blue-100",
      description: "Posisi saldo pada akhir bulan",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-slate-100 animate-pulse rounded-2xl border border-slate-200"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-2xl border ${card.border} bg-white p-5 shadow-sm transition-all hover:shadow-md`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${card.bg}`}>{card.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {card.value}
              </h3>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500">{card.description}</div>
        </div>
      ))}
    </div>
  );
}
