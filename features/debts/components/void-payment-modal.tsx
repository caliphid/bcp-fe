import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";

interface VoidPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  paymentCode: string;
}

export function VoidPaymentModal({ isOpen, onClose, onConfirm, paymentCode }: VoidPaymentModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Reason is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onConfirm(reason);
      setReason("");
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : (msg || "Gagal membatalkan pembayaran"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Batalkan Pembayaran">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-100">
          <p><strong>Peringatan:</strong> Anda akan membatalkan (void) pembayaran <strong>{paymentCode}</strong>.</p>
          <p className="mt-1">Tindakan ini juga akan membatalkan transaksi yang terhubung dan mengembalikan sisa hutang seperti semula. Tindakan ini tidak dapat dibatalkan.</p>
        </div>

        <div className="space-y-2">
          <Label>Alasan Pembatalan *</Label>
          <Input
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Mengapa pembayaran ini dibatalkan?"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white" disabled={loading}>
            {loading ? "Membatalkan..." : "Konfirmasi Batal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
