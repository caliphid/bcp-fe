import { useQuery } from "@tanstack/react-query";
import { orderDashboardApi } from "../api";
import { useOrderDashboardStore } from "../store/order-dashboard-store";
import { useTranslation } from "../../../hooks/use-translation";
import { OrderDashboardFilterBar } from "./order-dashboard-filter-bar";
import { OrderDashboardOverviewCards } from "./order-dashboard-overview-cards";
import { OrderStatusPipeline } from "./order-status-pipeline";
import { OrderReconciliationPanel } from "./order-reconciliation-panel";
import { OrderDailyTrendChart } from "./order-daily-trend-chart";
import { OrderMonthlyReportTable } from "./order-monthly-report-table";
import { OrderDrilldowns } from "./order-drilldowns";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function OrderDashboardView() {
  const { filters } = useOrderDashboardStore();
  const { t } = useTranslation();
  
  // Validation for date range (max 93 days for overview, 366 for trend) is usually handled by the API returning an error,
  // but we can also display it in the UI if needed. Here we let React Query fetch and handle errors.
  
  const queryParams = { ...filters };

  const { 
    data: overviewData, 
    isLoading: overviewLoading, 
    error: overviewError 
  } = useQuery({
    queryKey: ["order-dashboard-overview", queryParams],
    queryFn: () => orderDashboardApi.getOverview(queryParams),
    retry: false
  });

  const { data: pipelineData, isLoading: pipelineLoading } = useQuery({
    queryKey: ["order-dashboard-pipeline", queryParams],
    queryFn: () => orderDashboardApi.getStatusPipeline(queryParams)
  });

  const { data: reconciliationData, isLoading: reconciliationLoading } = useQuery({
    queryKey: ["order-dashboard-reconciliation", queryParams],
    queryFn: () => orderDashboardApi.getReconciliation(queryParams)
  });

  const { data: dailyTrendData, isLoading: dailyTrendLoading, error: dailyTrendError } = useQuery({
    queryKey: ["order-dashboard-daily-trend", queryParams],
    queryFn: () => orderDashboardApi.getDailyTrend(queryParams),
    retry: false
  });

  const { data: monthlyReportData, isLoading: monthlyReportLoading } = useQuery({
    queryKey: ["order-dashboard-monthly-report", queryParams],
    queryFn: () => orderDashboardApi.getMonthlyReport(queryParams)
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("orderDashboard.title")}</h2>
          <p className="text-slate-500 mt-1">{t("orderDashboard.subtitle")}</p>
        </div>
      </div>

      <OrderDashboardFilterBar />

      {overviewError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("orderDashboard.errorLoadingOverview")}</AlertTitle>
          <AlertDescription>
            {(overviewError as ApiError)?.response?.data?.message || overviewError.message || t("orderDashboard.errorLoadingOverviewDesc")}
          </AlertDescription>
        </Alert>
      )}

      <OrderDashboardOverviewCards data={overviewData?.data} loading={overviewLoading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {dailyTrendError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("orderDashboard.errorLoadingDailyTrend")}</AlertTitle>
              <AlertDescription>
                {(dailyTrendError as ApiError)?.response?.data?.message || dailyTrendError.message || t("orderDashboard.errorLoadingDailyTrendDesc")}
              </AlertDescription>
            </Alert>
          ) : (
            <OrderDailyTrendChart data={dailyTrendData?.data} loading={dailyTrendLoading} />
          )}
        </div>
        <div className="lg:col-span-1">
          <OrderReconciliationPanel data={reconciliationData?.data} loading={reconciliationLoading} />
        </div>
      </div>

      <OrderStatusPipeline data={pipelineData?.data} loading={pipelineLoading} />

      <OrderMonthlyReportTable data={monthlyReportData?.data} loading={monthlyReportLoading} />

      <OrderDrilldowns />
      
    </div>
  );
}
