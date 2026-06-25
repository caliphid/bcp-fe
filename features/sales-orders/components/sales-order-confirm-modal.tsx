import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { SalesOrder } from "@/types/sales-order";

interface SalesOrderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  order?: SalesOrder | null;
}

export function SalesOrderConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  order,
}: SalesOrderConfirmModalProps) {
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title="Confirm Sales Order">
      <div className="p-6 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Konfirmasi Order?</h2>
          <p className="text-slate-500">
            Anda akan mengonfirmasi Sales Order <span className="font-bold text-slate-800">{order.orderCode}</span>.
          </p>
        </div>

        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm text-left flex gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-900">Perhatian:</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800/90">
              <li>Sistem akan melakukan <strong>reservasi stok</strong> pada produk.</li>
              <li>Stok fisik (<span className="italic">onHand</span>) belum berkurang.</li>
              <li>Pesanan tidak dapat diubah lagi (terkunci).</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full">
            Kembali
          </Button>
          <Button variant="default" onClick={onConfirm} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Ya, Konfirmasi Order
          </Button>
        </div>
      </div>
    </Modal>
  );
}
