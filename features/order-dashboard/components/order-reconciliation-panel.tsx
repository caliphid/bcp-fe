import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useTranslation } from "../../../hooks/use-translation";
import { OrderDashboardReconciliationResponse } from "../../../types/order-dashboard";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface OrderReconciliationPanelProps {
  data: OrderDashboardReconciliationResponse['data'] | undefined;
  loading: boolean;
}

export function OrderReconciliationPanel({ data, loading }: OrderReconciliationPanelProps) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="h-12 bg-slate-100 border-b border-slate-50" />
        <CardContent className="h-32 bg-slate-50" />
      </Card>
    );
  }

  if (!data) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const differences = [
    { label: t("orderDashboard.reconciliationPanel.grossSalesDifference"), value: data.grossSalesDifference },
    { label: t("orderDashboard.reconciliationPanel.cogsDifference"), value: data.cogsDifference },
    { label: "Channel Gross Sales Difference", value: data.channelGrossSalesDifference },
    { label: "Channel COGS Difference", value: data.channelCogsDifference },
    { label: "Channel Ads Cost Difference", value: data.channelAdsCostDifference },
    { label: t("orderDashboard.reconciliationPanel.refundDifference"), value: data.refundDifference },
  ];

  const hasMismatch = differences.some(d => d.value !== 0);

  return (
    <Card className={`h-full flex flex-col ${hasMismatch ? "border-amber-200" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Reconciliation Status</span>
          {hasMismatch ? (
            <span className="flex items-center text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
              <AlertCircle className="w-4 h-4 mr-1" />
              Mismatch Detected
            </span>
          ) : (
            <span className="flex items-center text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Fully Reconciled
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {hasMismatch && (
          <div className="text-xs text-amber-700 mb-4 bg-amber-50 p-2 rounded">
            Reported difference between summary totals and grouped row totals. The system displays this as-is and does not automatically adjust figures.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {differences.map((diff, index) => (
            <div key={index} className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm font-medium text-slate-600">{diff.label}</span>
              <span className={`text-base font-bold ${diff.value !== 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {formatCurrency(diff.value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
