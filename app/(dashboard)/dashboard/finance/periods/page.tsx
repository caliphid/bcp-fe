"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { PeriodsTable } from "@/features/finance/components/periods-table";
import { useFinancialPeriods } from "@/features/finance/hooks/use-finance-analytics";
import { FinancialPeriodResponse } from "@/types/finance";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { financeApi } from "@/features/finance/api";
import { toast } from "react-hot-toast";
import { extractErrorMessage } from "@/lib/error";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Button } from "@/components/ui/button";
import { PeriodFormModal } from "@/features/finance/components/period-form-modal";
import { Plus } from "lucide-react";

export default function FinancialPeriodsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [actionTarget, setActionTarget] = useState<{ action: 'lock' | 'close' | 'reopen', period: FinancialPeriodResponse } | null>(null);
  const [notes, setNotes] = useState("");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [processing, setProcessing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isAuthorized = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE" || user?.role === "STAFF_INPUT";
  const isOwner = user?.role === "OWNER";
  const isFinanceAdmin = user?.role === "ADMIN_FINANCE";
  const isStaffInput = user?.role === "STAFF_INPUT";

  const { data, isLoading, mutate } = useFinancialPeriods({ year: yearFilter });

  if (!isAuthorized) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">
          {t("pages.financePeriods.noAccess")}
        </p>
      </div>
    );
  }

  const handleAction = async () => {
    if (!actionTarget) return;
    
    if (actionTarget.action === 'reopen' && !notes) {
      toast.error(t("pages.financePeriods.reopenReasonRequired"));
      return;
    }

    setProcessing(true);
    try {
      if (actionTarget.action === 'lock') {
        await financeApi.lockFinancialPeriod(actionTarget.period.id, { notes });
        toast.success(t("pages.financePeriods.lockSuccess"));
      } else if (actionTarget.action === 'close') {
        await financeApi.closeFinancialPeriod(actionTarget.period.id, { notes });
        toast.success(t("pages.financePeriods.closeSuccess"));
      } else if (actionTarget.action === 'reopen') {
        await financeApi.reopenFinancialPeriod(actionTarget.period.id, { reason: notes });
        toast.success(t("pages.financePeriods.reopenSuccess"));
      }
      mutate();
      setActionTarget(null);
      setNotes("");
    } catch (err) {
      toast.error(extractErrorMessage(err, t("pages.financePeriods.actionFailed")));
    } finally {
      setProcessing(false);
    }
  };

  const YEARS = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <PageHeader
          title={t("pages.financePeriods.title")}
          description={t("pages.financePeriods.subtitle")}
        />
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">{t("pages.financePeriods.year")}</span>
          <SearchableSelect
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="h-9 w-[120px] rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {YEARS.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </SearchableSelect>

          {!isStaffInput && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="h-9 ml-2">
              <Plus className="h-4 w-4 mr-2" />
              {t("pages.financePeriods.createPeriod")}
            </Button>
          )}
        </div>
      </div>

      <PeriodsTable 
        data={data} 
        loading={isLoading} 
        onActionClick={(action, period) => setActionTarget({ action, period })} 
        isOwner={isOwner}
        isFinanceAdmin={isFinanceAdmin}
        isStaffInput={isStaffInput}
      />

      {actionTarget && (
        <ConfirmDialog
          isOpen={true}
          onCancel={() => {
            setActionTarget(null);
            setNotes("");
          }}
          title={
            actionTarget.action === 'lock' ? t("pages.financePeriods.lockPeriod") :
            actionTarget.action === 'close' ? t("pages.financePeriods.closePeriod") : t("pages.financePeriods.reopenPeriod")
          }
          message={
            actionTarget.action === 'lock' ? t("pages.financePeriods.lockWarning") :
            actionTarget.action === 'close' ? t("pages.financePeriods.closeWarning") :
            t("pages.financePeriods.reopenWarning")
          }
          confirmText={processing ? t("common.actions.processing") : t("common.actions.proceed")}
          onConfirm={handleAction}
          isDestructive={actionTarget.action === 'reopen'}
        >
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {actionTarget.action === 'reopen' ? t("pages.financePeriods.reopenReason") : t("pages.financePeriods.additionalNotes")}
            </label>
            <Input
              placeholder={actionTarget.action === 'reopen' ? t("pages.financePeriods.reopenReasonPh") : t("pages.financePeriods.notesPh")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              required={actionTarget.action === 'reopen'}
            />
          </div>
        </ConfirmDialog>
      )}

      <PeriodFormModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => mutate()} 
      />
    </div>
  );
}
