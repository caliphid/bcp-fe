"use client";
import { extractErrorMessage } from "@/lib/error";
import { toast } from "react-hot-toast";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "../../../../../store/auth-store";
import { useCrewCashbonDetail } from "../../../../../features/crew-cashbons/hooks/use-crew-cashbon-detail";
import { crewCashbonsApi } from "../../../../../features/crew-cashbons/api";
import { CreateCashbonRepaymentPayload, CashbonRepaymentItem } from "../../../../../types/crew-cashbon";
import { Button } from "../../../../../components/ui/button";
import { ArrowLeft, Edit, Ban, CheckCircle2, AlertTriangle, Plus, FileText, ChevronRight, Banknote } from "lucide-react";
import { CashbonFormModal } from "../../../../../features/crew-cashbons/components/cashbon-form-modal";
import { RepaymentFormModal } from "../../../../../features/crew-cashbons/components/repayment-form-modal";
import { formatCurrency, formatDate, formatDateTime } from "../../../../../features/debts/utils/formatters";
import { getCashbonStatusLabel, getCashbonStatusColor, getRepaymentMethodLabel, getRepaymentStatusLabel, getRepaymentStatusColor } from "../../../../../features/crew-cashbons/utils/formatters";

export default function CrewCashbonDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const user = useAuthStore((s) => s.user);
  const { data, loading, refetch, error } = useCrewCashbonDetail(id);

  const [activeTab, setActiveTab] = useState<"overview" | "repayments">("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  
  const role = user?.role;
  const canEdit = role === "OWNER" || role === "ADMIN_FINANCE";
  const canVoid = role === "OWNER";
  const canClose = role === "OWNER" || role === "ADMIN_FINANCE";
  const canCreateRepayment = role === "OWNER" || role === "ADMIN_FINANCE";

  if (loading) return <div className="p-8 text-center animate-pulse">Loading detail...</div>;
  if (error || !data) return <div className="p-8 text-center text-rose-600">Error: {error || "Not found"}</div>;

  const handleEditSubmit = async (payload: any) => {
    await crewCashbonsApi.updateCrewCashbon(id, payload);
    refetch();
  };

  const handleCreateRepayment = async (payload: CreateCashbonRepaymentPayload) => {
    await crewCashbonsApi.createCashbonRepayment(id, payload);
    refetch();
  };

  const handleVoidCashbon = async () => {
    const reason = window.prompt("Alasan pembatalan cashbon (minimal 3 karakter):");
    if (reason && reason.length >= 3) {
      if (confirm("Apakah Anda yakin ingin membatalkan cashbon ini? Transaksi pencairan juga akan dibatalkan.")) {
        try {
          await crewCashbonsApi.voidCrewCashbon(id, { voidReason: reason });
          refetch();
        } catch (e) {
          toast.error(extractErrorMessage(e, "Gagal membatalkan cashbon"));
        }
      }
    } else if (reason !== null) {
      toast.error("Alasan harus minimal 3 karakter");
    }
  };

  const handleCloseCashbon = async () => {
    if (confirm("Apakah Anda yakin ingin menutup cashbon ini secara manual? Pastikan sisa hutang sudah 0.")) {
      try {
        await crewCashbonsApi.closeCrewCashbon(id);
        refetch();
      } catch (e) {
        toast.error(extractErrorMessage(e, "Gagal menutup cashbon"));
      }
    }
  };

  const handleVoidRepayment = async (repaymentId: string) => {
    const reason = window.prompt("Alasan pembatalan pembayaran (minimal 3 karakter):");
    if (reason && reason.length >= 3) {
      if (confirm("Apakah Anda yakin ingin membatalkan pembayaran ini?")) {
        try {
          await crewCashbonsApi.voidCashbonRepayment(repaymentId, { voidReason: reason });
          refetch();
        } catch (e) {
          toast.error(extractErrorMessage(e, "Gagal membatalkan pembayaran"));
        }
      }
    } else if (reason !== null) {
      toast.error("Alasan harus minimal 3 karakter");
    }
  };

  const isClosed = data.status === "PAID_OFF" || data.status === "VOID";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" className="shrink-0" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {data.cashbonCode}
            <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${getCashbonStatusColor(data.status)}`}>
              {getCashbonStatusLabel(data.status)}
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Crew: <span className="font-semibold text-slate-700">{data.crew.name}</span></p>
        </div>
        
        <div className="ml-auto flex gap-2">
          {canEdit && data.status !== "VOID" && (
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {canVoid && data.status !== "VOID" && (
             <Button variant="outline" className="text-rose-600 hover:bg-rose-50 border-rose-200" onClick={handleVoidCashbon}>
               <Ban className="h-4 w-4 mr-2" />
               Void Cashbon
             </Button>
          )}
          {canClose && data.status !== "VOID" && data.status !== "PAID_OFF" && parseFloat(data.remainingBalance) === 0 && (
             <Button variant="outline" className="text-emerald-600 hover:bg-emerald-50 border-emerald-200" onClick={handleCloseCashbon}>
               <CheckCircle2 className="h-4 w-4 mr-2" />
               Tutup Cashbon
             </Button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "overview" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("repayments")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "repayments" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Riwayat Pembayaran
          <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
            {data.repayments.length}
          </span>
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                Informasi Utama
              </h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Tanggal Cashbon</p>
                  <p className="font-medium text-slate-900">{formatDate(data.cashbonDate)}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Jatuh Tempo</p>
                  <p className="font-medium text-slate-900">{data.dueDate ? formatDate(data.dueDate) : "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Tujuan (Purpose)</p>
                  <p className="font-medium text-slate-900">{data.purpose || "-"}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Unit Bisnis</p>
                  <p className="font-medium text-slate-900">{data.businessUnit?.name || "Global"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 mb-1">Catatan</p>
                  <p className="text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[60px]">
                    {data.notes || "Tidak ada catatan."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Informasi Akuntansi & Sistem</h3>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Akun Pencairan</p>
                  <p className="font-medium text-slate-900">{data.disbursementAccount?.name || "-"} {data.disbursementAccount ? `(${data.disbursementAccount.bankName})` : ""}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Transaksi Pencairan (Kas Keluar)</p>
                  {data.disbursementTransaction ? (
                    <div className="flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer" onClick={() => router.push(`/dashboard/transactions?search=${data.disbursementTransaction?.transactionCode}`)}>
                      {data.disbursementTransaction.transactionCode}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  ) : (
                    <p className="text-slate-500">-</p>
                  )}
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Kategori Akuntansi</p>
                  <p className="font-medium text-slate-900">{data.category?.name || "-"}</p>
                </div>
                <div>
                   <p className="text-slate-500 mb-1">Dibuat Oleh</p>
                   <p className="font-medium text-slate-900">{data.createdBy?.name || "-"} pada {formatDateTime(data.createdAt)}</p>
                </div>
              </div>
            </div>

            {data.status === "VOID" && (
              <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-rose-900">Cashbon Dibatalkan</h3>
                    <p className="text-sm text-rose-700 mt-1">
                      Alasan: <span className="font-medium">{data.voidReason}</span>
                    </p>
                    <p className="text-xs text-rose-600 mt-2">Dibatalkan oleh {data.voidedBy?.name || "-"} pada {data.voidedAt ? formatDateTime(data.voidedAt) : "-"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
              <h3 className="font-semibold text-slate-900 mb-6">Ringkasan Nilai</h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total Pokok Cashbon</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.principalAmount)}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Total Terbayar</p>
                      <p className="text-lg font-semibold text-emerald-600">{formatCurrency(data.amountPaid)}</p>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{data.progressPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${data.progressPercentage >= 100 ? 'bg-emerald-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(data.progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Sisa Hutang</p>
                  <p className="text-xl font-bold text-rose-600">{formatCurrency(data.remainingBalance)}</p>
                </div>
              </div>
            </div>
            
            {!isClosed && canCreateRepayment && (
              <Button className="w-full" size="lg" onClick={() => setIsRepaymentModalOpen(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Catat Pembayaran
              </Button>
            )}
          </div>
        </div>
      )}

      {activeTab === "repayments" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-semibold text-slate-900">Riwayat Pembayaran</h3>
              <p className="text-sm text-slate-500 mt-1">Daftar semua cicilan yang sudah masuk untuk cashbon ini.</p>
            </div>
            {!isClosed && canCreateRepayment && (
               <Button onClick={() => setIsRepaymentModalOpen(true)}>
                 <Plus className="h-4 w-4 mr-2" />
                 Catat Pembayaran
               </Button>
            )}
          </div>
          
          {data.repayments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              Belum ada riwayat pembayaran.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.repayments.map((rp: CashbonRepaymentItem) => (
                <div key={rp.id} className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${rp.status === 'VOID' ? 'bg-slate-50 opacity-75' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0 mt-1 ${rp.status === 'VOID' ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900">{rp.repaymentCode}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${getRepaymentStatusColor(rp.status)}`}>
                          {getRepaymentStatusLabel(rp.status)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md border border-slate-200 bg-white text-slate-600 font-medium">
                          {getRepaymentMethodLabel(rp.method)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>{formatDate(rp.repaymentDate)}</span>
                        {rp.account && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            {rp.account.name}
                          </span>
                        )}
                      </p>
                      {rp.description && (
                        <p className="text-sm text-slate-700 mt-2">{rp.description}</p>
                      )}
                      {rp.status === 'VOID' && (
                        <p className="text-xs text-rose-600 mt-2 bg-rose-50 p-2 rounded-md border border-rose-100">
                          <span className="font-semibold">Dibatalkan:</span> {rp.voidReason}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-3 pl-14 md:pl-0">
                    <div className="text-lg font-bold text-emerald-600">
                      {rp.status === 'VOID' && <span className="line-through text-slate-400 mr-2">{formatCurrency(rp.amount)}</span>}
                      {rp.status !== 'VOID' && formatCurrency(rp.amount)}
                    </div>
                    {rp.transaction && (
                       <p className="text-xs text-indigo-600 hover:underline cursor-pointer" onClick={() => router.push(`/dashboard/transactions?search=${rp.transaction?.transactionCode}`)}>
                         {rp.transaction.transactionCode}
                       </p>
                    )}
                    {rp.status !== 'VOID' && canVoid && (
                      <Button variant="ghost" size="sm" className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => handleVoidRepayment(rp.id)}>
                        <Ban className="h-3 w-3 mr-1.5" />
                        Void
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CashbonFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={data}
      />

      <RepaymentFormModal
        isOpen={isRepaymentModalOpen}
        onClose={() => setIsRepaymentModalOpen(false)}
        onSubmit={handleCreateRepayment}
        maxAmount={parseFloat(data.remainingBalance)}
      />
    </div>
  );
}
