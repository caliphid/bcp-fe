import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { AlertCircle, FileEdit } from "lucide-react";
import { DebtInstallmentItem, CreateDebtInstallmentPayload, UpdateDebtInstallmentPayload } from "../../../types/installment";
import { DebtItem } from "../../../types/debt";
import { debtsApi } from "../../debts/api";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface InstallmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, isUpdate: boolean, debtId?: string) => Promise<void>;
  initialData?: DebtInstallmentItem | null;
  preselectedDebtId?: string | null;
}

export function InstallmentFormModal({ isOpen, onClose, onSubmit, initialData, preselectedDebtId }: InstallmentFormModalProps) {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUpdate = !!initialData;
  const isPaid = isUpdate && initialData?.status === "PAID";
  const hasPayments = isUpdate && initialData!.paymentCount > 0;

  const [debtId, setDebtId] = useState("");
  const [installmentNumber, setInstallmentNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setDebtId(initialData.debt?.id || "");
        setInstallmentNumber(initialData.installmentNumber.toString());
        setDueDate(initialData.dueDate.split("T")[0]);
        setAmountDue(parseFloat(initialData.amountDue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
        setNotes(initialData.notes || "");
      } else {
        setDebtId(preselectedDebtId || "");
        setInstallmentNumber("");
        setDueDate(new Date().toISOString().split("T")[0]);
        setAmountDue("");
        setNotes("");
      }
      setError(null);
      
      if (!isUpdate) {
        debtsApi.getDebts({ status: "ACTIVE", limit: 100 })
          .then(res => setDebts(res.data))
          .catch(() => setError("Failed to load debts"));
      }
    }
  }, [isOpen, initialData, preselectedDebtId, isUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUpdate && !debtId) {
      setError("Please select a debt");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      if (isUpdate) {
        const payload: UpdateDebtInstallmentPayload = {
          dueDate: dueDate || undefined,
          amountDue: !hasPayments ? parseFloat(amountDue.replace(/\./g, "")) : undefined,
          notes: notes || undefined,
        };
        await onSubmit(payload, true);
      } else {
        const payload: CreateDebtInstallmentPayload = {
          installmentNumber: parseInt(installmentNumber, 10),
          dueDate,
          amountDue: parseFloat(amountDue.replace(/\./g, "")),
          notes: notes || undefined,
        };
        await onSubmit(payload, false, debtId);
      }
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : (msg || "Failed to save installment"));
    } finally {
      setLoading(false);
    }
  };

  const selectedDebt = debts.find(d => d.id === debtId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <FileEdit className="h-5 w-5" />
              {isUpdate ? "Edit Cicilan" : "Buat Cicilan Manual"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-300 text-sm mt-2 opacity-90">
            {isUpdate ? "Ubah jadwal cicilan yang ada." : "Buat satu entri cicilan secara manual."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!isUpdate && (
            <div className="space-y-1.5">
              <Label className="text-slate-700">Hutang <span className="text-rose-500">*</span></Label>
              <SearchableSelect
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-50"
                value={debtId}
                onChange={(e) => setDebtId(e.target.value)}
                required
                disabled={!!preselectedDebtId}
              >
                <option value="">Pilih hutang aktif</option>
                {debts.map(d => (
                  <option key={d.id} value={d.id}>{d.debtName} - Rem: {parseFloat(d.currentBalance).toLocaleString('id-ID')}</option>
                ))}
              </SearchableSelect>
              {selectedDebt && (
                <p className="text-xs text-slate-500">
                  Sisa Saldo: Rp {parseFloat(selectedDebt.currentBalance).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          )}

          {isUpdate && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
              <p className="text-slate-500">Hutang: <span className="font-medium text-slate-800">{initialData.debt?.debtName}</span></p>
              <p className="text-slate-500 mt-1">Kode: <span className="font-medium text-slate-800">{initialData.installmentCode}</span></p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700">No. Cicilan <span className="text-rose-500">*</span></Label>
              <Input
                type="number"
                required
                min="1"
                className="h-10 rounded-xl disabled:bg-slate-50 disabled:text-slate-500"
                value={installmentNumber}
                onChange={(e) => setInstallmentNumber(e.target.value)}
                disabled={isUpdate}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">Tanggal Jatuh Tempo <span className="text-rose-500">*</span></Label>
              <Input
                type="date"
                required
                className="h-10 rounded-xl disabled:bg-slate-50 disabled:text-slate-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isPaid}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700">Nominal Tagihan <span className="text-rose-500">*</span></Label>
            <Input
              type="text"
              inputMode="numeric"
              required
              placeholder="Nominal"
              className="h-10 rounded-xl disabled:bg-slate-50 disabled:text-slate-500"
              value={amountDue}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setAmountDue(val.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
              }}
              disabled={isPaid || hasPayments}
            />
            {hasPayments && !isPaid && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> Tidak dapat mengubah nominal karena sudah ada pembayaran
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-slate-700">Catatan (Opsional)</Label>
            <Textarea
              placeholder="Catatan internal..."
              className="resize-none rounded-xl"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-slate-800 rounded-xl hover:bg-slate-900 shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
