"use client";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { customerReturnsApi } from "../../../../features/customer-returns/api";
import { useAuthStore } from "../../../../store/auth-store";
import { DataTable } from "../../../../components/ui/data-table";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Download, Calendar, BarChart3 } from "lucide-react";
import { formatCurrency } from "../../../../features/debts/utils/formatters";
import { formatDate } from "../../../../lib/utils";

type ReportType = 
  | "monthly"
  | "by-reason" 
  | "by-product"
  | "refunds"
  | "failed-delivery";

export default function CustomerReturnReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("monthly");
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const { token, user } = useAuthStore();
  const isStaff = user?.role === "STAFF_INPUT";

  const { data, isLoading } = useSWR(
    token ? [`/customer-return-reports/${activeReport}`, startDate, endDate] : null,
    ([url, start, end]): Promise<any> => {
      const dateParams = {
        ...(start ? { startDate: start } : {}),
        ...(end ? { endDate: end } : {}),
      };

      switch (activeReport) {
        case "monthly": return customerReturnsApi.getMonthlyReport(dateParams);
        case "by-reason": return customerReturnsApi.getByReasonReport(dateParams);
        case "by-product": return customerReturnsApi.getByProductReport(dateParams);
        case "refunds": return customerReturnsApi.getRefundsReport(dateParams);
        case "failed-delivery": return customerReturnsApi.getFailedDeliveryReport(dateParams);
      }
    }
  );

  let reportData: any = [];
  if (data?.data) {
    if (activeReport === "refunds" && "refunds" in data.data) {
      reportData = data.data.refunds;
    } else if (activeReport === "failed-delivery" && "returns" in data.data) {
      reportData = data.data.returns;
    } else if (Array.isArray(data.data)) {
      reportData = data.data;
    }
  }

  const columns = useMemo(() => {
    switch (activeReport) {
      case "monthly":
        return [
          { header: "Month", cell: (r: any) => r.month },
          { header: "Return Count", cell: (r: any) => r.count },
          ...(!isStaff ? [{ header: "Refunded Amount", cell: (r: any) => formatCurrency(Number(r.refundedAmount || 0)) }] : []),
        ];
      case "by-reason":
        return [
          { header: "Reason", cell: (r: any) => r.reason },
          { header: "Count", cell: (r: any) => r.count },
        ];
      case "by-product":
        return [
          { header: "SKU", cell: (r: any) => r.sku },
          { header: "Product Name", cell: (r: any) => r.productName },
          { header: "Returned Quantity", cell: (r: any) => r.returnedQuantity },
        ];
      case "refunds":
        return [
          { header: "Refund Code", cell: (r: any) => r.refundCode },
          { header: "Refund Date", cell: (r: any) => formatDate(r.refundDate) },
          ...(!isStaff ? [{ header: "Amount", cell: (r: any) => formatCurrency(Number(r.amount || 0)) }] : []),
        ];
      case "failed-delivery":
        return [
          { header: "Return Code", cell: (r: any) => r.returnCode },
          { header: "Date", cell: (r: any) => formatDate(r.returnDate) },
          { header: "Status", cell: (r: any) => r.status },
        ];
      default:
        return [];
    }
  }, [activeReport, isStaff]);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Return Reports</h2>
          <p className="mt-1 text-sm text-slate-500">Analyze customer returns, exchanges, and refund metrics.</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export to Excel
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-64">
          <Label className="mb-2 block">Report Type</Label>
          <select
            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            value={activeReport}
            onChange={(e) => setActiveReport(e.target.value as ReportType)}
          >
            <option value="monthly">Monthly Returns</option>
            <option value="by-reason">Returns by Reason</option>
            <option value="by-product">Returns by Product</option>
            <option value="refunds">Refunds History</option>
            <option value="failed-delivery">Failed Deliveries</option>
          </select>
        </div>
        
        <div className="w-full md:w-48">
          <Label className="mb-2 block">Start Date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        
        <div className="w-full md:w-48">
          <Label className="mb-2 block">End Date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {!isStaff && activeReport === "refunds" && data?.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <h4 className="text-sm font-medium text-slate-500 mb-1">Total Refunds (Period)</h4>
            <div className="text-3xl font-bold text-slate-900">{data.data.count}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <h4 className="text-sm font-medium text-slate-500 mb-1">Total Refunded Value</h4>
            <div className="text-3xl font-bold text-rose-600">{formatCurrency(Number(data.data.totalRefunded || 0))}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 capitalize flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            {activeReport.replace(/-/g, " ")} Report
          </h3>
          <div className="text-sm text-slate-500 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {formatDate(startDate)} - {formatDate(endDate)}
          </div>
        </div>
        
        <DataTable
          columns={columns as any}
          data={reportData}
          isLoading={isLoading}
          emptyMessage="No data available for this report in the selected date range."
        />
      </div>
    </div>
  );
}
