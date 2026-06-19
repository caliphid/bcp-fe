import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useAccounts } from "../../accounts/hooks/use-accounts";
import { financeApi } from "../api";
import { extractErrorMessage } from "@/lib/error";
import { toast } from "react-hot-toast";

interface TransferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransferFormModal({ isOpen, onClose, onSuccess }: TransferFormModalProps) {
  const { data: accounts } = useAccounts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transferDate: new Date().toISOString().split("T")[0],
    sourceAccountId: "",
    destinationAccountId: "",
    amount: "",
    description: "",
    notes: "",
  });

  const activeAccounts = accounts?.filter(a => a.status === 'ACTIVE') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sourceAccountId || !formData.destinationAccountId || !formData.amount || !formData.transferDate) {
      toast.error("Mohon lengkapi semua field yang wajib");
      return;
    }
    if (formData.sourceAccountId === formData.destinationAccountId) {
      toast.error("Rekening sumber dan tujuan tidak boleh sama");
      return;
    }
    
    setLoading(true);
    try {
      await financeApi.createAccountTransfer({
        transferDate: formData.transferDate,
        sourceAccountId: formData.sourceAccountId,
        destinationAccountId: formData.destinationAccountId,
        amount: Number(formData.amount),
        description: formData.description,
        notes: formData.notes,
      });
      toast.success("Transfer antar rekening berhasil dicatat");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal mencatat transfer rekening"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Transfer Internal" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-sm text-indigo-800 mb-4">
          <p className="font-semibold mb-1">Penting:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Transfer ini akan memindahkan saldo dari rekening sumber ke rekening tujuan.</li>
            <li>Transaksi transfer <strong>tidak</strong> mempengaruhi Laba Bersih perusahaan.</li>
            <li>Aksi ini akan menghasilkan 2 transaksi yang saling terhubung secara otomatis (1 IN, 1 OUT).</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Transfer *</label>
            <Input
              type="date"
              value={formData.transferDate}
              onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nominal (Rp) *</label>
            <Input
              type="number"
              min="1"
              placeholder="Contoh: 5000000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dari Rekening (Sumber) *</label>
            <SearchableSelect
              value={formData.sourceAccountId}
              onChange={(e) => setFormData({ ...formData, sourceAccountId: e.target.value })}
              required
            >
              <option value="">Pilih Rekening Sumber</option>
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </SearchableSelect>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ke Rekening (Tujuan) *</label>
            <SearchableSelect
              value={formData.destinationAccountId}
              onChange={(e) => setFormData({ ...formData, destinationAccountId: e.target.value })}
              required
            >
              <option value="">Pilih Rekening Tujuan</option>
              {activeAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </SearchableSelect>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Ringkas</label>
          <Input
            placeholder="Contoh: Top up Petty Cash"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
          <textarea
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
            placeholder="Keterangan tambahan..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={loading}>Batal</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Memproses...' : 'Simpan Transfer'}</Button>
        </div>
      </form>
    </Modal>
  );
}
