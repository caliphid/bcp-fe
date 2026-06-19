import React, { useState } from "react";
import Select from "react-select";
import { Modal } from "../../../../components/ui/modal";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { CurrencyInput } from "../../../../components/ui/currency-input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { CreateCollectionPayload, CollectionMethod } from "@/types/receivable";
import { useAccounts } from "../../../accounts/hooks/use-accounts";
import { useCategories } from "../../../categories/hooks/use-categories";
import { mapCollectionMethodLabel } from "../../utils/formatters";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface CollectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCollectionPayload) => Promise<void>;
  maxAmount: number;
}

export function CollectionFormModal({
  isOpen,
  onClose,
  onSubmit,
  maxAmount,
}: CollectionFormModalProps) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const [formData, setFormData] = useState<CreateCollectionPayload>({
    collectionDate: new Date().toISOString().split("T")[0],
    accountId: "",
    amount: 0,
    method: "BANK_TRANSFER",
    categoryId: "",
    description: "",
    notes: "",
    attachmentUrl: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.accountId || payload.method === "OFFSET") delete payload.accountId;
      if (!payload.categoryId) delete payload.categoryId;

      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const methods: CollectionMethod[] = ["CASH", "BANK_TRANSFER", "EWALLET", "OFFSET", "OTHER"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Pengumpulan (Collection)" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="collectionDate">Tanggal Pengumpulan *</Label>
            <Input
              id="collectionDate"
              type="date"
              required
              value={formData.collectionDate}
              onChange={(e) => setFormData({ ...formData, collectionDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="amount">Jumlah (Rp) *</Label>
            <CurrencyInput
              id="amount"
              required
              value={formData.amount}
              onChange={(val) => {
                if (val > maxAmount) val = maxAmount;
                setFormData({ ...formData, amount: val });
              }}
            />
            <p className="text-xs text-slate-500 mt-1">Maksimal: Rp {maxAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="method">Metode *</Label>
            <SearchableSelect
              id="method"
              required
              value={formData.method}
              onChange={(e) => setFormData({ ...formData, method: e.target.value as CollectionMethod })}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {methods.map((m) => (
                <option key={m} value={m}>{mapCollectionMethodLabel(m)}</option>
              ))}
            </SearchableSelect>
          </div>
          <div>
            <Label htmlFor="accountId">Akun Penerima *</Label>
            <Select
              id="accountId"
              isDisabled={formData.method === "OFFSET"}
              value={accounts?.map(a => ({ value: a.id, label: a.name })).find(o => o.value === formData.accountId) || null}
              onChange={(option) => setFormData({ ...formData, accountId: option ? option.value : "" })}
              options={accounts?.map(a => ({ value: a.id, label: a.name })) || []}
              isClearable
              isSearchable
              placeholder="-- Ketik untuk mencari akun --"
              className="text-sm"
            />
            {formData.method === "OFFSET" && (
              <p className="text-xs text-amber-600 mt-1">OFFSET method will not create a cashflow transaction.</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="categoryId">Kategori Cashflow</Label>
          <Select
            id="categoryId"
            isDisabled={formData.method === "OFFSET"}
            value={categories?.map(c => ({ value: c.id, label: c.name })).find(o => o.value === formData.categoryId) || null}
            onChange={(option) => setFormData({ ...formData, categoryId: option ? option.value : "" })}
            options={categories?.map(c => ({ value: c.id, label: c.name })) || []}
            isClearable
            isSearchable
            placeholder="-- Ketik untuk mencari kategori --"
            className="text-sm"
          />
        </div>

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

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Catat Pengumpulan (Collection)"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
