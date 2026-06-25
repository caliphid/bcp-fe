import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { SalesOrderRefund } from "@/types/sales-order";
import { formatMoney } from "@/lib/utils";

interface RefundVoidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading: boolean;
  refund: SalesOrderRefund | null;
}

export function RefundVoidModal({ isOpen, onClose, onConfirm, isLoading, refund }: RefundVoidModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  if (!refund) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Void Refund">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-semibold mb-1">Peringatan Void Refund</p>
            <p>
              Anda akan membatalkan refund sebesar <strong>{formatMoney(refund.amount)}</strong>.
              {refund.returnToStock && (
                <span className="block mt-1 font-medium text-red-700">
                  Karena refund ini mengembalikan stok fisik, void refund akan me-deduct (mengurangi) kembali stok fisik tersebut!
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Alasan Void <span className="text-red-500">*</span></Label>
          <Textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Masukkan alasan pembatalan refund..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" variant="destructive" disabled={isLoading || !reason.trim()}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Konfirmasi Void
          </Button>
        </div>
      </form>
    </Modal>
  );
}
