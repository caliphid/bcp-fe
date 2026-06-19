import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { StatusBadge } from "../../../components/ui/status-badge";
import { AdsReportDetail } from "../../../types/ads";
import { formatCurrency, formatDate } from "../../debts/utils/formatters";
import { cn } from "../../../lib/utils";

interface AdsReportDetailViewProps {
  report: AdsReportDetail;
  canPost: boolean;
  canVoid: boolean;
  onPostClick: () => void;
  onVoidClick: () => void;
}

export function AdsReportDetailView({
  report,
  canPost,
  canVoid,
  onPostClick,
  onVoidClick,
}: AdsReportDetailViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "items" | "transactions">("overview");

  const isLoss = parseFloat(report.netProfit || "0") < 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">
                Laporan Iklan
              </h1>
              <StatusBadge status={report.status} />
            </div>
            <p className="text-slate-500 mt-1">
              {report.reportCode} • {formatDate(report.reportDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {report.status === "DRAFT" && canPost && (
            <Button onClick={onPostClick} className="bg-indigo-600 hover:bg-indigo-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Post Report
            </Button>
          )}
          {report.status === "POSTED" && canVoid && (
            <Button onClick={onVoidClick} variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Void Report
            </Button>
          )}
        </div>
      </div>

      {/* Warning Box for Voided */}
      {report.status === "VOID" && report.voidReason && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
          <h3 className="text-sm font-bold text-rose-800 mb-1">Report Dibatalkan (VOID)</h3>
          <p className="text-sm text-rose-700">Alasan: {report.voidReason}</p>
          {report.voidedBy && (
            <p className="text-xs text-rose-600 mt-1">Dibatalkan oleh: {report.voidedBy.name}</p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "pb-3 text-sm font-medium transition-colors relative",
            activeTab === "overview" ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Overview & Financials
          {activeTab === "overview" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("items")}
          className={cn(
            "pb-3 text-sm font-medium transition-colors relative",
            activeTab === "items" ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Sales Items ({report.items.length})
          {activeTab === "items" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={cn(
            "pb-3 text-sm font-medium transition-colors relative",
            activeTab === "transactions" ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Linked Transactions
          {activeTab === "transactions" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />}
        </button>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 gap-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Financial Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(report.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total HPP</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(report.totalHpp)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Gross Profit</p>
                  <p className="text-xl font-bold text-slate-900">{formatCurrency(report.grossProfit)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Total Ads Cost</p>
                  <p className="text-xl font-bold text-rose-600">{formatCurrency((parseFloat(report.adSpend)+parseFloat(report.platformFee)+parseFloat(report.taxAmount)+parseFloat(report.otherCost)).toString())}</p>
                </div>
                <div className="md:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Net Profit</p>
                  <p className={cn("text-3xl font-bold", isLoss ? "text-rose-600" : "text-emerald-600")}>
                    {formatCurrency(report.netProfit)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">ROAS / Break-Even</p>
                  <p className="text-xl font-bold text-slate-900">{report.roas}x <span className="text-sm font-normal text-slate-500">/ {report.breakEvenRoas}x</span></p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium">Profit Margin</p>
                  <p className="text-xl font-bold text-slate-900">{report.profitMargin}%</p>
                </div>
              </div>

              {/* Cost Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">Rincian Pengeluaran</h3>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-4 text-slate-600">Ad Spend (Belanja Iklan)</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(report.adSpend)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-600">Platform Fee</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(report.platformFee)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-600">Tax / Pajak</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(report.taxAmount)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-600">Other Cost</td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">{formatCurrency(report.otherCost)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Info Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                <h3 className="font-bold text-slate-800 mb-2">Informasi Umum</h3>
                <div>
                  <p className="text-xs text-slate-500">Business Unit</p>
                  <p className="text-sm font-medium text-slate-900">{report.businessUnit.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Ad Platform</p>
                  <p className="text-sm font-medium text-slate-900">{report.platform.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Ad Campaign</p>
                  <p className="text-sm font-medium text-slate-900">{report.campaign ? report.campaign.name : "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Produk / Orders</p>
                  <p className="text-sm font-medium text-slate-900">{report.totalQuantity} pcs / {report.totalOrders} orders</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cost per Order (CPO)</p>
                  <p className="text-sm font-medium text-slate-900">{formatCurrency(report.costPerOrder)}</p>
                </div>
                {report.notes && (
                  <div>
                    <p className="text-xs text-slate-500">Notes</p>
                    <p className="text-sm font-medium text-slate-900">{report.notes}</p>
                  </div>
                )}
              </div>

              {/* Audit */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
                <h3 className="font-bold text-slate-800 mb-2">Audit Trail</h3>
                <div>
                  <p className="text-xs text-slate-500">Dibuat Pada</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(report.createdAt)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Oleh: {report.createdBy?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Terakhir Diupdate</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(report.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "items" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Produk</th>
                    <th className="px-6 py-4 font-medium text-right">Qty</th>
                    <th className="px-6 py-4 font-medium text-right">Orders</th>
                    <th className="px-6 py-4 font-medium text-right">Unit HPP</th>
                    <th className="px-6 py-4 font-medium text-right">Unit Price</th>
                    <th className="px-6 py-4 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.productName}</td>
                      <td className="px-6 py-4 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 text-right">{item.orderCount}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(item.unitHpp)}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(item.unitSellingPrice)}</td>
                      <td className="px-6 py-4 text-right font-medium text-emerald-600">
                        {formatCurrency((item.quantity * parseFloat(item.unitSellingPrice)).toString())}
                      </td>
                    </tr>
                  ))}
                  {report.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Tidak ada item penjualan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Transaction Code</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Account</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.linkedTransactions && report.linkedTransactions.length > 0 ? (
                    report.linkedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs">{tx.transactionCode}</td>
                        <td className="px-6 py-4">{formatDate(tx.transactionDate)}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
                            tx.type === "IN" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          )}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">{tx.account?.name || "-"}</td>
                        <td className={cn("px-6 py-4 text-right font-medium", tx.type === "IN" ? "text-emerald-600" : "text-rose-600")}>
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <StatusBadge status={tx.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        Tidak ada transaksi linked cashflow. Report mungkin belum di-post.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
