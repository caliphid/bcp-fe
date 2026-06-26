import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import { useAccounts } from "@/features/accounts/hooks/use-accounts";
import { categoriesApi } from "@/features/categories/api";
import { AsyncSearchableSelect } from "@/components/ui/async-searchable-select";
import { SalesOrder, CreateSalesOrderPaymentRequest } from "@/types/sales-order";
import { Loader2, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "../../../hooks/use-translation";

interface PaymentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SalesOrder;
  onSubmit: (data: CreateSalesOrderPaymentRequest) => Promise<void>;
  isLoading: boolean;
}

export function PaymentCreateModal({
  isOpen,
  onClose,
  order,
  onSubmit,
  isLoading,
}: PaymentCreateModalProps) {
  const { t } = useTranslation();
  const { data: accounts } = useAccounts();
  const [formData, setFormData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    accountId: "",
    categoryId: "",
    method: "BANK_TRANSFER",
    amount: "",
    notes: "",
  });

  const grandTotal = parseFloat(order.grandTotal || "0");
  const paidAmount = order.payments?.filter(p => p.status === 'POSTED').reduce((acc, p) => acc + parseFloat(p.amount), 0) || 0;
  const remainingBalance = grandTotal - paidAmount;

  const loadCategories = async (inputValue: string) => {
    try {
      const res = await categoriesApi.getCategories({
        search: inputValue,
        type: "IN",
        status: "ACTIVE",
        limit: 50,
      });
      return res.data.map((c: any) => ({
        value: c.id,
        label: c.name,
      }));
    } catch (error) {
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId) {
      toast.error(t("features.salesOrders.paymentModal.selectAccountRequired"));
      return;
    }
    const amountVal = parseFloat(formData.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error(t("features.salesOrders.paymentModal.amountRequired"));
      return;
    }
    if (amountVal > remainingBalance) {
      toast.error(`${t("features.salesOrders.paymentModal.exceedsBill")} ${remainingBalance.toLocaleString("id-ID")})`);
      return;
    }

    const payload: CreateSalesOrderPaymentRequest = {
      paymentDate: formData.paymentDate,
      accountId: formData.accountId,
      method: formData.method,
      amount: formData.amount,
      notes: formData.notes,
    };
    
    if (formData.categoryId) {
      payload.categoryId = formData.categoryId;
    }

    await onSubmit(payload);
    
    // Reset
    setFormData({
      paymentDate: new Date().toISOString().split("T")[0],
      accountId: "",
      categoryId: "",
      method: "BANK_TRANSFER",
      amount: "",
      notes: "",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title={t("features.salesOrders.paymentModal.title")} className="max-w-lg">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{t("features.salesOrders.paymentModal.receivePayment")}</h2>
            <p className="text-sm text-slate-500">{t("features.salesOrders.paymentModal.salesOrder")} {order.orderCode}</p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-500">{t("features.salesOrders.paymentModal.totalBill")}</span>
            <span className="text-sm font-medium">Rp {grandTotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
            <span className="text-sm text-slate-500">{t("features.salesOrders.paymentModal.paid")}</span>
            <span className="text-sm font-medium text-emerald-600">Rp {paidAmount.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-700">{t("features.salesOrders.paymentModal.remaining")}</span>
            <span className="text-lg font-bold text-rose-600">Rp {remainingBalance.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("features.salesOrders.paymentModal.paymentDate")}</Label>
            <Input
              type="date"
              required
              disabled={isLoading}
              value={formData.paymentDate}
              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("features.salesOrders.paymentModal.paymentMethod")}</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
                disabled={isLoading}
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              >
                <option value="BANK_TRANSFER">{t("features.salesOrders.paymentModal.bankTransfer")}</option>
                <option value="CASH">{t("features.salesOrders.paymentModal.cash")}</option>
                <option value="EWALLET">{t("features.salesOrders.paymentModal.eWallet")}</option>
                <option value="MARKETPLACE_BALANCE">{t("features.salesOrders.paymentModal.marketplaceBalance")}</option>
                <option value="OTHER">{t("features.salesOrders.paymentModal.other")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>{t("features.salesOrders.paymentModal.receiverAccount")}</Label>
            <select
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={isLoading}
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            >
              <option value="">{t("features.salesOrders.paymentModal.selectAccount")}</option>
              {accounts?.map((acc: any) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            </div>
          </div>

            <div className="space-y-2">
              <Label>{t("features.salesOrders.paymentModal.paymentAmount")}</Label>
              <CurrencyInput
                required
                disabled={isLoading}
                value={Number(formData.amount || 0)}
                onChange={(val) => setFormData({ ...formData, amount: String(val) })}
                placeholder={remainingBalance.toString()}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: remainingBalance.toString() })}
                  className="text-xs text-primary-600 font-medium hover:underline"
                >
                  {t("features.salesOrders.paymentModal.fullPayment")}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("features.salesOrders.paymentModal.category")}</Label>
              <AsyncSearchableSelect
                value={formData.categoryId}
                onChange={(e: any) => setFormData({ ...formData, categoryId: e.target.value })}
                loadOptions={loadCategories}
                placeholder="-- Ketik nama kategori --"
                className="bg-white text-sm"
              />
            </div>


          <div className="space-y-2">
            <Label>{t("common.labels.notes")}</Label>
            <Input
              disabled={isLoading}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("features.salesOrders.paymentModal.notesPh")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit" variant="default" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("common.actions.save")}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
