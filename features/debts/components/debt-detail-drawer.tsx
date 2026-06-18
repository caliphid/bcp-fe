import { useState } from "react";
import { DebtDetail, DebtPaymentItem } from "../../../types/debt";
import { useAuthStore } from "../../../store/auth-store";
import { X, Plus, Ban, Eye, FileText } from "lucide-react";
import { formatCurrency, formatDate, getDebtStatusColor, getDebtStatusLabel, getPaymentStatusColor, getPaymentStatusLabel, getDebtTypeLabel } from "../utils/formatters";
import { Button } from "../../../components/ui/button";
import { DataTable } from "../../../components/ui/data-table";

interface DebtDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtDetail | null;
  loading: boolean;
  onAddPayment: () => void;
  onVoidPayment: (payment: DebtPaymentItem) => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onCloseDebt: () => void;
}

export function DebtDetailDrawer({
  isOpen,
  onClose,
  debt,
  loading,
  onAddPayment,
  onVoidPayment,
  onActivate,
  onDeactivate,
  onCloseDebt
}: DebtDetailDrawerProps) {
  const user = useAuthStore(s => s.user);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Detail Hutang</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading || !debt ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-32 bg-slate-200 rounded-xl" />
              <div className="h-64 bg-slate-200 rounded-xl" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{debt.debtName}</h3>
                    <p className="text-sm text-slate-500">{debt.debtCode} • {debt.lenderName}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getDebtStatusColor(debt.status)}`}>
                    {getDebtStatusLabel(debt.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Pokok Hutang</p>
                    <p className="font-semibold text-slate-800">{formatCurrency(debt.principalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Sisa Hutang</p>
                    <p className="font-bold text-rose-600">{formatCurrency(debt.currentBalance)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Total Dibayar</p>
                    <p className="font-semibold text-emerald-600">{formatCurrency(debt.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Progress</p>
                    <p className="font-semibold text-slate-800">{debt.progressPercentage}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div 
                    className={`h-full rounded-full transition-all ${debt.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min(debt.progressPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {user?.role !== "STAFF_INPUT" && (
                <div className="flex flex-wrap gap-2">
                  {debt.status === "ACTIVE" && (
                    <Button onClick={onAddPayment} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" /> Buat Pembayaran
                    </Button>
                  )}
                  {user?.role === "OWNER" && debt.status === "INACTIVE" && (
                    <Button onClick={onActivate} size="sm" variant="outline" className="text-indigo-600 border-indigo-200">
                      Aktifkan
                    </Button>
                  )}
                  {user?.role === "OWNER" && debt.status === "ACTIVE" && debt.paymentCount === 0 && (
                    <Button onClick={onDeactivate} size="sm" variant="outline" className="text-slate-600">
                      Nonaktifkan
                    </Button>
                  )}
                  {(user?.role === "OWNER" || user?.role === "ADMIN_FINANCE") && debt.status === "ACTIVE" && parseFloat(debt.currentBalance) === 0 && (
                    <Button onClick={onCloseDebt} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Tutup Hutang
                    </Button>
                  )}
                </div>
              )}

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-4 text-sm">Informasi Hutang</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Unit Bisnis</span>
                      <span className="font-medium">{debt.businessUnit?.name || "Global"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tipe Hutang</span>
                      <span className="font-medium">{getDebtTypeLabel(debt.type)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Suku Bunga</span>
                      <span className="font-medium">{debt.interestRate || "0"}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cicilan Bulanan</span>
                      <span className="font-medium">{formatCurrency(debt.monthlyInstallment)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-4 text-sm">Linimasa</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tanggal Mulai</span>
                      <span className="font-medium">{formatDate(debt.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jatuh Tempo</span>
                      <span className="font-medium">{formatDate(debt.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dibuat Pada</span>
                      <span className="font-medium">{formatDate(debt.createdAt)}</span>
                    </div>
                    {debt.closedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ditutup Pada</span>
                        <span className="font-medium text-emerald-600">{formatDate(debt.closedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {debt.notes && (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm">Catatan</h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{debt.notes}</p>
                </div>
              )}

              {/* Payment History */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h4 className="font-semibold text-slate-800">Riwayat Pembayaran</h4>
                </div>
                
                {debt.payments.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    Belum ada riwayat pembayaran.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">Tanggal</th>
                          <th className="px-4 py-3">Kode</th>
                          <th className="px-4 py-3">Nominal</th>
                          <th className="px-4 py-3">Akun</th>
                          <th className="px-4 py-3">Status</th>
                          {user?.role !== "STAFF_INPUT" && <th className="px-4 py-3 text-right">Aksi</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {debt.payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-slate-600">{formatDate(p.paymentDate)}</td>
                            <td className="px-4 py-3 font-medium text-slate-700">{p.paymentCode}</td>
                            <td className="px-4 py-3 font-medium text-emerald-600">{formatCurrency(p.amount)}</td>
                            <td className="px-4 py-3 text-slate-600">{p.account.name}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getPaymentStatusColor(p.status)}`}>
                                {getPaymentStatusLabel(p.status)}
                              </span>
                            </td>
                            {user?.role !== "STAFF_INPUT" && (
                              <td className="px-4 py-3 text-right">
                                {p.status === "POSTED" && (
                                  <button
                                    onClick={() => onVoidPayment(p)}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Batalkan Pembayaran (Void)"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
