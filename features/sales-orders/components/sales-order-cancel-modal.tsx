import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Ban, AlertTriangle, Loader2 } from "lucide-react";
import { SalesOrder, CancelSalesOrderRequest } from "@/types/sales-order";
import { Input } from "@/components/ui/input";
import { useTranslation } from "../../../hooks/use-translation";

interface SalesOrderCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CancelSalesOrderRequest) => Promise<void>;
  isLoading: boolean;
  order?: SalesOrder | null;
}

export function SalesOrderCancelModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  order,
}: SalesOrderCancelModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");

  if (!order) return null;

  const handleSubmit = async () => {
    await onConfirm({ reason: reason.trim() || undefined });
    setReason("");
  };

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title={t("features.salesOrders.cancelModal.title")} className="max-w-lg">
      <div className="text-center space-y-5">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Ban className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("features.salesOrders.cancelModal.heading")}</h2>
          <p className="text-slate-500">
            {t("features.salesOrders.cancelModal.desc")} <span className="font-bold text-slate-800">{order.orderCode}</span>.
          </p>
        </div>

        {order.status === "CONFIRMED" && (
          <div className="bg-red-50 text-red-800 p-4 rounded-xl text-sm text-left flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <div className="space-y-1">
              <p className="font-semibold text-red-900">{t("features.salesOrders.cancelModal.warning")}</p>
              <p className="text-red-800/90">
                {t("features.salesOrders.cancelModal.cancelNote")}
              </p>
            </div>
          </div>
        )}

        <div className="text-left space-y-2">
          <label className="text-sm font-semibold text-slate-700">{t("features.salesOrders.cancelModal.reason")}</label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("features.salesOrders.cancelModal.reasonPh")}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full">
            {t("common.actions.back")}
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t("features.salesOrders.cancelModal.cancelBtn")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
