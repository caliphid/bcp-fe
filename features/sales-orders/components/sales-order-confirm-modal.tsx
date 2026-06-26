import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { SalesOrder } from "@/types/sales-order";
import { useTranslation } from "../../../hooks/use-translation";

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
  const { t } = useTranslation();
  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={isLoading ? () => {} : onClose} title={t("features.salesOrders.confirmModal.title")} className="max-w-lg">
      <div className="text-center space-y-5">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("features.salesOrders.confirmModal.heading")}</h2>
          <p className="text-slate-500">
            {t("features.salesOrders.confirmModal.desc")} <span className="font-bold text-slate-800">{order.orderCode}</span>.
          </p>
        </div>

        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm text-left flex gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-900">{t("features.salesOrders.confirmModal.warning")}</p>
            <ul className="list-disc list-inside space-y-1 text-amber-800/90">
              <li>{t("features.salesOrders.confirmModal.stockReservation")} <strong>{t("features.salesOrders.confirmModal.stockReservationBold")}</strong> {t("features.salesOrders.confirmModal.stockReservationSuffix")}</li>
              <li>{t("features.salesOrders.confirmModal.onHandNote")}</li>
              <li>{t("features.salesOrders.confirmModal.locked")}</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full">
            {t("common.actions.back")}
          </Button>
          <Button variant="default" onClick={onConfirm} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {t("features.salesOrders.confirmModal.confirmBtn")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
