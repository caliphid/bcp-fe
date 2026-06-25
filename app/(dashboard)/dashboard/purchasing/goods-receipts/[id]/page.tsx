"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGoodsReceipt } from "../../../../../../features/purchasing/hooks/use-purchasing";
import { purchasingApi } from "../../../../../../features/purchasing/api";
import { GoodsReceiptStatus } from "../../../../../../features/purchasing/types";
import { useAuthStore } from "../../../../../../store/auth-store";
import { extractErrorMessage } from "../../../../../../lib/error";
import { Button } from "../../../../../../components/ui/button";
import { Alert, AlertDescription } from "../../../../../../components/ui/alert";
import { PageHeader } from "../../../../../../components/ui/page-header";
import { ConfirmDialog } from "../../../../../../components/ui/confirm-dialog";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "../../../../../../features/debts/utils/formatters";
import { formatDate } from "../../../../../../lib/utils";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GoodsReceiptDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.role === "OWNER";
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const isStaff = user?.role === "STAFF_INPUT";

  const { data: gr, isLoading, error, mutate } = useGoodsReceipt(id);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    showInput?: boolean;
    reason: string;
    action: (reason?: string) => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    reason: "",
    action: async () => {},
  });

  const handleAction = (
    title: string,
    message: string,
    action: (reason?: string) => Promise<any>,
    showInput: boolean = false
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      showInput,
      reason: "",
      action: async (reason?: string) => {
        try {
          await action(reason);
          toast.success(`${title} successful!`);
          mutate();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error(extractErrorMessage(err));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading goods receipt...</div>;
  if (error || !gr) {
    return (
      <div className="p-8 text-center text-red-500">
        {extractErrorMessage(error) || "Goods receipt not found"}
      </div>
    );
  }

  const getStatusBadge = (status: GoodsReceiptStatus) => {
    let bg = "bg-slate-100 text-slate-800";
    switch (status) {
      case GoodsReceiptStatus.DRAFT: bg = "bg-slate-100 text-slate-800"; break;
      case GoodsReceiptStatus.POSTED: bg = "bg-emerald-100 text-emerald-800"; break;
      case GoodsReceiptStatus.VOID: bg = "bg-rose-100 text-rose-800"; break;
    }
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}>{status.replace(/_/g, " ")}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/purchasing/goods-receipts" 
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <PageHeader 
            title={gr.goodsReceiptCode} 
            description={`Goods Receipt Details`}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {canMutate && gr.status === GoodsReceiptStatus.DRAFT && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              onClick={() => handleAction("Post Receipt", "Are you sure you want to post this receipt? Stock will be updated.", () => purchasingApi.postGoodsReceipt(id))}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Post (Update Stock)
            </Button>
          )}

          {isOwner && gr.status === GoodsReceiptStatus.POSTED && (
            <Button
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              onClick={() => handleAction("Void Receipt", "Please provide a reason for voiding. Stock will be reverted.", (reason) => purchasingApi.voidGoodsReceipt(id, reason!), true)}
            >
              <XCircle className="w-4 h-4 mr-2" /> Void
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">General Information</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status</p>
                <div>{getStatusBadge(gr.status)}</div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Receipt Date</p>
                <p className="font-medium text-slate-800">{formatDate(gr.receiptDate)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Purchase Order</p>
                <Link href={`/dashboard/purchasing/purchase-orders/${gr.purchaseOrder?.id}`} className="font-semibold text-primary-600 hover:underline">
                  {gr.purchaseOrder?.purchaseOrderCode}
                </Link>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Vendor</p>
                <p className="font-medium text-slate-800">{gr.vendor?.name}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Vendor Delivery / SJ</p>
                <p className="font-medium text-slate-800">{gr.vendorDeliveryNumber || "-"}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Create Debt?</p>
                <p className="font-medium text-slate-800">{gr.createDebt ? "Yes" : "No"}</p>
              </div>
            </div>
            
            {gr.notes && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{gr.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Received Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Item</th>
                    <th className="px-4 py-3 text-center">Received</th>
                    <th className="px-4 py-3 text-center text-emerald-600">Accepted</th>
                    <th className="px-4 py-3 text-center text-rose-600">Rejected</th>
                    {!isStaff && <th className="px-4 py-3 text-right">Unit Cost</th>}
                    {!isStaff && <th className="px-4 py-3 text-right rounded-tr-lg">Line Total</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gr.items?.map((item: any) => {
                    const variant = item.productVariant || item.purchaseOrderItem?.productVariant;
                    const product = variant?.product || item.product || item.purchaseOrderItem?.product;
                    const productName = product?.name || variant?.sku || "Unknown Product";
                    const sku = variant?.sku || "Unknown SKU";
                    
                    const attrs = [];
                    if (variant?.color) attrs.push(variant.color);
                    if (variant?.size) attrs.push(variant.size);
                    const attrStr = attrs.length > 0 ? attrs.join(" • ") : null;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">{productName}</div>
                          <div className="text-xs text-slate-600 font-mono mt-0.5">{sku}</div>
                          {attrStr && <div className="text-[11px] text-slate-500 mt-1">{attrStr}</div>}
                        </td>
                        <td className="px-4 py-4 text-center font-medium">{item.receivedQuantity}</td>
                        <td className="px-4 py-4 text-center font-bold text-emerald-600">{item.acceptedQuantity}</td>
                        <td className="px-4 py-4 text-center font-bold text-rose-600">{item.rejectedQuantity}</td>
                        {!isStaff && <td className="px-4 py-4 text-right text-slate-600">{formatCurrency(Number(item.unitCost || 0))}</td>}
                        {!isStaff && <td className="px-4 py-4 text-right font-medium text-slate-900">{formatCurrency(Number(item.lineTotal || 0))}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Totals */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Items Received</span>
                <span className="font-medium text-slate-900">{gr.totalQuantity}</span>
              </div>
              
              {!isStaff && (
                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <span className="font-bold text-slate-900">Total Value</span>
                  <span className="font-bold text-primary-700 text-lg">{formatCurrency(Number(gr.totalCost || 0))}</span>
                </div>
              )}
            </div>

            {gr.createDebt && gr.debtId && (
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-900">Linked Debt Created</span>
                </div>
                <div className="mt-4">
                  <Link href={`/dashboard/debts/${gr.debtId}`}>
                    <Button variant="outline" className="w-full">View Linked Debt</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => confirmDialog.action(confirmDialog.reason)}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      >
        {confirmDialog.showInput && (
          <div className="mt-4">
            <textarea
              className="w-full h-20 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter reason (min 3 characters)..."
              value={confirmDialog.reason}
              onChange={(e) => setConfirmDialog(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}
