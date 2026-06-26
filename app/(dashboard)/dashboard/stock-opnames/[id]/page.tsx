"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useStockOpname, useStockOpnameVarianceReport, useStockOpnameReconciliationReport } from "@/features/stock-opnames/hooks/use-stock-opnames";
import { StockOpnameDetailHeader } from "@/features/stock-opnames/components/stock-opname-detail-header";
import { StockOpnameItemsTab } from "@/features/stock-opnames/components/tabs/stock-opname-items-tab";
import { StockOpnameAuditTab } from "@/features/stock-opnames/components/tabs/stock-opname-audit-tab";
import { StockOpnameVarianceTab } from "@/features/stock-opnames/components/tabs/stock-opname-variance-tab";
import { StockOpnameReconciliationTab } from "@/features/stock-opnames/components/tabs/stock-opname-reconciliation-tab";
import { ActionModal } from "@/features/stock-opnames/components/modals/action-modal";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { Ban, CheckCircle, CheckCircle2, SaveAll, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { StockOpnameSessionStatus } from "@/types/stock-opname";
import { stockOpnameApi } from "@/features/stock-opnames/api";

export default function StockOpnameDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  const { data: session, isLoading, mutate } = useStockOpname(id);
  const { data: varianceReport } = useStockOpnameVarianceReport(id);
  const { data: reconciliationReport } = useStockOpnameReconciliationReport(id);

  const [activeTab, setActiveTab] = useState("items");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "REVIEW" | "APPROVE" | "POST" | "CANCEL" | "VOID" | null;
  }>({ isOpen: false, type: null });
  const [isActionLoading, setIsActionLoading] = useState(false);

  if (isLoading || !session) {
    return <div className="p-10 text-center animate-pulse text-slate-500">Loading session details...</div>;
  }

  const isOwnerOrFinance = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const hasVariances = session.varianceItems > 0;

  const handleAction = async (text?: string) => {
    setIsActionLoading(true);
    try {
      if (modalState.type === "REVIEW") await stockOpnameApi.reviewSession(id, { notes: text });
      if (modalState.type === "APPROVE") await stockOpnameApi.approveSession(id, { notes: text });
      if (modalState.type === "POST") await stockOpnameApi.postSession(id);
      if (modalState.type === "CANCEL") await stockOpnameApi.cancelSession(id, { reason: text! });
      if (modalState.type === "VOID") await stockOpnameApi.voidSession(id, { reason: text! });

      toast.success(`Session successfully ${modalState.type?.toLowerCase()}ed`);
      setModalState({ isOpen: false, type: null });
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || `Failed to ${modalState.type?.toLowerCase()} session`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const isReviewerSameAsApprover = modalState.type === "APPROVE" && session.reviewerId === user?.id;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader
          title={`${t("features.stockOpnames.title")}: ${session.sessionCode}`}
          description={t("features.stockOpnames.subtitle")}
          backHref="/dashboard/stock-opnames"
        />
        <div className="flex items-center gap-2 flex-wrap">
          {/* Cancel Action */}
          {isOwnerOrFinance && 
           [StockOpnameSessionStatus.COUNTING, StockOpnameSessionStatus.REVIEW_PENDING, StockOpnameSessionStatus.APPROVED].includes(session.status) && (
            <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 gap-2" onClick={() => setModalState({ isOpen: true, type: "CANCEL" })}>
              <Ban className="w-4 h-4" /> Cancel
            </Button>
          )}

          {/* Review Action */}
          {isOwnerOrFinance && session.status === StockOpnameSessionStatus.REVIEW_PENDING && (
            <Button variant="outline" className="text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100 gap-2" onClick={() => setModalState({ isOpen: true, type: "REVIEW" })}>
              <CheckCircle className="w-4 h-4" /> Review Session
            </Button>
          )}

          {/* Approve Action */}
          {isOwnerOrFinance && session.status === StockOpnameSessionStatus.REVIEW_PENDING && (
            <Button 
              variant="default" 
              className="bg-indigo-600 hover:bg-indigo-700 gap-2" 
              onClick={() => {
                if (session.reviewerId === user?.id) {
                  toast.error("You cannot approve a session you reviewed. Another user must approve.");
                }
                setModalState({ isOpen: true, type: "APPROVE" });
              }}
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Session
            </Button>
          )}

          {/* Post Action */}
          {isOwnerOrFinance && session.status === StockOpnameSessionStatus.APPROVED && !session.isSnapshotStale && (
            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => setModalState({ isOpen: true, type: "POST" })}>
              <SaveAll className="w-4 h-4" /> Post Inventory
            </Button>
          )}

          {/* Void Action */}
          {isOwnerOrFinance && session.status === StockOpnameSessionStatus.POSTED && (
            <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 gap-2" onClick={() => setModalState({ isOpen: true, type: "VOID" })}>
              <Ban className="w-4 h-4" /> Void Posted Session
            </Button>
          )}
        </div>
      </div>

      <StockOpnameDetailHeader session={session} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 border-b border-slate-100 flex gap-6">
          <button 
            className={`h-14 font-medium border-b-2 px-1 ${activeTab === 'items' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('items')}
          >
            {t("features.stockOpnames.detail.tabs.items")}
          </button>
          <button 
            className={`h-14 font-medium border-b-2 px-1 ${activeTab === 'variance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('variance')}
          >
            {t("features.stockOpnames.detail.tabs.variance")}
          </button>
          <button 
            className={`h-14 font-medium border-b-2 px-1 ${activeTab === 'reconciliation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('reconciliation')}
          >
            {t("features.stockOpnames.detail.tabs.reconciliation")}
          </button>
          <button 
            className={`h-14 font-medium border-b-2 px-1 ${activeTab === 'audit' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('audit')}
          >
            {t("features.stockOpnames.detail.tabs.audit")}
          </button>
        </div>
        <div className="p-6">
          {activeTab === 'items' && <StockOpnameItemsTab session={session} onRefresh={mutate} />}
          {activeTab === 'variance' && <StockOpnameVarianceTab session={session} varianceReport={varianceReport} />}
          {activeTab === 'reconciliation' && <StockOpnameReconciliationTab session={session} reconciliationReport={reconciliationReport} />}
          {activeTab === 'audit' && <StockOpnameAuditTab session={session} auditLogs={[]} />}
        </div>
      </div>

      {/* Action Modals */}
      <ActionModal
        isOpen={modalState.isOpen && modalState.type === "REVIEW"}
        onClose={() => setModalState({ isOpen: false, type: null })}
        title={t("features.stockOpnames.modals.reviewTitle")}
        description={t("features.stockOpnames.modals.reviewDesc")}
        inputLabel={t("features.stockOpnames.modals.reviewInput")}
        inputPlaceholder="..."
        actionLabel={t("features.stockOpnames.detail.btnReview")}
        onSubmit={handleAction}
        isRequired={hasVariances}
      />

      <ActionModal
        isOpen={modalState.isOpen && modalState.type === "APPROVE"}
        onClose={() => setModalState({ isOpen: false, type: null })}
        title={t("features.stockOpnames.modals.approveTitle")}
        description={t("features.stockOpnames.modals.approveDesc")}
        inputLabel={t("features.stockOpnames.modals.approveInput")}
        inputPlaceholder="..."
        actionLabel={t("features.stockOpnames.detail.btnApprove")}
        onSubmit={handleAction}
        isRequired={hasVariances}
      />

      <ActionModal
        isOpen={modalState.isOpen && modalState.type === "CANCEL"}
        onClose={() => setModalState({ isOpen: false, type: null })}
        title={t("features.stockOpnames.modals.cancelTitle")}
        description={t("features.stockOpnames.modals.cancelDesc")}
        inputLabel={t("features.stockOpnames.modals.cancelInput")}
        inputPlaceholder="..."
        actionLabel={t("features.stockOpnames.detail.btnCancel")}
        actionVariant="destructive"
        onSubmit={handleAction}
        isRequired={true}
      />

      <ActionModal
        isOpen={modalState.isOpen && modalState.type === "VOID"}
        onClose={() => setModalState({ isOpen: false, type: null })}
        title={t("features.stockOpnames.modals.voidTitle")}
        description={t("features.stockOpnames.modals.voidDesc")}
        inputLabel={t("features.stockOpnames.modals.voidInput")}
        inputPlaceholder="..."
        actionLabel={t("features.stockOpnames.detail.btnVoid")}
        actionVariant="destructive"
        onSubmit={handleAction}
        isRequired={true}
      />

      <ActionModal
        isOpen={modalState.isOpen && modalState.type === "POST"}
        onClose={() => setModalState({ isOpen: false, type: null })}
        title={t("features.stockOpnames.modals.postTitle")}
        description={t("features.stockOpnames.modals.postDesc")}
        inputLabel="Notes"
        inputPlaceholder="..."
        actionLabel={t("features.stockOpnames.detail.btnPost")}
        onSubmit={handleAction}
      />
    </div>
  );
}
