import { MarketplaceSettlement } from "../../../types/marketplace";
import { SettlementLinesTable } from "./settlement-lines-table";
import { AllocationSnapshotSection } from "./allocation-snapshot-section";
import { CustomerSummaryPanel } from "./customer-summary-panel";
import { Button } from "../../../components/ui/button";
import { useAuthStore } from "../../../store/auth-store";
import { useTranslation } from "../../../hooks/use-translation";
import { useState } from "react";
import { AddSettlementLinesModal } from "./add-settlement-lines-modal";
import { marketplaceSettlementApi } from "../api";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { Building2, Calendar, FileText, Banknote, AlertTriangle, Play, RefreshCw, CheckCircle2, Ban, Activity, HelpCircle } from "lucide-react";
import { Modal } from "../../../components/ui/modal";

interface MarketplaceSettlementDetailViewProps {
  data: MarketplaceSettlement;
  onMutate: () => void;
}

export function MarketplaceSettlementDetailView({ data, onMutate }: MarketplaceSettlementDetailViewProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const canVoid = user?.role === "OWNER";

  const [isAddLinesOpen, setIsAddLinesOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const formatMoney = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const handleAction = async (action: 'validate' | 'match' | 'mark-ready' | 'post' | 'void') => {
    if (!confirm(`Are you sure you want to ${action} this settlement?`)) return;
    
    setIsProcessing(true);
    try {
      switch (action) {
        case 'validate': await marketplaceSettlementApi.validateSettlement(data.id); break;
        case 'match': await marketplaceSettlementApi.matchSettlement(data.id); break;
        case 'mark-ready': await marketplaceSettlementApi.markSettlementReady(data.id); break;
        case 'post': await marketplaceSettlementApi.postSettlement(data.id); break;
        case 'void': await marketplaceSettlementApi.voidSettlement(data.id); break;
      }
      toast.success(`Settlement action ${action} successful.`);
      onMutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${action} settlement.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm col-span-2 relative">
          
          <div className="absolute top-4 right-4 z-10">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTutorial(true)} 
              className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Penjelasan Halaman
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><FileText className="w-3 h-3"/> Settlement Code</p>
              <p className="font-medium text-slate-800">{data.settlementCode}</p>
              <p className="text-xs text-slate-500 mt-1">Ext ID: {data.externalSettlementId}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Building2 className="w-3 h-3"/> Account</p>
              <p className="font-medium text-slate-800">{data.marketplaceAccount?.name}</p>
              <p className="text-xs text-slate-500 mt-1">{data.marketplaceAccount?.marketplaceType}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Settlement Date</p>
              <p className="font-medium text-slate-800">{dayjs(data.settlementDate).format("DD MMM YYYY")}</p>
              {data.payoutDate && <p className="text-xs text-slate-500 mt-1">Payout: {dayjs(data.payoutDate).format("DD MMM YYYY")}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="w-3 h-3"/> Status</p>
              <p className="font-medium text-slate-800">{data.status}</p>
              <p className="text-xs text-slate-500 mt-1">Posting: {data.postingStatus}</p>
              {data.transaction && <p className="text-[10px] text-blue-600 font-semibold mt-1">TXN: {data.transaction.transactionCode}</p>}
            </div>
          </div>
        </div>
        
        {/* Customer Summary Panel */}
        <div className="col-span-1">
          <CustomerSummaryPanel settlementId={data.id} />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Banknote className="w-5 h-5 text-emerald-600"/> Financial Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Gross Amount</p>
            <p className="text-lg font-bold text-slate-700 mt-1">{formatMoney(data.summary?.grossSettlementAmount)}</p>
          </div>
          <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
            <p className="text-xs text-red-600 font-medium">Total Fees</p>
            <p className="text-lg font-bold text-red-700 mt-1">{formatMoney(data.summary?.totalFeeAmount)}</p>
          </div>
          <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
            <p className="text-xs text-red-600 font-medium">Refund / Penalty</p>
            <p className="text-lg font-bold text-red-700 mt-1">
              {formatMoney((data.summary?.totalRefundAmount || 0) + (data.summary?.totalPenaltyAmount || 0))}
            </p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-700 font-medium">Net Settlement Amount</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">{formatMoney(data.summary?.netSettlementAmount)}</p>
          </div>
        </div>
        
        {data.summary?.reconciliationDifference !== 0 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-800">Reconciliation Difference</h4>
              <p className="text-xs text-amber-700 mt-1">
                There is a difference of <span className="font-bold">{formatMoney(data.summary?.reconciliationDifference)}</span> between expected and actual settlement. Please review unmatched lines or manual adjustments.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-2 items-center justify-between">
        <div className="text-sm font-semibold text-slate-700">Actions</div>
        <div className="flex gap-2">
          {canEdit && ['DRAFT', 'NEEDS_REVIEW'].includes(data.status) && (
            <Button size="sm" variant="outline" onClick={() => setIsAddLinesOpen(true)} disabled={isProcessing}>
              <Play className="w-4 h-4 mr-2" /> Add Lines
            </Button>
          )}
          {canEdit && data.status === 'DRAFT' && (
            <Button size="sm" onClick={() => handleAction('validate')} disabled={isProcessing}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Validate
            </Button>
          )}
          {canEdit && ['DRAFT', 'NEEDS_REVIEW'].includes(data.status) && (
            <Button size="sm" onClick={() => handleAction('match')} disabled={isProcessing}>
              <RefreshCw className="w-4 h-4 mr-2" /> Auto Match
            </Button>
          )}
          {canEdit && data.status === 'NEEDS_REVIEW' && (
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleAction('mark-ready')} disabled={isProcessing}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Ready
            </Button>
          )}
          {canEdit && data.status === 'READY' && (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleAction('post')} disabled={isProcessing}>
              <Banknote className="w-4 h-4 mr-2" /> Post to Ledger
            </Button>
          )}
          {canVoid && ['DRAFT', 'NEEDS_REVIEW', 'READY', 'POSTED'].includes(data.status) && data.status !== 'VOID' && (
            <Button size="sm" variant="destructive" onClick={() => handleAction('void')} disabled={isProcessing}>
              <Ban className="w-4 h-4 mr-2" /> Void Settlement
            </Button>
          )}
        </div>
      </div>

      {/* Lines Table */}
      <SettlementLinesTable 
        lines={data.lines} 
        canEdit={canEdit} 
        status={data.status} 
        onMutate={onMutate} 
      />

      {/* Allocations Snapshot */}
      <AllocationSnapshotSection allocations={data.allocations} />
      
      <AddSettlementLinesModal 
        isOpen={isAddLinesOpen} 
        onClose={() => setIsAddLinesOpen(false)} 
        settlementId={data.id} 
        onSuccess={onMutate} 
      />

      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Membaca Detail Settlement" className="max-w-3xl">
        <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          <p className="mb-2">Halaman ini menampilkan rincian dari satu dokumen Settlement. Berikut adalah penjelasan komponen-komponennya:</p>
          
          <h4 className="font-bold text-slate-900 mb-3 text-base">Penjelasan Bagian Detail:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-1">Status Posting</span>
              <p className="text-xs text-slate-600">Menunjukkan apakah data ini masih dalam wujud draft atau sudah resmi dicatat (Posted) ke dalam buku besar akuntansi (Ledger).</p>
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-1">Gross Amount</span>
              <p className="text-xs text-slate-600">Total nilai kotor (pendapatan bersih penjualan) sebelum dipotong biaya-biaya admin marketplace.</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-1">Total Fees & Refund</span>
              <p className="text-xs text-slate-600">Potongan-potongan biaya yang dibebankan pihak marketplace, serta dana pengembalian pesanan batal/komplain.</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800 block mb-1">Net Settlement Amount</span>
              <p className="text-xs text-slate-600">Nilai akhir (bersih) yang seharusnya masuk/ditransfer ke rekening bank perusahaan.</p>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 md:col-span-2">
              <span className="font-semibold text-amber-800 block mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Reconciliation Difference</span>
              <p className="text-xs text-amber-700">Jika muncul peringatan ini, berarti terdapat selisih pencatatan antara yang dihitung sistem dengan laporan settlement marketplace. Harap cek kembali baris yang tidak sinkron.</p>
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
