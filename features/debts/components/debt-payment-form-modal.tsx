import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { DebtItem, CreateDebtPaymentPayload } from "../../../types/debt";
import { useAccounts } from "../../accounts/hooks/use-accounts";
import { useCategories } from "../../categories/hooks/use-categories";
import { formatCurrency } from "../utils/formatters";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTranslation } from "../../../hooks/use-translation";

interface DebtPaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDebtPaymentPayload) => Promise<void>;
  debt: DebtItem | null;
}

export function DebtPaymentFormModal({ isOpen, onClose, onSubmit, debt }: DebtPaymentFormModalProps) {
  const { t } = useTranslation();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const [formData, setFormData] = useState<Partial<CreateDebtPaymentPayload>>({});
  const [amountStr, setAmountStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevDebt, setPrevDebt] = useState(debt);

  if (isOpen !== prevIsOpen || debt !== prevDebt) {
    setPrevIsOpen(isOpen);
    setPrevDebt(debt);
    if (isOpen) {
      setFormData({
        paymentDate: new Date().toISOString().split("T")[0],
        accountId: "",
        categoryId: "",
        amount: debt ? parseFloat(debt.monthlyInstallment || "0") : 0,
        description: "",
        notes: "",
        attachmentUrl: "",
      });
      setAmountStr(
        debt && debt.monthlyInstallment && parseFloat(debt.monthlyInstallment) > 0
          ? parseFloat(debt.monthlyInstallment).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
          : ""
      );
      setError(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt) return;
    
    // Check if amount exceeds balance
    const currentBalance = parseFloat(debt.currentBalance);
    if ((formData.amount || 0) > currentBalance) {
      setError("Nominal pembayaran tidak boleh melebihi sisa pokok hutang");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        categoryId: formData.categoryId || null,
        description: formData.description || null,
        notes: formData.notes || null,
        attachmentUrl: formData.attachmentUrl || null,
      } as CreateDebtPaymentPayload;

      await onSubmit(payload);
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : (msg || "Gagal menyimpan pembayaran"));
    } finally {
      setLoading(false);
    }
  };

  if (!debt) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("features.debts.paymentFormModal.title")} className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg mb-4">
          <p className="text-sm font-medium text-indigo-900">{debt.debtName}</p>
          <div className="flex justify-between mt-1 text-sm text-indigo-700">
            <span>{t("features.debts.paymentFormModal.remainingBalance")}:</span>
            <span className="font-bold">{formatCurrency(debt.currentBalance)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>{t("features.debts.paymentFormModal.paymentDate")} *</Label>
            <Input
              required
              type="date"
              value={formData.paymentDate || ""}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("features.debts.paymentFormModal.amount")} *</Label>
            <Input
              required
              type="text"
              inputMode="numeric"
              value={amountStr}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setAmountStr(val.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                setFormData({
                  ...formData,
                  amount: val ? parseFloat(val) : 0,
                });
              }}
              placeholder={t("features.debts.paymentFormModal.amountPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("features.debts.paymentFormModal.sourceAccount")} *</Label>
            <SearchableSelect
              required
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.accountId || ""}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            >
              <option value="" disabled>{t("features.debts.paymentFormModal.selectAccount")}</option>
              {accounts?.filter(a => a.status === "ACTIVE").map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </SearchableSelect>
          </div>

          <div className="space-y-2">
            <Label>{t("features.debts.paymentFormModal.category")}</Label>
            <SearchableSelect
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.categoryId || ""}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">{t("features.debts.paymentFormModal.defaultCategory")}</option>
              {categories?.filter(c => c.status === "ACTIVE").map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SearchableSelect>
          </div>

          <div className="space-y-2">
            <Label>{t("features.debts.paymentFormModal.description")}</Label>
            <Input
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t("features.debts.paymentFormModal.descriptionPlaceholder")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {t("common.actions.cancel")}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? t("common.actions.saving") : t("common.actions.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
