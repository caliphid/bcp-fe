"use client";

import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { SalesOrderDetailView } from "@/features/sales-orders/components/sales-order-detail-view";
import { useSalesOrder } from "@/features/sales-orders/hooks/use-sales-orders";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, CheckCircle2, Ban } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { salesOrderApi } from "@/features/sales-orders/api";
import { SalesOrderConfirmModal } from "@/features/sales-orders/components/sales-order-confirm-modal";
import { SalesOrderCancelModal } from "@/features/sales-orders/components/sales-order-cancel-modal";
import { SalesOrderFulfillModal } from "@/features/sales-orders/components/sales-order-fulfill-modal";
import { PaymentCreateModal } from "@/features/sales-orders/components/payment-create-modal";
import { PaymentVoidModal } from "@/features/sales-orders/components/payment-void-modal";
import { RefundCreateModal } from "@/features/sales-orders/components/refund-create-modal";
import { RefundVoidModal } from "@/features/sales-orders/components/refund-void-modal";
import { SalesOrderInvoiceModal } from "@/features/sales-orders/components/sales-order-invoice-modal";
import { SalesOrderShipmentModal } from "@/features/sales-orders/components/sales-order-shipment-modal";
import { DollarSign, ArrowRightLeft, Receipt, Truck, Package, Send, CheckCircle } from "lucide-react";

