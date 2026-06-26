import { SalesOrder } from "../../../types/sales-order";
import { formatMoney } from "../../../lib/utils";
import dayjs from "dayjs";
import { Clock, CheckCircle2, Loader2, Ban, CreditCard, Receipt, Truck, HelpCircle, ArrowRightLeft } from "lucide-react";
import { useProductVariant } from "../../products/hooks/use-products";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Modal } from "../../../components/ui/modal";
import { useState } from "react";

function VariantDisplayName({ variantId, initialName, initialSku, color, size }: { variantId: string, initialName?: string, initialSku?: string, color?: string, size?: string }) {
  const { data } = useProductVariant(initialName ? undefined : variantId);
  const name = initialName || data?.product?.name || `Product ID: ${variantId}`;
  const sku = initialSku || data?.sku;
  const vColor = color || data?.color;
  const vSize = size || data?.size;
  
  return (
    <>
      <div className="font-semibold text-slate-800">
        {name}
        {vColor && vSize && ` (${vColor} / ${vSize})`}
      </div>
      <div className="text-xs text-slate-500">
        {sku && <span className="mr-2">{sku}</span>}
      </div>
    </>
  );
}

interface SalesOrderDetailViewProps {
  order: SalesOrder;
  onVoidPayment?: (payment: any) => void;
  onVoidRefund?: (refund: any) => void;
  canEdit?: boolean;
}

