import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DebtInstallmentDetail } from "../../../types/installment";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getInstallmentStatusColor,
  getInstallmentStatusLabel,
  getInstallmentPaymentStatusColor,
  getInstallmentPaymentStatusLabel,
} from "../utils/formatters";
import {
  X,
  CalendarClock,
  Ban,
  Wallet,
  FileText,
  CheckCircle2,
  History,
} from "lucide-react";
import { useAuthStore } from "../../../store/auth-store";

interface InstallmentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  installment: DebtInstallmentDetail | null;
  loading: boolean;
  onAddPayment?: () => void;
  onVoidPayment?: (paymentCode: string) => void;
}

export function InstallmentDetailDrawer({
  isOpen,
  onClose,
  installment,
  loading,
  onAddPayment,
  onVoidPayment,
}: InstallmentDetailDrawerProps) {
  const user = useAuthStore((s) => s.user);
  const canEdit = user?.role !== "STAFF_INPUT";

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed inset-y-0 right-0 z-50 h-full w-full max-w-lg bg-slate-50 p-0 shadow-2xl transition-transform duration-300 sm:rounded-none data-[state=closed]:translate-x-full data-[state=open]:translate-x-0 border-0 flex flex-col">
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Detail Cicilan</h2>
            <p className="text-sm text-slate-500">
              {installment?.installmentCode || "Memuat..."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading || !installment ? (
            <div className="p-6 space-y-4">
              <div className="h-24 bg-white rounded-2xl animate-pulse" />
              <div className="h-48 bg-white rounded-2xl animate-pulse" />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Main Info Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getInstallmentStatusColor(installment.status)}`}
                    >
                      {getInstallmentStatusLabel(installment.status)}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-800 mt-2">
                      {formatCurrency(installment.amountDue)}
                    </h3>
                    <p className="text-sm text-slate-500">Tagihan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800">
                      No. {installment.installmentNumber}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-end gap-1">
                      <CalendarClock className="h-3 w-3" /> Jatuh Tempo{" "}
                      {formatDate(installment.dueDate)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Dibayar</p>
                    <p className="font-semibold text-emerald-600">
                      {formatCurrency(installment.amountPaid)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Sisa</p>
                    <p className="font-semibold text-rose-600">
                      {formatCurrency(installment.remainingAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Wallet className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-slate-500 text-xs">Hutang</p>
                      <p className="font-medium text-slate-800">
                        {installment.debt?.debtName}
                      </p>
                    </div>
                  </div>

                  {installment.notes && (
                    <div className="flex gap-3 text-sm">
                      <FileText className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-500 text-xs">Catatan</p>
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {installment.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {installment.status === "VOID" && (
                    <div className="flex gap-3 text-sm p-3 bg-rose-50 rounded-xl">
                      <Ban className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-rose-700 font-medium text-xs">
                          Alasan Pembatalan
                        </p>
                        <p className="text-rose-600 text-sm mt-0.5">
                          {installment.voidReason}
                        </p>
                        <p className="text-rose-400 text-xs mt-1">
                          Dibatalkan pada {formatDateTime(installment.voidedAt)}{" "}
                          oleh {installment.voidedBy?.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment History Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-500" />
                    <h3 className="font-semibold text-sm text-slate-800">
                      Riwayat Pembayaran
                    </h3>
                  </div>
                  {canEdit &&
                    parseFloat(installment.remainingAmount) > 0 &&
                    installment.status !== "VOID" && (
                      <button
                        onClick={onAddPayment}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Bayar
                      </button>
                    )}
                </div>

                <div className="p-0">
                  {!installment.payments ||
                  installment.payments.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
                        <Wallet className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        Belum ada pembayaran
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Cicilan ini belum memiliki pembayaran sama sekali.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {installment.payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="p-5 flex justify-between gap-4"
                        >
                          <div>
                            <p className="font-bold text-slate-800">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatDate(payment.paymentDate)} •{" "}
                              {payment.account.name}
                            </p>

                            {payment.description && (
                              <p className="text-sm text-slate-600 mt-2">
                                {payment.description}
                              </p>
                            )}

                            {payment.status === "VOID" && (
                              <div className="mt-2 text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded inline-block">
                                <span className="font-bold">
                                  Alasan Pembatalan:
                                </span>{" "}
                                {payment.voidReason}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-medium">
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                {payment.paymentCode}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 shrink-0">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${getInstallmentPaymentStatusColor(payment.status)}`}
                            >
                              {getInstallmentPaymentStatusLabel(payment.status)}
                            </span>

                            {canEdit &&
                              payment.status === "POSTED" &&
                              onVoidPayment && (
                                <button
                                  onClick={() =>
                                    onVoidPayment(payment.paymentCode)
                                  }
                                  className="text-xs font-medium text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition-colors"
                                >
                                  Batalkan
                                </button>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
