import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  ShoppingCart,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  RefreshCcw,
} from "lucide-react";
import { OrderDashboardOverviewResponse } from "../../../types/order-dashboard";
import { useTranslation } from "../../../hooks/use-translation";

interface OrderDashboardOverviewCardsProps {
  data?: OrderDashboardOverviewResponse["data"];
  loading: boolean;
}

export function OrderDashboardOverviewCards({
  data,
  loading,
}: OrderDashboardOverviewCardsProps) {
  const { t } = useTranslation();

  const formatCurrency = (val: number, currency: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("id-ID").format(val || 0);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-[120px] bg-slate-100 rounded-lg" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { summary, currency, attentionRequired } = data;

  return (
    <div className="space-y-6">
      {/* Attention Required Warnings */}
      {(attentionRequired.missingCostSnapshots > 0 ||
        attentionRequired.unsettledMarketplaceOrders > 0 ||
        attentionRequired.failedDeliveryReturns > 0 ||
        attentionRequired.reconciliationMismatch) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-red-800 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {t("orderDashboard.overview.attentionRequired")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-red-700 space-y-1">
              {attentionRequired.missingCostSnapshots > 0 && (
                <li>
                  • {attentionRequired.missingCostSnapshots}{" "}
                  {t("orderDashboard.overview.missingCogs")}
                </li>
              )}
              {attentionRequired.unsettledMarketplaceOrders > 0 && (
                <li>
                  • {attentionRequired.unsettledMarketplaceOrders}{" "}
                  {t("orderDashboard.overview.unsettledOrders")}
                </li>
              )}
              {attentionRequired.failedDeliveryReturns > 0 && (
                <li>
                  • {attentionRequired.failedDeliveryReturns}{" "}
                  {t("orderDashboard.overview.failedDeliveryReturns")}
                </li>
              )}
              {attentionRequired.reconciliationMismatch && (
                <li>• {t("orderDashboard.overview.reconciliationMismatch")}</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium text-slate-500"
                  title={`Basis: ${data.bookedSalesBasis}`}
                >
                  {t("orderDashboard.overview.bookedSales")}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {formatCurrency(summary.bookedSales, currency)}
                </h3>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              {formatNumber(summary.totalOrders)}{" "}
              {t("orderDashboard.overview.orders")} (
              {summary.cancellationRate || "0"}%{" "}
              {t("orderDashboard.overview.cancelled")})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium text-slate-500"
                  title={`Basis: ${data.completedSalesBasis}`}
                >
                  {t("orderDashboard.overview.completedSales")}
                </p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatCurrency(summary.completedSales, currency)}
                </h3>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                <PackageCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              {formatNumber(summary.completedOrders)}{" "}
              {t("orderDashboard.overview.orders")} (
              {summary.fulfillmentRate || "0"}%{" "}
              {t("orderDashboard.overview.fulfilled")})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {t("orderDashboard.overview.grossProfit")}
                </p>
                <h3 className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(summary.grossProfit, currency)}
                </h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500 flex justify-between">
              <span>
                {t("orderDashboard.overview.cogs")}:{" "}
                {formatCurrency(summary.cogs, currency)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-emerald-100/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium text-slate-500"
                  title={`Fee Resolution: ${data.feeResolutionMode}`}
                >
                  {t("orderDashboard.overview.netSalesProfit")}
                </p>
                <h3
                  className={`text-2xl font-bold mt-1 ${summary.netSalesProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}
                >
                  {formatCurrency(summary.netSalesProfit, currency)}
                </h3>
              </div>
              <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
                <RefreshCcw className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              {t("orderDashboard.overview.coverage")}:{" "}
              {summary.settlementCoverageRate || "0"}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 text-xs text-slate-400 bg-slate-50 p-2 rounded-md">
        <span>
          <strong>{t("orderDashboard.overview.timezone")}:</strong>{" "}
          {data.timezone}
        </span>
        <span>|</span>
        <span>
          <strong>{t("orderDashboard.overview.snapshotReady")}:</strong>{" "}
          {data.snapshotReady
            ? t("orderDashboard.overview.yes")
            : t("orderDashboard.overview.no")}
        </span>
        <span>|</span>
        <span>
          <strong>{t("orderDashboard.overview.dateRange")}:</strong>{" "}
          {data.period.dateFrom} - {data.period.dateTo}
        </span>
      </div>
    </div>
  );
}
