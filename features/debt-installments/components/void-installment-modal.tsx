import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface VoidInstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  installmentCode: string;
  onConfirm: (voidReason: string) => Promise<void>;
}

export function VoidInstallmentModal({
  isOpen,
  onClose,
  installmentCode,
  onConfirm,
}: VoidInstallmentModalProps) {
  const [voidReason, setVoidReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidReason.trim()) {
      setError("Please provide a reason for voiding");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirm(voidReason);
      onClose();
    } catch (err) {
      const e = err as {
        response?: { data?: { message?: string | string[] } };
      };
      const msg = e.response?.data?.message;
      setError(
        Array.isArray(msg)
          ? msg.join(", ")
          : msg || "Failed to void installment",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setVoidReason("");
        setError(null);
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[425px] bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="bg-rose-50 p-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-4">
            <AlertTriangle className="h-8 w-8 text-rose-600" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center text-rose-900">
              Batalkan Cicilan
            </DialogTitle>
          </DialogHeader>
          <p className="text-rose-600/80 text-sm text-center mt-2 font-medium">
            Apakah Anda yakin ingin membatalkan cicilan <br />
            <span className="text-rose-700 font-bold">{installmentCode}</span>?
          </p>
          <p className="text-slate-600 text-xs text-center mt-2">
            Tindakan ini akan membatalkan cicilan dan menyesuaikan saldo hutang.
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
            <Label className="text-slate-700 font-medium">
              Alasan Pembatalan <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              placeholder="Jelaskan alasan pembatalan cicilan ini..."
              className="resize-none rounded-xl focus:ring-rose-500 border-slate-200"
              rows={3}
              required
              minLength={3}
              maxLength={255}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              disabled={loading}
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
              className="px-6 py-2 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 shadow-sm shadow-rose-200 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Membatalkan...
                </>
              ) : (
                "Batalkan Cicilan"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