export function SalesOrderDetailView({ order, onVoidPayment, onVoidRefund, canEdit }: SalesOrderDetailViewProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  const renderStatus = (status: string) => {
    switch (status) {
      case 'DRAFT': return <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold"><Clock className="w-3 h-3"/> DRAFT</span>;
      case 'CONFIRMED': return <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> CONFIRMED</span>;
      case 'PROCESSING': return <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-semibold"><Loader2 className="w-3 h-3"/> PROCESSING</span>;
      case 'FULFILLED': return <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> FULFILLED</span>;
      case 'COMPLETED': return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> COMPLETED</span>;
      case 'CANCELLED': return <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold"><Ban className="w-3 h-3"/> CANCELLED</span>;
      default: return <span className="text-xs font-semibold">{status}</span>;
    }
  };

  const renderPaymentStatus = (status: string) => {
    switch (status) {
      case 'UNPAID': return <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs font-semibold">UNPAID</span>;
      case 'PARTIAL': return <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-semibold">PARTIAL</span>;
      case 'PAID': return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold">PAID</span>;
      default: return <span className="text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800">Informasi Pesanan</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTutorial(true)} 
              className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 h-7 text-xs px-2"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              Siklus Dokumen
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-slate-500">Nomor Pesanan</span>
            <span className="font-bold text-slate-900">{order.orderCode}</span>

            <span className="text-slate-500">Tanggal Pesanan</span>
            <span className="font-medium text-slate-800">{dayjs(order.orderDate).format("DD MMM YYYY")}</span>

            <span className="text-slate-500">Status</span>
            <div className="flex gap-2">
              {renderStatus(order.status)}
              {renderPaymentStatus(order.paymentStatus)}
            </div>

            <span className="text-slate-500">Sales Channel</span>
            <span className="font-medium text-slate-800">{order.salesChannel}</span>

            <span className="text-slate-500">Order Type</span>
            <span className="font-medium text-slate-800">{order.orderType}</span>

            <span className="text-slate-500">Catatan</span>
            <span className="font-medium text-slate-800">{order.notes || "-"}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Informasi Pelanggan</h3>
          
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-slate-500">Nama Pelanggan</span>
            <span className="font-bold text-slate-900">
              {order.customerName}
              {order.customerId && (
                <Link href={`/dashboard/customers/${order.customerId}`} className="ml-2 text-indigo-600 hover:underline text-xs font-semibold">
                  (Lihat Profil)
                </Link>
              )}
            </span>

            <span className="text-slate-500">Nomor Telepon</span>
            <span className="font-medium text-slate-800">{order.customerPhone || "-"}</span>

            <span className="text-slate-500">Alamat Pengiriman</span>
            <span className="font-medium text-slate-800">{order.customerAddress || "-"}</span>
          </div>
        </div>

        {order.receivable && (
          <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-indigo-800 border-b border-indigo-100 pb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Informasi Penagihan (Receivable)
            </h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-slate-500">No. Tagihan</span>
              <span className="font-bold text-indigo-600">{order.receivable.receivableCode}</span>

              <span className="text-slate-500">Status</span>
              <span className="font-medium text-slate-800">{order.receivable.status}</span>

              <span className="text-slate-500">Tanggal Jatuh Tempo</span>
              <span className="font-medium text-slate-800">{order.receivable.dueDate ? dayjs(order.receivable.dueDate).format("DD MMM YYYY") : "-"}</span>

              <span className="text-slate-500">Sisa Tagihan</span>
              <span className="font-bold text-rose-600">{formatMoney(order.receivable.remainingBalance)}</span>
            </div>
          </div>
        )}

        {order.shipment && (
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-emerald-800 border-b border-emerald-100 pb-2 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Informasi Pengiriman
            </h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-slate-500">Status</span>
              <span className="font-bold text-emerald-600">{order.shipment.status}</span>

              <span className="text-slate-500">Kurir / Resi</span>
              <span className="font-medium text-slate-800">
                {order.shipment.courierName || "-"} {order.shipment.trackingNumber ? `/ ${order.shipment.trackingNumber}` : ""}
              </span>

              <span className="text-slate-500">Tanggal Kirim</span>
              <span className="font-medium text-slate-800">{dayjs(order.shipment.shipmentDate).format("DD MMM YYYY")}</span>

              <span className="text-slate-500">Terkirim (Delivered)</span>
              <span className="font-medium text-slate-800">{order.shipment.deliveredAt ? dayjs(order.shipment.deliveredAt).format("DD MMM YYYY HH:mm") : "-"}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Daftar Item</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4 text-right">Harga Satuan</th>
                <th className="px-6 py-4 text-center w-24">Qty</th>
                <th className="px-6 py-4 text-right">Diskon</th>
                <th className="px-6 py-4 text-right">Subtotal</th>
                {order.items.some(i => i.totalCostSnapshot !== null && i.totalCostSnapshot !== undefined) && (
                  <th className="px-6 py-4 text-right text-rose-600 bg-rose-50/30">HPP / Cost</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Tidak ada item.
                  </td>
                </tr>
              )}
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <VariantDisplayName 
                      variantId={item.productVariantId}
                      initialName={item.productVariant?.product?.name || item.product?.name}
                      initialSku={item.productVariant?.sku || item.product?.sku}
                      color={item.productVariant?.color}
                      size={item.productVariant?.size}
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">{formatMoney(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-center font-bold text-slate-800">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-500">
                    {Number(item.discountAmount) > 0 ? `-${formatMoney(item.discountAmount)}` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{formatMoney(item.lineTotal)}</td>
                  {order.items.some(i => i.totalCostSnapshot !== null && i.totalCostSnapshot !== undefined) && (
                    <td className="px-6 py-4 text-right font-medium text-rose-600 bg-rose-50/30">
                      {item.totalCostSnapshot ? formatMoney(item.totalCostSnapshot) : "-"}
                      {item.unitCostSnapshot && <div className="text-[10px] text-rose-400">@{formatMoney(item.unitCostSnapshot)}</div>}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-100">
          <div className="w-full md:w-1/2 ml-auto space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-semibold uppercase tracking-wide">Item Subtotal</span>
              <span className="font-bold text-slate-800">
                {formatMoney(order.items?.reduce((acc, item) => acc + (Number(item.unitPrice || 0) * Number(item.quantity || 0)), 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-semibold uppercase tracking-wide">Total Discount</span>
              <span className="font-bold text-red-600">
                -{formatMoney(Number(order.discountAmount || 0) + order.items?.reduce((acc, item) => acc + Number(item.discountAmount || 0), 0))}
              </span>
            </div>
            {Number(order.platformFeeAmount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-semibold uppercase tracking-wide">Platform Fee</span>
                <span className="font-bold text-slate-800">{formatMoney(order.platformFeeAmount || 0)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-semibold uppercase tracking-wide">Shipping</span>
              <span className="font-bold text-slate-800">+{formatMoney(order.shippingAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-semibold uppercase tracking-wide">Tax</span>
              <span className="font-bold text-slate-800">+{formatMoney(order.taxAmount)}</span>
            </div>
            {order.salesChannel === 'MARKETPLACE' && Number(order.platformFeeAmount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-semibold uppercase tracking-wide">Marketplace Fee ({order.platformFeeRate}%)</span>
                <span className="font-bold text-rose-600">-{formatMoney(order.platformFeeAmount || "0")}</span>
              </div>
            )}
            <div className="h-px bg-slate-200 my-2"></div>
            <div className="flex justify-between text-base">
              <span className="text-slate-900 font-black uppercase tracking-wide">Grand Total</span>
              <span className="font-black text-indigo-600 text-xl">{formatMoney(order.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Returns Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-800">Customer Returns</h3>
          <div className="flex gap-2">
            <Link href={`/dashboard/customer-returns?salesOrderId=${order.id}`}>
              <Button variant="outline" size="sm">View Returns</Button>
            </Link>
            {canEdit && (
              <Link href={`/dashboard/customer-returns/create?salesOrderId=${order.id}`}>
                <Button size="sm">Create Return</Button>
              </Link>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Untuk retur, penukaran, atau komplain dari pelanggan terkait pesanan ini.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Audit Log</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex gap-2 items-center">
            <span className="w-24 text-slate-500">Dibuat Oleh</span>
            <span className="font-medium text-slate-800">{order.createdBy?.name || "System"}</span>
            <span className="text-slate-400">pada {dayjs(order.createdAt).format("DD MMM YYYY HH:mm")}</span>
          </div>
          {order.updatedBy && (
            <div className="flex gap-2 items-center">
              <span className="w-24 text-slate-500">Diupdate Oleh</span>
              <span className="font-medium text-slate-800">{order.updatedBy.name}</span>
              <span className="text-slate-400">pada {dayjs(order.updatedAt).format("DD MMM YYYY HH:mm")}</span>
            </div>
          )}
        </div>
      </div>

      {order.payments && order.payments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Riwayat Pembayaran</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Ref. Code</th>
                  <th className="px-6 py-4">Akun (Cash In)</th>
                  <th className="px-6 py-4 text-right">Nominal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Catatan</th>
                  {canEdit && <th className="px-6 py-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.payments.map((payment: any) => (
                  <tr key={payment.id} className={payment.status === 'VOID' ? 'bg-slate-50 opacity-75' : ''}>
                    <td className="px-6 py-4 font-medium">{dayjs(payment.paymentDate).format("DD MMM YYYY")}</td>
                    <td className="px-6 py-4">
                      {payment.paymentCode}
                      {payment.transaction && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Tx: {payment.transaction.transactionCode}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payment.account?.name || payment.accountId}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                      {payment.status === 'VOID' ? <span className="line-through text-slate-400 mr-2">{formatMoney(payment.amount)}</span> : null}
                      {payment.status !== 'VOID' ? formatMoney(payment.amount) : ''}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'POSTED' ? (
                        <span className="inline-flex text-xs font-semibold px-2 py-1 rounded-md bg-emerald-50 text-emerald-600">POSTED</span>
                      ) : (
                        <span className="inline-flex text-xs font-semibold px-2 py-1 rounded-md bg-red-50 text-red-600">VOID</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={payment.notes || payment.voidReason}>
                      {payment.status === 'VOID' ? (
                        <span className="text-red-500">Void Reason: {payment.voidReason}</span>
                      ) : payment.notes || '-'}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        {payment.status === 'POSTED' && onVoidPayment && (
                          <button
                            onClick={() => onVoidPayment(payment)}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            Void
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {order.refunds && order.refunds.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Riwayat Refund & Return</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Ref. Code</th>
                  <th className="px-6 py-4">Akun (Cash Out)</th>
                  <th className="px-6 py-4">Method & Stock</th>
                  <th className="px-6 py-4 text-right">Nominal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Catatan</th>
                  {canEdit && <th className="px-6 py-4 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.refunds.map((refund: any) => (
                  <tr key={refund.id} className={refund.status === 'VOID' ? 'bg-slate-50 opacity-75' : ''}>
                    <td className="px-6 py-4 font-medium">{dayjs(refund.refundDate).format("DD MMM YYYY")}</td>
                    <td className="px-6 py-4">
                      {refund.refundCode}
                      {refund.transaction && (
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-red-500" /> Tx: {refund.transaction.transactionCode}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {refund.account?.name || refund.accountId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">{refund.method}</div>
                      {refund.returnToStock ? (
                        <div className="mt-1">
                          <div className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                            Return to Stock
                          </div>
                          {refund.items && refund.items.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {refund.items.map((item: any, idx: number) => {
                                const orderItem = order.items.find(i => i.id === item.salesOrderItemId);
                                const itemName = orderItem?.product?.name || 'Item';
                                return (
                                  <div key={idx} className="text-[10px] text-slate-500">
                                    • {itemName} (x{item.quantity})
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 mt-1">
                          No Return
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-red-600">
                      {refund.status === 'VOID' ? <span className="line-through text-slate-400 mr-2">{formatMoney(refund.amount)}</span> : null}
                      {refund.status !== 'VOID' ? formatMoney(refund.amount) : ''}
                    </td>
                    <td className="px-6 py-4">
                      {refund.status === 'POSTED' ? (
                        <span className="inline-flex text-xs font-semibold px-2 py-1 rounded-md bg-emerald-50 text-emerald-600">POSTED</span>
                      ) : (
                        <span className="inline-flex text-xs font-semibold px-2 py-1 rounded-md bg-red-50 text-red-600">VOID</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-[200px] truncate" title={refund.notes || refund.voidReason}>
                      {refund.status === 'VOID' ? (
                        <span className="text-red-500">Void Reason: {refund.voidReason}</span>
                      ) : refund.notes || '-'}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        {refund.status === 'POSTED' && onVoidRefund && (
                          <button
                            onClick={() => onVoidRefund(refund)}
                            className="text-xs font-semibold text-red-600 hover:underline"
                          >
                            Void
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-6 overflow-hidden">
        <h3 className="font-semibold text-white border-b border-slate-700 pb-3 mb-4">Raw Data</h3>
        <pre className="text-xs text-slate-300 overflow-x-auto">
          {JSON.stringify(order, null, 2)}
        </pre>
      </div>

      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Panduan Lengkap Sales Order" className="max-w-5xl">
        <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          <p className="mb-2">Halaman <strong>Sales Order Detail</strong> menampilkan seluruh informasi terkait suatu pesanan mulai dari rincian barang, status pengiriman, hingga riwayat pembayaran dan pembatalan (refund).</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">1. Data Pesanan & Pelanggan</h4>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Informasi Pesanan</span>
                <p className="text-xs text-slate-600">Berisi Nomor Referensi, Tanggal, Jalur Penjualan (Sales Channel), dan Tipe Pesanan. Menentukan asal muasal pesanan ini dibuat.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Informasi Pelanggan & Unit Bisnis</span>
                <p className="text-xs text-slate-600">Kontak pembeli (Alamat pengiriman) dan Cabang/Gudang (Business Unit & Warehouse) mana yang bertanggung jawab menyediakan stok untuk pesanan ini.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">2. Item Pesanan & Total Tagihan</h4>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Daftar Barang (Item Pesanan)</span>
                <p className="text-xs text-slate-600">Daftar produk yang dibeli beserta kuantitas dan harga satuannya. Anda hanya bisa mengubah ini saat pesanan masih DRAFT (melalui tombol Edit).</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1">Ringkasan Total (Summary)</span>
                <p className="text-xs text-slate-600">Kalkulasi <strong>Subtotal + Ongkos Kirim + Pajak - Diskon = Grand Total</strong>. Inilah nilai mutlak yang harus dilunasi oleh pelanggan.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6 pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-base">3. Alur Status Pesanan (Order Lifecycle)</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="mt-0.5 bg-slate-200 text-slate-700 p-1.5 rounded text-xs font-bold px-2 shrink-0">1. DRAFT</div>
                <div>
                  <p className="text-xs text-slate-600">Bisa diedit bebas. <br/><strong>Aksi:</strong> Klik <strong>Confirm Order</strong> agar pesanan disetujui (stok di-*reserve*).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <div className="mt-0.5 bg-blue-100 text-blue-700 p-1.5 rounded text-xs font-bold px-2 shrink-0">2. CONFIRMED</div>
                <div>
                  <p className="text-xs text-slate-600">Pesanan disetujui. <br/><strong>Aksi:</strong> Klik <strong>Fulfill Order</strong> agar gudang mulai menyiapkan pesanan.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                <div className="mt-0.5 bg-amber-100 text-amber-700 p-1.5 rounded text-xs font-bold px-2 shrink-0">3. PROCESSING</div>
                <div>
                  <p className="text-xs text-slate-600">Sedang dipacking. <br/><strong>Aksi:</strong> Di bagian <i>Shipment Detail</i> (bawah layar), klik <strong>Mark as Shipped</strong> jika sudah diserahkan ke kurir (pastikan nomor resi terisi).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <div className="mt-0.5 bg-indigo-100 text-indigo-700 p-1.5 rounded text-xs font-bold px-2 shrink-0">4. FULFILLED</div>
                <div>
                  <p className="text-xs text-slate-600">Dikirim. <br/><strong>Aksi:</strong> Jika barang sudah sampai ke tangan pembeli, klik <strong>Mark as Delivered</strong>.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <div className="mt-0.5 bg-emerald-100 text-emerald-700 p-1.5 rounded text-xs font-bold px-2 shrink-0">5. COMPLETED</div>
                <div>
                  <p className="text-xs text-slate-600">Pesanan ditutup (Barang diterima & Lunas).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-6 pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-base">4. Keuangan: Tagihan, Pembayaran & Refund</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1 flex items-center gap-2"><Receipt className="w-4 h-4 text-indigo-500"/> Invoice (Tagihan)</span>
                <p className="text-xs text-slate-600">Dokumen penagihan resmi. Pesanan bisa memiliki lebih dari 1 tagihan jika pembayaran dicicil per termin waktu.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1 flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-500"/> Payment (Pembayaran Masuk)</span>
                <p className="text-xs text-slate-600">Bukti uang telah diterima di Rekening Bank Kas. Jika statusnya <strong>POSTED</strong>, artinya uang sudah sah masuk buku besar.</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-800 block mb-1 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-rose-500"/> Refund (Pengembalian)</span>
                <p className="text-xs text-slate-600">Pengembalian uang/dana kepada pembeli akibat retur atau pesanan dibatalkan. Mengurangi angka Net Paid.</p>
              </div>
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
