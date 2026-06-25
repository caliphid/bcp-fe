"use client";
import { useState, useMemo } from "react";
import useSWR from "swr";
import { purchasingApi } from "../../../../../features/purchasing/api";
import { useAuthStore } from "../../../../../store/auth-store";
import { DataTable } from "../../../../../components/ui/data-table";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { Download, Calendar, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency } from "../../../../../features/debts/utils/formatters";
import { formatDate } from "../../../../../lib/utils";

type ReportType = 
  | "monthly"
  | "vendor" 
  | "product"
  | "outstanding-receipts"
  | "outstanding-payments"
  | "goods-receipts";

export default function PurchaseReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("monthly");
  
  // Date range filters
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
    token ? [`/purchase-reports/${activeReport}`, startDate, endDate] : null,
    ([url, start, end]): Promise<any> => {
      // Map to the appropriate endpoint based on activeReport
      const params = { startDate, endDate };
      switch (activeReport) {
        case "monthly": return purchasingApi.getMonthlyPurchaseReport(params);
        case "vendor": return purchasingApi.getPurchaseByVendorReport(params);
        case "product": return purchasingApi.getPurchaseByProductReport(params);
        case "outstanding-receipts": return purchasingApi.getOutstandingReceiptsReport(params);
        case "outstanding-payments": return purchasingApi.getOutstandingPaymentsReport(params);
        case "goods-receipts": return purchasingApi.getGoodsReceiptsReport(params);
      }
    }
  );

  const reportData = data?.data || [];

  const columns = useMemo(() => {
    switch (activeReport) {
      case "monthly":
        return [
          { header: "Month", cell: (r: any) => r.month },
          { header: "Order Count", cell: (r: any) => r.orderCount },
          ...(!isStaff ? [{ header: "Total Amount", cell: (r: any) => formatCurrency(Number(r.totalAmount || 0)) }] : []),
        ];
      case "vendor":
        return [
          { header: "Vendor Name", cell: (r: any) => r.vendorName },
          { header: "Order Count", cell: (r: any) => r.orderCount },
          ...(!isStaff ? [
            { header: "Total Amount", cell: (r: any) => formatCurrency(Number(r.totalAmount || 0)) },
            { header: "Outstanding Amount", cell: (r: any) => formatCurrency(Number(r.outstandingAmount || 0)) }
          ] : []),
        ];
      case "product":
        return [
          { header: "SKU", cell: (r: any) => r.sku },
          { header: "Ordered Quantity", cell: (r: any) => r.orderedQuantity },
          ...(!isStaff ? [{ header: "Total Cost", cell: (r: any) => formatCurrency(Number(r.totalCost || 0)) }] : []),
        ];
      case "outstanding-receipts":
        return [
          { header: "PO Code", cell: (r: any) => r.purchaseOrderCode },
          { header: "Vendor", cell: (r: any) => r.vendorName },
          { header: "Status", cell: (r: any) => r.status },
          { header: "Outstanding Quantity", cell: (r: any) => <span className="font-bold text-rose-600">{r.outstandingQuantity}</span> },
        ];
      case "outstanding-payments":
        return [
          { header: "PO Code", cell: (r: any) => r.purchaseOrderCode },
          { header: "Vendor", cell: (r: any) => r.vendorName },
          { header: "Payment Status", cell: (r: any) => r.paymentStatus },
          ...(!isStaff ? [{ header: "Outstanding Amount", cell: (r: any) => <span className="font-bold text-rose-600">{formatCurrency(Number(r.outstandingAmount || 0))}</span> }] : []),
        ];
      case "goods-receipts":
        return [
          { header: "GR Code", cell: (r: any) => r.goodsReceiptCode },
          { header: "Receipt Date", cell: (r: any) => formatDate(r.receiptDate) },
          { header: "Vendor", cell: (r: any) => r.vendorName },
          { header: "Status", cell: (r: any) => r.status },
          { header: "Total Quantity", cell: (r: any) => r.totalQuantity },
          ...(!isStaff ? [{ header: "Total Cost", cell: (r: any) => formatCurrency(Number(r.totalCost || 0)) }] : []),
        ];
      default:
        return [];
    }
  }, [activeReport, isStaff]);

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Purchase Reports</h2>
          <p className="mt-1 text-sm text-slate-500">Analyze procurement and supply chain metrics.</p>
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
            <option value="monthly">Monthly Purchases</option>
            <option value="vendor">Purchases by Vendor</option>
            <option value="product">Purchases by Product</option>
            <option value="outstanding-receipts">Outstanding Receipts (Pending Delivery)</option>
            <option value="outstanding-payments">Outstanding Payments (Payables)</option>
            <option value="goods-receipts">Goods Receipt History</option>
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
