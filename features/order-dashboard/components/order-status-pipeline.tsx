import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useTranslation } from "../../../hooks/use-translation";
import { OrderDashboardStatusPipelineResponse } from "../../../types/order-dashboard";

interface OrderStatusPipelineProps {
  data?: OrderDashboardStatusPipelineResponse['data'];
  loading: boolean;
}

export function OrderStatusPipeline({ data, loading }: OrderStatusPipelineProps) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="h-12 bg-slate-100 border-b border-slate-50" />
        <CardContent className="h-48 bg-slate-50" />
      </Card>
    );
  }

  if (!data) return null;

  const renderStatusGroup = (title: string, statusObj: Record<string, number>, colorClass: string) => {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
        <div className="space-y-2">
          {Object.entries(statusObj).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <span className="text-slate-600 truncate mr-2" title={status}>
                {status === "UNCREATED" ? t("orderDashboard.statusPipeline.notYetProcessed") : status}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-medium text-xs ${colorClass}`}>
                {count}
              </span>
            </div>
          ))}
          {Object.keys(statusObj).length === 0 && (
            <span className="text-xs text-slate-400">{t("orderDashboard.statusPipeline.noData")}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("orderDashboard.statusPipeline.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderStatusGroup(t("orderDashboard.statusPipeline.orderStatus"), data.orderStatus, "bg-indigo-50 text-indigo-700")}
          {renderStatusGroup(t("orderDashboard.statusPipeline.paymentStatus"), data.paymentStatus, "bg-emerald-50 text-emerald-700")}
          {renderStatusGroup(t("orderDashboard.statusPipeline.shipmentStatus"), data.shipmentStatus, "bg-blue-50 text-blue-700")}
          {renderStatusGroup(t("orderDashboard.statusPipeline.settlementStatus"), data.settlementStatus, "bg-amber-50 text-amber-700")}
        </div>
      </CardContent>
    </Card>
  );
}
