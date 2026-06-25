"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerReturn } from "../../../../../features/customer-returns/hooks/use-customer-returns";
import { customerReturnsApi } from "../../../../../features/customer-returns/api";
import { CustomerReturnStatus, CustomerReturnType, ReturnShipmentStatus, RefundStatus } from "../../../../../features/customer-returns/types";
import { useAuthStore } from "../../../../../store/auth-store";
import { extractErrorMessage } from "../../../../../lib/error";
import { Button } from "../../../../../components/ui/button";
import { PageHeader } from "../../../../../components/ui/page-header";
import { ConfirmDialog } from "../../../../../components/ui/confirm-dialog";
import { ReturnStatusBadge, ReturnTypeBadge, ShipmentStatusBadge, ResolutionTypeBadge, ItemConditionBadge } from "../../../../../features/customer-returns/components/status-badge";
import { ArrowLeft, CheckCircle, XCircle, Package, ArrowRightLeft, CheckSquare, Settings2, Trash2 } from "lucide-react";
import { formatCurrency } from "../../../../../features/debts/utils/formatters";
import { formatDate } from "../../../../../lib/utils";
import toast from "react-hot-toast";

// We'll import the Modals later when we create them.
// import { ApproveReturnModal } from "../../../../../features/customer-returns/components/approve-return-modal";
// import { RejectReturnModal } from "../../../../../features/customer-returns/components/reject-return-modal";
// import { ReceiveReturnModal } from "../../../../../features/customer-returns/components/receive-return-modal";
// import { InspectReturnModal } from "../../../../../features/customer-returns/components/inspect-return-modal";
// import { ReserveExchangeModal } from "../../../../../features/customer-returns/components/reserve-exchange-modal";
// import { ShipExchangeModal } from "../../../../../features/customer-returns/components/ship-exchange-modal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerReturnDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.role === "OWNER";
  const isAdmin = user?.role === "ADMIN_FINANCE";
  const canMutate = isOwner || isAdmin;
  const isStaff = user?.role === "STAFF_INPUT";

  const { data: ret, isLoading, error, mutate } = useCustomerReturn(id);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: async () => {},
  });

  const handleAction = (title: string, message: string, action: () => Promise<any>) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      action: async () => {
        try {
          await action();
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

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading customer return...</div>;
  if (error || !ret) {
    return (
      <div className="p-8 text-center text-rose-500">
        {extractErrorMessage(error) || "Customer return not found"}
      </div>
    );
  }

  const isRequested = ret.status === CustomerReturnStatus.REQUESTED;
  const isApproved = ret.status === CustomerReturnStatus.APPROVED;
  const isItemReceived = ret.status === CustomerReturnStatus.ITEM_RECEIVED;
  const isInspected = ret.status === CustomerReturnStatus.INSPECTED;
  const isRefundPending = ret.status === CustomerReturnStatus.REFUND_PENDING;

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isInspectOpen, setIsInspectOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/customer-returns" 
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <PageHeader 
            title={ret.returnCode} 
            description={`Customer Return Details`}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {canMutate && isRequested && (
            <>
              <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50" onClick={() => setIsRejectOpen(true)}>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md" onClick={() => setIsApproveOpen(true)}>
                <CheckCircle className="w-4 h-4 mr-2" /> Approve
              </Button>
            </>
          )}

          {canMutate && isApproved && (
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" onClick={() => setIsReceiveOpen(true)}>
              <Package className="w-4 h-4 mr-2" /> Receive Return
            </Button>
          )}

          {canMutate && isItemReceived && (
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md" onClick={() => setIsInspectOpen(true)}>
              <CheckSquare className="w-4 h-4 mr-2" /> Inspect Items
            </Button>
          )}

          {canMutate && (isInspected || ret.status === CustomerReturnStatus.REPLACEMENT_RESERVED) && 
           (ret.returnType === CustomerReturnType.PRODUCT_EXCHANGE || ret.returnType === CustomerReturnType.SIZE_EXCHANGE) && (
            <Button className="bg-pink-600 hover:bg-pink-700 text-white shadow-md">
              <ArrowRightLeft className="w-4 h-4 mr-2" /> Exchange Actions
            </Button>
          )}
          
          {canMutate && ret.status !== CustomerReturnStatus.COMPLETED && ret.status !== CustomerReturnStatus.CANCELLED && ret.status !== CustomerReturnStatus.REJECTED && (
             <Button
               variant="outline"
               onClick={() => handleAction("Complete Return", "Are you sure you want to complete this return? Ensure all refunds or replacements are fulfilled.", () => customerReturnsApi.completeReturn(ret.id))}
             >
               <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" /> Complete Flow
             </Button>
          )}

          {canMutate && isRequested && (
             <Button
               variant="outline"
               className="text-slate-500"
               onClick={() => handleAction("Cancel Return", "Are you sure you want to cancel this return request?", () => customerReturnsApi.cancelReturn(ret.id))}
             >
               <Trash2 className="w-4 h-4 mr-2" /> Cancel
             </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
              General Information
              {isRequested && (
                <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50">
                  <Settings2 className="w-4 h-4 mr-2" /> Edit
                </Button>
              )}
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status</p>
                <div><ReturnStatusBadge status={ret.status} /></div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Type</p>
                <div><ReturnTypeBadge type={ret.returnType} /></div>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Resolution</p>
                <div>{ret.resolutionType ? <ResolutionTypeBadge type={ret.resolutionType} /> : "-"}</div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Return Date</p>
                <p className="font-medium text-slate-800">{formatDate(ret.returnDate)}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Sales Order</p>
                {ret.salesOrder ? (
                  <Link href={`/dashboard/sales-orders/${ret.salesOrder.id}`} className="font-semibold text-primary-600 hover:underline">
                    {ret.salesOrder.orderCode}
                  </Link>
                ) : "-"}
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Warehouse</p>
                <p className="font-medium text-slate-800">{ret.warehouse?.name || "-"}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Customer Name</p>
                <p className="font-medium text-slate-800">{ret.customerName || ret.salesOrder?.customer?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Customer Phone</p>
                <p className="font-medium text-slate-800">{ret.customerPhone || ret.salesOrder?.customer?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Shipment Status</p>
                <div><ShipmentStatusBadge status={ret.returnShipmentStatus} /></div>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Tracking Number</p>
                <p className="font-medium text-slate-800">{ret.returnTrackingNumber || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Courier</p>
                <p className="font-medium text-slate-800">{ret.returnCourierName || "-"}</p>
              </div>
            </div>
            
            {ret.reason && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Reason</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{ret.reason}</p>
              </div>
            )}
            {ret.notes && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Notes</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{ret.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Returned Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Original Item</th>
                    <th className="px-4 py-3">Exchange Item</th>
                    <th className="px-4 py-3 text-center">Req / Rcv</th>
                    <th className="px-4 py-3 text-center">Acc / Rej</th>
                    <th className="px-4 py-3 text-center">Condition</th>
                    {!isStaff && <th className="px-4 py-3 text-right rounded-tr-lg">Refund Amount</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ret.items?.map((item: any) => {
                    const origVariant = item.originalProductVariant;
                    const origProduct = origVariant?.product;
                    const origName = origProduct?.name || origVariant?.sku || "Unknown Product";
                    const origSku = origVariant?.sku || "Unknown SKU";
                    const origAttrs = [];
                    if (origVariant?.color) origAttrs.push(origVariant.color);
                    if (origVariant?.size) origAttrs.push(origVariant.size);
                    const origAttrStr = origAttrs.length > 0 ? origAttrs.join(" • ") : null;

                    const repVariant = item.replacementProductVariant;
                    const repProduct = repVariant?.product;
                    const repName = repProduct?.name || repVariant?.sku || "-";
                    const repSku = repVariant?.sku || "";
                    const repAttrs = [];
                    if (repVariant?.color) repAttrs.push(repVariant.color);
                    if (repVariant?.size) repAttrs.push(repVariant.size);
                    const repAttrStr = repAttrs.length > 0 ? repAttrs.join(" • ") : null;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-4 min-w-[200px]">
                          <div className="font-medium text-slate-900">{origName}</div>
                          <div className="text-xs text-slate-600 font-mono mt-0.5">{origSku}</div>
                          {origAttrStr && <div className="text-[11px] text-slate-500 mt-1">{origAttrStr}</div>}
                        </td>
                        <td className="px-4 py-4 min-w-[200px]">
                           {repVariant ? (
                              <>
                                <div className="font-medium text-slate-900">{repName}</div>
                                <div className="text-xs text-slate-600 font-mono mt-0.5">{repSku}</div>
                                {repAttrStr && <div className="text-[11px] text-slate-500 mt-1">{repAttrStr}</div>}
                              </>
                           ) : "-"}
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          {item.requestedQuantity} / {item.receivedQuantity}
                        </td>
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          <span className="text-emerald-600 font-bold">{item.acceptedQuantity}</span> / <span className="text-rose-600 font-bold">{item.rejectedQuantity}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {item.condition ? <ItemConditionBadge condition={item.condition} /> : "-"}
                        </td>
                        {!isStaff && (
                          <td className="px-4 py-4 text-right font-medium text-slate-900">
                            {formatCurrency(Number(item.approvedRefundAmount || 0))}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Refunds</h2>
                {canMutate && ret.resolutionType === ReturnResolutionType.REFUND && (
                   <Button size="sm" variant="outline">Create Refund</Button>
                )}
             </div>
             
             {(!ret.refunds || ret.refunds.length === 0) ? (
                <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 rounded-lg">No refunds recorded.</div>
             ) : (
                <div className="space-y-4">
                   {ret.refunds.map(refund => (
                      <div key={refund.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-semibold text-slate-800">{refund.refundCode}</span>
                               <span className={cn(
                                 "text-[10px] px-2 py-0.5 rounded-full font-bold",
                                 refund.status === RefundStatus.POSTED ? "bg-emerald-100 text-emerald-700" :
                                 refund.status === RefundStatus.PENDING ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                               )}>{refund.status}</span>
                            </div>
                            <div className="text-xs text-slate-500">{formatDate(refund.refundDate)}</div>
                         </div>
                         <div className="text-right">
                            {!isStaff ? (
                               <div className="font-bold text-slate-900">{formatCurrency(Number(refund.amount || 0))}</div>
                            ) : (
                               <div className="text-sm font-medium text-slate-400">Hidden</div>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </div>

        {/* Right Col: Totals & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Items Requested</span>
                <span className="font-medium text-slate-900">{ret.items?.reduce((sum, item) => sum + item.requestedQuantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Items Received</span>
                <span className="font-medium text-slate-900">{ret.items?.reduce((sum, item) => sum + item.receivedQuantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Items Accepted</span>
                <span className="font-medium text-emerald-600">{ret.items?.reduce((sum, item) => sum + item.acceptedQuantity, 0)}</span>
              </div>
              
              {!isStaff && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Requested Refund</span>
                    <span className="font-medium text-slate-800">{formatCurrency(Number(ret.requestedRefundAmount || 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Approved Refund</span>
                    <span className="font-bold text-primary-600">{formatCurrency(Number(ret.approvedRefundAmount || 0))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Refunded</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(Number(ret.refundedAmount || 0))}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
