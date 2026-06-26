"use client";
import { useState, use } from "react";
import Link from "next/link";
import { usePurchaseOrder } from "../../../../../../features/purchasing/hooks/use-purchasing";
import { purchasingApi } from "../../../../../../features/purchasing/api";
import {
  PurchaseOrderStatus,
  PurchaseOrderPaymentStatus,
} from "../../../../../../features/purchasing/types";
import { useAuthStore } from "../../../../../../store/auth-store";
import { extractErrorMessage } from "../../../../../../lib/error";
import { Button } from "../../../../../../components/ui/button";
import { PageHeader } from "../../../../../../components/ui/page-header";
import { ConfirmDialog } from "../../../../../../components/ui/confirm-dialog";
import {
  ArrowLeft,
  Box,
  Check,
  FileText,
  XCircle,
  DollarSign,
  HelpCircle,
} from "lucide-react";
import { formatCurrency } from "../../../../../../features/debts/utils/formatters";
import { formatDate } from "../../../../../../lib/utils";
import toast from "react-hot-toast";
import { VendorPaymentModal } from "../../../../../../features/purchasing/components/vendor-payment-modal";
import { Modal } from "../../../../../../components/ui/modal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PurchaseOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const user = useAuthStore((state) => state.user);
  const isOwner = user?.role === "OWNER";
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const isStaff = user?.role === "STAFF_INPUT";

  const { data: po, isLoading, error, mutate } = usePurchaseOrder(id);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

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
    action: (reason?: string) => Promise<unknown>,
    showInput: boolean = false,
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

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500">
        Loading purchase order...
      </div>
    );
  if (error || !po) {
    return (
      <div className="p-8 text-center text-red-500">
        {extractErrorMessage(error) || "Purchase order not found"}
      </div>
    );
  }

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    let bg = "bg-slate-100 text-slate-800";
    switch (status) {
      case PurchaseOrderStatus.DRAFT:
        bg = "bg-slate-100 text-slate-800";
        break;
      case PurchaseOrderStatus.SUBMITTED:
        bg = "bg-blue-100 text-blue-800";
        break;
      case PurchaseOrderStatus.APPROVED:
        bg = "bg-emerald-100 text-emerald-800";
        break;
      case PurchaseOrderStatus.PARTIALLY_RECEIVED:
        bg = "bg-yellow-100 text-yellow-800";
        break;
      case PurchaseOrderStatus.FULLY_RECEIVED:
        bg = "bg-indigo-100 text-indigo-800";
        break;
      case PurchaseOrderStatus.CANCELLED:
        bg = "bg-rose-100 text-rose-800";
        break;
      case PurchaseOrderStatus.CLOSED:
        bg = "bg-slate-200 text-slate-600";
        break;
    }
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}
      >
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  const getPaymentBadge = (status: PurchaseOrderPaymentStatus) => {
    let bg = "bg-slate-100 text-slate-800";
    switch (status) {
      case PurchaseOrderPaymentStatus.UNPAID:
        bg = "bg-red-100 text-red-800";
        break;
      case PurchaseOrderPaymentStatus.PARTIALLY_PAID:
        bg = "bg-yellow-100 text-yellow-800";
        break;
      case PurchaseOrderPaymentStatus.PAID:
        bg = "bg-emerald-100 text-emerald-800";
        break;
      case PurchaseOrderPaymentStatus.CANCELLED:
        bg = "bg-slate-200 text-slate-600";
        break;
    }
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg}`}
      >
        {status.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/purchasing/purchase-orders"
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <PageHeader
              title={`Purchase Order ${po.purchaseOrderCode}`}
              description={`Vendor: ${po.vendor?.name} | Created: ${formatDate(po.createdAt)}`}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 h-8 px-3">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Siklus Pembelian
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canMutate && po.status === PurchaseOrderStatus.DRAFT && (
            <Button
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() =>
                handleAction(
                  "Submit PO",
                  "Submit this draft for approval?",
                  () => purchasingApi.submitPurchaseOrder(id),
                )
              }
            >
              <FileText className="w-4 h-4 mr-2" /> Submit
            </Button>
          )}

          {isOwner && po.status === PurchaseOrderStatus.SUBMITTED && (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() =>
                handleAction(
                  "Approve PO",
                  "Are you sure you want to approve this PO?",
                  () => purchasingApi.approvePurchaseOrder(id),
                )
              }
            >
              <Check className="w-4 h-4 mr-2" /> Approve
            </Button>
          )}

          {isOwner &&
            [
              PurchaseOrderStatus.DRAFT,
              PurchaseOrderStatus.SUBMITTED,
              PurchaseOrderStatus.APPROVED,
            ].includes(po.status) && (
              <Button
                variant="outline"
                className="border-rose-200 text-rose-700 hover:bg-rose-50"
                onClick={() =>
                  handleAction(
                    "Cancel PO",
                    "Please provide a reason for cancelling:",
                    (reason) => purchasingApi.cancelPurchaseOrder(id, reason!),
                    true,
                  )
                }
              >
                <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
            )}

          {isOwner &&
            [
              PurchaseOrderStatus.APPROVED,
              PurchaseOrderStatus.PARTIALLY_RECEIVED,
              PurchaseOrderStatus.FULLY_RECEIVED,
            ].includes(po.status) && (
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
                onClick={() =>
                  handleAction(
                    "Close PO",
                    "Close this PO? No further receiving can be done.",
                    () => purchasingApi.closePurchaseOrder(id),
                  )
                }
              >
                Close
              </Button>
            )}

          {canMutate &&
            [
              PurchaseOrderStatus.APPROVED,
              PurchaseOrderStatus.PARTIALLY_RECEIVED,
            ].includes(po.status) && (
              <Link
                href={`/dashboard/purchasing/goods-receipts/create?purchaseOrderId=${id}`}
              >
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                  <Box className="w-4 h-4 mr-2" /> Create Goods Receipt
                </Button>
              </Link>
            )}

          {canMutate &&
            [
              PurchaseOrderStatus.APPROVED,
              PurchaseOrderStatus.PARTIALLY_RECEIVED,
              PurchaseOrderStatus.FULLY_RECEIVED,
            ].includes(po.status) &&
            po.paymentStatus !== PurchaseOrderPaymentStatus.PAID && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                onClick={() => setIsPaymentModalOpen(true)}
              >
                <DollarSign className="w-4 h-4 mr-2" /> Record Payment
              </Button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Master Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">
              General Information
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Status
                </p>
                <div className="flex gap-2">
                  {getStatusBadge(po.status)}
                  {getPaymentBadge(po.paymentStatus)}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Order Date
                </p>
                <p className="font-medium text-slate-800">
                  {formatDate(po.orderDate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Vendor
                </p>
                <p className="font-semibold text-primary-600">
                  {po.vendor?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {po.vendor?.vendorCode}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Target Warehouse
                </p>
                <p className="font-medium text-slate-800">
                  {po.warehouse?.name}
                </p>
                <p className="text-sm text-slate-500">
                  {po.warehouse?.warehouseCode}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  External Ref
                </p>
                <p className="font-medium text-slate-800">
                  {po.externalReference || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Expected Delivery
                </p>
                <p className="font-medium text-slate-800">
                  {po.expectedDeliveryDate
                    ? formatDate(po.expectedDeliveryDate)
                    : "-"}
                </p>
              </div>
            </div>

            {po.notes && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                  Notes
                </p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {po.notes}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">
              Order Items
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Item</th>
                    <th className="px-4 py-3 text-center">Ordered</th>
                    <th className="px-4 py-3 text-center">Received</th>
                    {!isStaff && (
                      <th className="px-4 py-3 text-right">Unit Cost</th>
                    )}
                    {!isStaff && (
                      <th className="px-4 py-3 text-right">Discount</th>
                    )}
                    {!isStaff && (
                      <th className="px-4 py-3 text-right rounded-tr-lg">
                        Line Total
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {po.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {item.productVariant?.sku}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.productVariant?.product?.name} (
                          {item.productVariant?.color} /{" "}
                          {item.productVariant?.size})
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium">
                        {item.orderedQuantity}
                      </td>
                      <td className="px-4 py-4 text-center font-medium text-indigo-600">
                        {item.receivedQuantity}
                      </td>
                      {!isStaff && (
                        <td className="px-4 py-4 text-right text-slate-600">
                          {formatCurrency(Number(item.unitCost || 0))}
                        </td>
                      )}
                      {!isStaff && (
                        <td className="px-4 py-4 text-right text-rose-600">
                          {Number(item.discountAmount) > 0
                            ? formatCurrency(Number(item.discountAmount))
                            : "-"}
                        </td>
                      )}
                      {!isStaff && (
                        <td className="px-4 py-4 text-right font-medium text-slate-900">
                          {formatCurrency(Number(item.lineTotal || 0))}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Totals */}
        {!isStaff && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6">
                Payment Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(Number(po.subtotal || 0))}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-medium text-rose-600">
                    -{formatCurrency(Number(po.discountAmount || 0))}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(Number(po.shippingAmount || 0))}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Other Costs</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(Number(po.otherCostAmount || 0))}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(Number(po.taxAmount || 0))}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-primary-700 text-lg">
                    {formatCurrency(Number(po.totalAmount || 0))}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Paid Amount</span>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(Number(po.totalPaidAmount || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-900">Outstanding</span>
                  <span className="font-bold text-rose-600 text-lg">
                    {formatCurrency(Number(po.outstandingAmount || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => confirmDialog.action(confirmDialog.reason)}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
      >
        {confirmDialog.showInput && (
          <div className="mt-4">
            <textarea
              className="w-full h-20 px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter reason (min 3 characters)..."
              value={confirmDialog.reason}
              onChange={(e) =>
                setConfirmDialog((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
            />
          </div>
        )}
      </ConfirmDialog>

      {po && (
        <VendorPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          purchaseOrderId={id}
          outstandingAmount={Number(po.outstandingAmount || 0)}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            mutate();
            toast.success("Vendor payment recorded successfully!");
          }}
        />
      )}

      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Siklus Dokumen Pembelian (Purchase Order)" className="max-w-4xl">
        <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          <p className="mb-2">Siklus Pembelian dimulai dari memesan barang (PO) hingga menerima barang (GR) dan melunasi hutang (Payment). Berikut adalah status dan langkah yang harus Anda ambil:</p>
          
          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">1. Alur Status Pesanan (PO Status)</h4>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="mt-0.5 bg-slate-200 text-slate-700 p-1.5 rounded text-xs font-bold px-2 shrink-0">1. DRAFT</div>
                <div>
                  <p className="text-xs text-slate-600">PO baru dibuat dan belum sah. Masih bisa diedit bebas. <br/><strong>Aksi:</strong> Klik <strong>Submit Order</strong> untuk mengesahkan dan mengirimkannya ke vendor.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <div className="mt-0.5 bg-blue-100 text-blue-700 p-1.5 rounded text-xs font-bold px-2 shrink-0">2. SUBMITTED</div>
                <div>
                  <p className="text-xs text-slate-600">PO sudah disetujui (sah). Anda sedang menunggu vendor mengirim barang. <br/><strong>Aksi:</strong> Jika barang sudah sampai di gudang, klik <strong>Receive Goods (GR)</strong> untuk mencatat penerimaan.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                <div className="mt-0.5 bg-amber-100 text-amber-700 p-1.5 rounded text-xs font-bold px-2 shrink-0">3. PARTIALLY RECEIVED</div>
                <div>
                  <p className="text-xs text-slate-600">Vendor baru mengirim sebagian barang (belum lengkap). <br/><strong>Aksi:</strong> Anda bisa membuat GR lagi (Receive Goods) saat sisa barangnya datang.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <div className="mt-0.5 bg-emerald-100 text-emerald-700 p-1.5 rounded text-xs font-bold px-2 shrink-0">4. FULLY RECEIVED</div>
                <div>
                  <p className="text-xs text-slate-600">Semua barang yang dipesan sudah diterima di gudang (Stok bertambah). <br/><strong>Catatan:</strong> Jika tagihan belum lunas, status pembayarannya (Payment Status) akan tetap UNPAID.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6 pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-base">2. Alur Pembayaran & Hutang</h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-1">Make Payment (Bayar Vendor)</span>
              <p className="text-xs text-slate-600 mb-2">Anda bisa mencicil (termin) atau membayar lunas tagihan PO. Setiap pembayaran akan mengurangi <strong>Saldo Kas/Bank</strong> Anda dan mengurangi saldo <strong>Hutang Usaha</strong>.</p>
              <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                <li><strong>UNPAID:</strong> Belum ada pembayaran.</li>
                <li><strong>PARTIAL:</strong> Sudah dicicil sebagian.</li>
                <li><strong>PAID:</strong> Hutang untuk PO ini sudah lunas 100%.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
            <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
