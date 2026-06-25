import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackageCheck, AlertTriangle, Loader2 } from "lucide-react";
import { SalesOrder } from "@/types/sales-order";

interface SalesOrderFulfillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { notes?: string }) => Promise<void>;
  isLoading: boolean;
  order?: SalesOrder | null;
}

export function SalesOrderFulfillModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  order,
}: SalesOrderFulfillModalProps) {
  const [notes, setNotes] = useState("");

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title="Fulfill Sales Order" className="max-w-lg">
      <div className="text-center space-y-5">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <PackageCheck className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Fulfill Order?</h2>
          <p className="text-slate-500">
            Anda akan melakukan Fulfillment pada Sales Order <span className="font-bold text-slate-800">{order.orderCode}</span>.
          </p>
        </div>

        <div className="bg-indigo-50 text-indigo-900 p-4 rounded-xl text-sm text-left flex gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-indigo-600" />
          <div className="space-y-1">
            <p className="font-semibold text-indigo-900">Perhatian:</p>
            <p className="text-indigo-800/90">
              Fulfill order akan mengurangi reserved stock dan stok fisik (on hand). Pastikan reservasi stok masih valid sebelum melanjutkan.
            </p>
          </div>
        </div>

        <div className="text-left space-y-2">
          <label className="text-sm font-semibold text-slate-700">Catatan Fulfill (Opsional)</label>
          <Input 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tulis catatan jika ada..."
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full">
            Kembali
          </Button>
          <Button variant="default" onClick={() => onConfirm({ notes: notes.trim() || undefined })} disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Fulfill Order
          </Button>
        </div>
      </div>
    </Modal>
  );
}
