import { useState, useEffect } from "react";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { AlertCircle, Calendar } from "lucide-react";
import { GenerateDebtInstallmentSchedulePayload } from "../../../types/installment";
import { DebtItem } from "../../../types/debt";
import { debtsApi } from "../../debts/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface GenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    debtId: string,
    data: GenerateDebtInstallmentSchedulePayload,
  ) => Promise<void>;
  preselectedDebtId?: string | null;
}

export function GenerateScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  preselectedDebtId,
}: GenerateScheduleModalProps) {
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [debtId, setDebtId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [numberOfInstallments, setNumberOfInstallments] = useState("");
  const [dueDayOfMonth, setDueDayOfMonth] = useState("");
  const [adjustFinalInstallment, setAdjustFinalInstallment] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setDebtId(preselectedDebtId || "");
      setStartDate(new Date().toISOString().split("T")[0]);
      setInstallmentAmount("");
      setNumberOfInstallments("");
      setDueDayOfMonth("");
      setAdjustFinalInstallment(true);
      setNotes("");
      setError(null);

      // Fetch available debts (ACTIVE)
      debtsApi
        .getDebts({ status: "ACTIVE", limit: 100 })
        .then((res) => setDebts(res.data))
        .catch(() => setError("Failed to load debts"));
    }
  }, [isOpen, preselectedDebtId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtId) {
      setError("Please select a debt");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: GenerateDebtInstallmentSchedulePayload = {
        startDate,
        installmentAmount: parseFloat(installmentAmount.replace(/\./g, "")),
        numberOfInstallments: parseInt(numberOfInstallments, 10),
        frequency: "MONTHLY",
        dueDayOfMonth: dueDayOfMonth ? parseInt(dueDayOfMonth, 10) : undefined,
        adjustFinalInstallment,
        notes: notes || undefined,
      };
      await onSubmit(debtId, payload);
      onClose();
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = e.response?.data?.message;
      setError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to generate schedule",
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedDebt = debts.find((d) => d.id === debtId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5" />
              Buat Jadwal
            </DialogTitle>
          </DialogHeader>
          <p className="text-indigo-100 text-sm mt-2 opacity-90">
            Otomatis membuat jadwal cicilan bulanan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-slate-700">
              Hutang <span className="text-rose-500">*</span>
            </Label>
            <SearchableSelect
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50"
              value={debtId}
              onChange={(e) => setDebtId(e.target.value)}
              required
              disabled={!!preselectedDebtId}
            >
              <option value="">Pilih hutang aktif</option>
              {debts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.debtName} - Rem:{" "}
                  {parseFloat(d.currentBalance).toLocaleString("id-ID")}
                </option>
              ))}
            </SearchableSelect>
            {selectedDebt && (
              <p className="text-xs text-slate-500">
                Sisa Saldo: Rp{" "}
                {parseFloat(selectedDebt.currentBalance).toLocaleString(
                  "id-ID",
                )}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                Tanggal Mulai <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="date"
                required
                className="h-10 rounded-xl"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                Tanggal Jatuh Tempo (1-31)
              </Label>
              <Input
                type="number"
                min="1"
                max="31"
                placeholder="e.g. 5"
                className="h-10 rounded-xl"
                value={dueDayOfMonth}
                onChange={(e) => setDueDayOfMonth(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                Nominal Cicilan <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                required
                placeholder="Nominal per periode"
                className="h-10 rounded-xl"
                value={installmentAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setInstallmentAmount(
                    val.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
                  );
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-700">
                Jumlah Bulan Cicilan <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                required
                min="1"
                max="360"
                className="h-10 rounded-xl"
                value={numberOfInstallments}
                onChange={(e) => setNumberOfInstallments(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="adjustFinal"
              checked={adjustFinalInstallment}
              onChange={(e) => setAdjustFinalInstallment(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label
              htmlFor="adjustFinal"
              className="text-sm font-normal text-slate-700"
            >
              Sesuaikan cicilan terakhir jika total melebihi sisa hutang
            </Label>
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
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Membuat...
                </>
              ) : (
                "Buat Jadwal"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
