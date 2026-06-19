import React, { useState } from "react";
import { Modal } from "../../../../components/ui/modal";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { CurrencyInput } from "../../../../components/ui/currency-input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { CreateWriteOffPayload } from "@/types/receivable";

interface WriteOffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWriteOffPayload) => Promise<void>;
  maxAmount: number;
}

export function WriteOffFormModal({
  isOpen,
  onClose,
  onSubmit,
  maxAmount,
}: WriteOffFormModalProps) {
  const [formData, setFormData] = useState<CreateWriteOffPayload>({
    writeOffDate: new Date().toISOString().split("T")[0],
    amount: maxAmount,
    reason: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Penghapusan Piutang (Write-Off)" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 text-rose-800 text-sm mb-4">
          <p className="font-semibold mb-1">Warning!</p>
          <p>Writing off a receivable means declaring the remaining balance as uncollectible loss. This action requires OWNER privilege and is generally irreversible.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="writeOffDate">Tanggal Penghapusan *</Label>
            <Input
              id="writeOffDate"
              type="date"
              required
              value={formData.writeOffDate}
              onChange={(e) => setFormData({ ...formData, writeOffDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="amount">Jumlah Dihapuskan (Rp) *</Label>
            <CurrencyInput
              id="amount"
              required
              value={formData.amount}
              onChange={(val) => {
                if (val > maxAmount) val = maxAmount;
                setFormData({ ...formData, amount: val });
              }}
            />
            <p className="text-xs text-slate-500 mt-1">Maks: Rp {maxAmount.toLocaleString()}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="reason">Alasan Penghapusan *</Label>
          <Textarea
            id="reason"
            required
            rows={2}
            placeholder="Kenapa piutang ini dihapuskan?"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
          <Button type="submit" disabled={loading} className="bg-rose-600 hover:bg-rose-700 text-white">
            {loading ? "Memproses..." : "Hapuskan Piutang"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
