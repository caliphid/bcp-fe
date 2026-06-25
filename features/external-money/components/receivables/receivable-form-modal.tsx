import React, { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui/modal";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { CurrencyInput } from "../../../../components/ui/currency-input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { CreateReceivablePayload, ReceivableType } from "@/types/receivable";
import { useExternalParties } from "../../hooks/use-external-parties";
import { useBusinessUnits } from "../../../business-units/hooks/use-business-units";
import { useAccounts } from "../../../accounts/hooks/use-accounts";
import { useCategories } from "../../../categories/hooks/use-categories";
import { mapReceivableTypeLabel } from "../../utils/formatters";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface ReceivableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReceivablePayload) => Promise<void>;
}

export function ReceivableFormModal({
  isOpen,
  onClose,
  onSubmit,
}: ReceivableFormModalProps) {
  const { data: parties } = useExternalParties(); // Consider setting status="ACTIVE" in store or passing it via hook
  const { data: businessUnits } = useBusinessUnits();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const activeParties = parties.filter(p => p.status === "ACTIVE");

  const [formData, setFormData] = useState<CreateReceivablePayload>({
    externalPartyId: "",
    businessUnitId: "",
    receivableType: "CUSTOMER_RECEIVABLE",
    receivableDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    principalAmount: 0,
    title: "",
    description: "",
    notes: "",
    attachmentUrl: "",
    createCashflowDisbursement: false,
    disbursementAccountId: "",
    categoryId: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        externalPartyId: "",
        businessUnitId: "",
        receivableType: "CUSTOMER_RECEIVABLE",
        receivableDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        principalAmount: 0,
        title: "",
        description: "",
        notes: "",
        attachmentUrl: "",
        createCashflowDisbursement: false,
        disbursementAccountId: "",
        categoryId: "",
      });
    }
  }, [isOpen]);

  const handleTypeChange = (type: ReceivableType) => {
    const isCustomer = type === "CUSTOMER_RECEIVABLE";
    setFormData((prev) => ({
      ...prev,
      receivableType: type,
      createCashflowDisbursement: !isCustomer,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.businessUnitId) delete payload.businessUnitId;
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.disbursementAccountId || !payload.createCashflowDisbursement) delete payload.disbursementAccountId;
      if (!payload.categoryId) delete payload.categoryId;

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const typeOptions: ReceivableType[] = [
    "CUSTOMER_RECEIVABLE",
    "PERSONAL_LOAN",
    "PARTNER_LOAN",
    "BUSINESS_ADVANCE",
    "TEMPORARY_EXTERNAL_FUND",
    "DEPOSIT",
    "EXTERNAL_INVESTMENT",
    "OTHER",
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Piutang / Pinjaman" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="receivableType">Tipe Uang Eksternal *</Label>
            <SearchableSelect
              id="receivableType"
              required
              value={formData.receivableType}
              onChange={(e) => handleTypeChange(e.target.value as ReceivableType)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {typeOptions.map((type) => (
                <option key={type} value={type}>{mapReceivableTypeLabel(type)}</option>
              ))}
            </SearchableSelect>
          </div>
          <div>
            <Label htmlFor="externalPartyId">Pihak Eksternal *</Label>
            <SearchableSelect
              id="externalPartyId"
              required
              value={formData.externalPartyId}
              onChange={(e) => setFormData({ ...formData, externalPartyId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Party --</option>
              {activeParties.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.partyCode})</option>
              ))}
            </SearchableSelect>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Judul / Keterangan *</Label>
            <Input
              id="title"
              required
              placeholder="e.g. Loan for inventory"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="businessUnitId">Unit Bisnis</Label>
            <SearchableSelect
              id="businessUnitId"
              value={formData.businessUnitId}
              onChange={(e) => setFormData({ ...formData, businessUnitId: e.target.value })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Unit (Optional) --</option>
              {businessUnits?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </SearchableSelect>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="receivableDate">Tanggal Pinjaman/Piutang *</Label>
            <Input
              id="receivableDate"
              type="date"
              required
              value={formData.receivableDate}
              onChange={(e) => setFormData({ ...formData, receivableDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Tanggal Jatuh Tempo</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="principalAmount">Jumlah Pokok (Rp) *</Label>
            <Input
              id="principalAmount"
              type="number"
              min="0"
              required
              value={formData.principalAmount || ""}
              onChange={(e) => setFormData({ ...formData, principalAmount: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="createCashflowDisbursement"
              checked={formData.createCashflowDisbursement}
              onChange={(e) => setFormData({ ...formData, createCashflowDisbursement: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
            />
            <Label htmlFor="createCashflowDisbursement" className="cursor-pointer">
              Create Cashflow Disbursement (Cash OUT)
            </Label>
          </div>

          {formData.createCashflowDisbursement && (
            <div className="grid grid-cols-2 gap-4 pl-6 border-l-2 border-indigo-100">
              <div>
                <Label htmlFor="disbursementAccountId">Akun Sumber Dana *</Label>
                <SearchableSelect
                  id="disbursementAccountId"
                  required={formData.createCashflowDisbursement}
                  value={formData.disbursementAccountId}
                  onChange={(e) => setFormData({ ...formData, disbursementAccountId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Source Account --</option>
                  {accounts?.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </SearchableSelect>
              </div>
              <div>
                <Label htmlFor="categoryId">Kategori Cashflow</Label>
                <SearchableSelect
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Category --</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </SearchableSelect>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="notes">Catatan Internal</Label>
            <Textarea
              id="notes"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Tambah Piutang / Pinjaman"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