export default function SalesOrderDetailPage() {
  const { user } = useAuthStore();
  const params = useParams();

  const id = params.id as string;
  const { data: order, isLoading, mutate } = useSalesOrder(id);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isFulfillOpen, setIsFulfillOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isShipmentOpen, setIsShipmentOpen] = useState(false);
  const [voidPaymentData, setVoidPaymentData] = useState<any>(null);
  const [voidRefundData, setVoidRefundData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const postedPaymentsCount = order?.payments?.filter((p: any) => p.status === 'POSTED').length || 0;

  const isShipmentLocked = order?.shipment?.status === 'SHIPPED' || order?.shipment?.status === 'DELIVERED';
  const totalPaid = order?.payments?.filter((p: any) => p.status === 'POSTED').reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;
  const totalRefunded = order?.refunds?.filter((r: any) => r.status === 'POSTED').reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0) || 0;
  const netPaid = totalPaid - totalRefunded;

  let allItemsReturned = false;
  if (order?.status === 'FULFILLED') {
    const returnedMap: Record<string, number> = {};
    order?.refunds?.forEach((r: any) => {
      if (r.status === 'POSTED' && r.returnToStock && r.items) {
        r.items.forEach((i: any) => {
          returnedMap[i.salesOrderItemId] = (returnedMap[i.salesOrderItemId] || 0) + i.quantity;
        });
      }
    });
    const totalOrdered = order?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;
    const totalReturnedItems = Object.values(returnedMap).reduce((sum: number, qty: number) => sum + qty, 0);
    allItemsReturned = totalOrdered > 0 && totalReturnedItems >= totalOrdered;
  }

  const canCancel = canEdit && !isShipmentLocked && (
    order?.status === 'DRAFT' || 
    (order?.status === 'CONFIRMED' && postedPaymentsCount === 0) ||
    (order?.status === 'FULFILLED' && allItemsReturned && netPaid <= 0)
  );

  const hasActiveReceivable = !!order?.receivable && order?.receivable?.status !== 'VOID';
  const canDirectPaymentOrRefund = canEdit && !hasActiveReceivable;

  const canRefund = canDirectPaymentOrRefund && (order?.status === 'CONFIRMED' || order?.status === 'FULFILLED');
  const canPayment = canDirectPaymentOrRefund && (order?.status === 'CONFIRMED' || order?.status === 'FULFILLED') && order?.paymentStatus !== 'PAID';
  const canCreateInvoice = canEdit && order?.status === 'FULFILLED' && !hasActiveReceivable;
  const canShipment = canEdit && order?.status === 'FULFILLED';

  if (isLoading) {
    return <div className="p-10 text-center animate-pulse">Loading order...</div>;
  }

  if (!order) {
    return <div className="p-10 text-center text-slate-500">Order tidak ditemukan</div>;
  }

  const handleConfirmOrderClick = () => {
    if (!order.warehouseId) {
      toast.error("Gagal: Warehouse belum dipilih. Silakan edit pesanan terlebih dahulu.");
      return;
    }
    if (order.items.length === 0) {
      toast.error("Gagal: Minimal harus ada 1 item untuk dikonfirmasi.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      await salesOrderApi.confirmSalesOrder(id);
      toast.success("Sales Order berhasil dikonfirmasi dan stok direservasi.");
      setIsConfirmOpen(false);
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal mengonfirmasi pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = async (data: { reason?: string }) => {
    setIsSubmitting(true);
    try {
      await salesOrderApi.cancelSalesOrder(id, data);
      toast.success("Sales Order berhasil dibatalkan.");
      setIsCancelOpen(false);
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal membatalkan pesanan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFulfillSubmit = async () => {
    setIsSubmitting(true);
    try {
      await salesOrderApi.fulfillSalesOrder(id);
      toast.success("Sales Order berhasil di-fulfill. Stok fisik telah dikurangi.");
      setIsFulfillOpen(false);
      mutate();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      if (msg && msg.includes("Reserved stock discrepancy")) {
        toast.error(`Error Blocking: ${msg} Silakan cek sistem inventory!`, { duration: 10000 });
      } else {
        toast.error(msg || "Gagal melakukan fulfillment pesanan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await salesOrderApi.createSalesOrderPayment(id, data);
      toast.success("Pembayaran berhasil dicatat.");
      setIsPaymentOpen(false);
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal mencatat pembayaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoidPayment = async (reason: string) => {
    if (!voidPaymentData) return;
    setIsSubmitting(true);
    try {
      await salesOrderApi.voidSalesOrderPayment(voidPaymentData.id, reason);
      toast.success("Pembayaran berhasil di-void.");
      setVoidPaymentData(null);
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal membatalkan pembayaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefundSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await salesOrderApi.createSalesOrderRefund(id, data);
      toast.success("Refund berhasil dicatat.");
      setIsRefundOpen(false);
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal mencatat refund.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoidRefund = async (reason: string) => {
    if (!voidRefundData) return;
    setIsSubmitting(true);
    try {
      await salesOrderApi.voidSalesOrderRefund(voidRefundData.id, reason);
      toast.success("Refund berhasil di-void.");
      setVoidRefundData(null);
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal membatalkan refund.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvoiceSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await salesOrderApi.createSalesOrderInvoice(id, data);
      toast.success("Invoice Receivable berhasil dibuat.");
      setIsInvoiceOpen(false);
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal membuat invoice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShipmentSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await salesOrderApi.createOrUpdateSalesOrderShipment(id, data);
      toast.success("Shipment berhasil disimpan.");
      setIsShipmentOpen(false);
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal menyimpan shipment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShipmentLifecycle = async (action: 'pack' | 'ship' | 'deliver') => {
    if (action === 'ship' && !order?.shipment?.trackingNumber) {
      toast.error("Tracking number (resi) wajib diisi sebelum mengirim barang. Silakan lengkapi info shipment terlebih dahulu.");
      setIsShipmentOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      if (action === 'pack') await salesOrderApi.packSalesOrderShipment(id);
      if (action === 'ship') await salesOrderApi.shipSalesOrderShipment(id);
      if (action === 'deliver') await salesOrderApi.deliverSalesOrderShipment(id);
      toast.success(`Shipment berhasil diproses (${action.toUpperCase()}).`);
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Gagal memproses shipment (${action}).`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Sales Order Detail"
          description={`Sales Order #${order.orderCode} - Status: ${order.status}`}
        />
        <div className="flex items-center gap-2">
          {canCancel && (
            <Button variant="destructive" className="gap-2" onClick={() => setIsCancelOpen(true)}>
              <Ban className="w-4 h-4" /> Cancel Order
            </Button>
          )}

          {canCreateInvoice && (
            <Button variant="outline" className="gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200" onClick={() => setIsInvoiceOpen(true)}>
              <Receipt className="w-4 h-4" /> Issue Invoice
            </Button>
          )}

          {canRefund && (
            <Button variant="outline" className="gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200" onClick={() => setIsRefundOpen(true)}>
              <ArrowRightLeft className="w-4 h-4" /> Issue Refund
            </Button>
          )}

          {canPayment && (
            <Button variant="outline" className="gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200" onClick={() => setIsPaymentOpen(true)}>
              <DollarSign className="w-4 h-4" /> Add Payment
            </Button>
          )}

          {canEdit && order.status === 'CONFIRMED' && (
            <Button variant="default" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsFulfillOpen(true)}>
              <CheckCircle2 className="w-4 h-4" /> Fulfill Order
            </Button>
          )}

          {canEdit && order.status === 'DRAFT' && (
            <>
              <Link href={`/dashboard/sales-orders/${order.id}/edit`}>
                <Button variant="outline" className="gap-2">
                  <Edit className="w-4 h-4" /> Edit Draft
                </Button>
              </Link>
              <Button variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirmOrderClick}>
                <CheckCircle2 className="w-4 h-4" /> Confirm Order
              </Button>
            </>
          )}
        </div>
      </div>

      {order.status === 'FULFILLED' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Truck className="w-5 h-5 text-emerald-600" /> Shipment & Delivery</h3>
            <p className="text-sm text-slate-500 mt-1">Manage delivery lifecycle for this fulfilled order.</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            <Button variant="outline" onClick={() => setIsShipmentOpen(true)}>
              {order.shipment ? "Edit Shipment Info" : "Create Shipment Proof"}
            </Button>
            
            {order.shipment?.status === 'PROCESSING' && (
              <Button onClick={() => handleShipmentLifecycle('pack')} disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white">
                <Package className="w-4 h-4 mr-2" /> Mark as Packing
              </Button>
            )}
            
            {order.shipment?.status === 'PACKING' && (
              <Button onClick={() => handleShipmentLifecycle('ship')} disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Send className="w-4 h-4 mr-2" /> Mark as Shipped
              </Button>
            )}
            
            {order.shipment?.status === 'SHIPPED' && (
              <Button onClick={() => handleShipmentLifecycle('deliver')} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" /> Mark as Delivered
              </Button>
            )}
          </div>
        </div>
      )}

      {hasActiveReceivable && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-4 rounded-xl text-sm font-medium">
          Note: This order has an active Receivable. Collection and refund processes must be handled through the Receivable module.
        </div>
      )}

      <SalesOrderDetailView order={order} canEdit={canEdit} onVoidPayment={setVoidPaymentData} onVoidRefund={setVoidRefundData} />

      <SalesOrderConfirmModal  
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleConfirmSubmit} 
        isLoading={isSubmitting} 
        order={order} 
      />

      <SalesOrderCancelModal 
        isOpen={isCancelOpen} 
        onClose={() => setIsCancelOpen(false)} 
        onConfirm={handleCancelSubmit} 
        isLoading={isSubmitting} 
        order={order} 
      />

      <SalesOrderFulfillModal 
        isOpen={isFulfillOpen} 
        onClose={() => setIsFulfillOpen(false)} 
        onConfirm={handleFulfillSubmit} 
        isLoading={isSubmitting} 
        order={order} 
      />

      <PaymentCreateModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSubmit={handlePaymentSubmit}
        isLoading={isSubmitting}
        order={order}
      />

      <PaymentVoidModal
        isOpen={!!voidPaymentData}
        onClose={() => setVoidPaymentData(null)}
        onConfirm={handleVoidPayment}
        isLoading={isSubmitting}
        payment={voidPaymentData}
      />

      <RefundCreateModal
        isOpen={isRefundOpen}
        onClose={() => setIsRefundOpen(false)}
        onSubmit={handleRefundSubmit}
        isLoading={isSubmitting}
        order={order}
      />

      <RefundVoidModal
        isOpen={!!voidRefundData}
        onClose={() => setVoidRefundData(null)}
        onConfirm={handleVoidRefund}
        isLoading={isSubmitting}
        refund={voidRefundData}
      />

      <SalesOrderInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        onSubmit={handleInvoiceSubmit}
        isLoading={isSubmitting}
        order={order}
      />

      <SalesOrderShipmentModal
        isOpen={isShipmentOpen}
        onClose={() => setIsShipmentOpen(false)}
        onSubmit={handleShipmentSubmit}
        isLoading={isSubmitting}
        order={order}
      />
    </div>
  );
}
