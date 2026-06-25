import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Ban, AlertTriangle, Loader2 } from "lucide-react";
import { SalesOrderPayment } from "@/types/sales-order";
import { Input } from "@/components/ui/input";

interface PaymentVoidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (voidReason: string) => Promise<void>;
  isLoading: boolean;
  payment?: SalesOrderPayment | null;
}

export function PaymentVoidModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  payment,
}: PaymentVoidModalProps) {
  const [reason, setReason] = useState("");

  if (!payment) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    await onConfirm(reason.trim());
    setReason("");
  };

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title="Void Payment" className="max-w-lg">
      <div className="text-center space-y-5">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ban className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Void Pembayaran?</h2>
          <p className="text-slate-500">
            Anda akan membatalkan pembayaran senilai <span className="font-bold text-slate-800">Rp {parseFloat(payment.amount).toLocaleString("id-ID")}</span>.
          </p>
        </div>

        <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm text-left flex gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <div className="space-y-1">
            <p className="font-semibold text-red-900">Perhatian:</p>
            <p className="text-red-800/90">
              Transaksi *Cash In* terkait pada keuangan juga akan ikut ter-void. Aksi ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <div className="text-left space-y-2">
          <label className="text-sm font-semibold text-slate-700">Alasan Void <span className="text-red-500">*</span></label>
          <Input 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tulis alasan void..."
            disabled={isLoading}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full">
            Kembali
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isLoading || !reason.trim()} className="w-full">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Void Pembayaran
          </Button>
        </div>
      </div>
    </Modal>
  );
}
