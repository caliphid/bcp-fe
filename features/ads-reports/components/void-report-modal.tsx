import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { AlertCircle } from "lucide-react";

interface VoidReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  reportCode: string;
}

export function VoidReportModal({
  isOpen,
  onClose,
  onSubmit,
  reportCode,
}: VoidReportModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 3) {
      setError("Alasan void harus diisi minimal 3 karakter.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await onSubmit(reason);
      setReason("");
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to void report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Batalkan (Void) Report"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
          <div className="text-sm text-rose-900">
            <strong>PERINGATAN!</strong> Membatalkan report <span className="font-mono">{reportCode}</span> juga akan membatalkan semua transaksi cashflow (revenue & cost) yang terhubung dengannya. Aksi ini tidak dapat di-undo.
          </div>
        </div>

        <div className="space-y-2">
          <Label>Alasan Void <span className="text-rose-500">*</span></Label>
          <Textarea
            required
            className="w-full resize-none"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Sebutkan alasan mengapa report ini dibatalkan..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="destructive" disabled={loading || reason.trim().length < 3}>
            {loading ? "Memproses..." : "Ya, Void Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
