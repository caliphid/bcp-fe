import { Transaction } from "../../../types/transaction";
import { Modal } from "../../../components/ui/modal";
import { StatusBadge } from "../../../components/ui/status-badge";
import { env } from "../../../lib/env";
import { useState } from "react";
import { AttachmentViewerModal } from "../../../components/ui/attachment-viewer-modal";
import { useTranslation } from "../../../hooks/use-translation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: Props) {
  const { t } = useTranslation();
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  if (!transaction) return null;

  const formatCurrency = (val: string) => {
    const num = Number(val);
    return isNaN(num) ? "Rp 0" : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat('id-ID', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    }).format(new Date(dateStr));
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat('id-ID', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateStr));
  };

  const DetailRow = ({ label, value, className = "" }: { label: string, value: React.ReactNode, className?: string }) => (
    <div className={`grid grid-cols-[120px_1fr] gap-4 py-2 border-b border-slate-100 last:border-0 ${className}`}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800">{value}</span>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("features.transactions.detailModal.title")} className="max-w-2xl">
      <div className="space-y-1">
        <DetailRow label={t("features.transactions.detailModal.trxCode")} value={transaction.transactionCode} />
        <DetailRow label={t("features.transactions.detailModal.date")} value={formatDate(transaction.transactionDate)} />
        <DetailRow label={t("features.transactions.detailModal.status")} value={
          <StatusBadge status={transaction.status} />
        } />
        
        {transaction.status === 'VOID' && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-100 my-2">
            <p className="text-xs text-red-600 font-semibold mb-1">{t("features.transactions.detailModal.voidInfo")}</p>
            <p className="text-sm text-red-800"><span className="font-medium">{t("features.transactions.detailModal.voidReason")}</span> {transaction.voidReason || '-'}</p>
            <p className="text-sm text-red-800"><span className="font-medium">{t("features.transactions.detailModal.voidedAt")}</span> {formatDateTime(transaction.voidedAt)}</p>
            {transaction.voidedBy && (
              <p className="text-sm text-red-800"><span className="font-medium">{t("features.transactions.detailModal.voidedBy")}</span> {transaction.voidedBy.name}</p>
            )}
          </div>
        )}

        <DetailRow label={t("features.transactions.detailModal.type")} value={
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
            transaction.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {transaction.type}
          </span>
        } />
        
        <DetailRow label={t("features.transactions.detailModal.amount")} className="text-lg" value={
          <span className={transaction.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}>
            {formatCurrency(transaction.amount)}
          </span>
        } />

        <DetailRow label={t("features.transactions.detailModal.account")} value={transaction.account?.name || '-'} />
        <DetailRow label={t("features.transactions.detailModal.category")} value={transaction.category?.name || '-'} />
        <DetailRow label={t("features.transactions.detailModal.businessUnit")} value={transaction.businessUnit?.name || '-'} />

        <DetailRow label={t("features.transactions.detailModal.description")} value={transaction.description || '-'} />
        <DetailRow label={t("features.transactions.detailModal.notes")} value={transaction.notes || '-'} />
        
        {transaction.attachmentUrl && (
          <DetailRow label="Attachment" value={
            <button
              type="button"
              onClick={() => setIsViewerOpen(true)}
              className="text-indigo-600 hover:underline text-sm font-medium"
            >
              {t("features.transactions.detailModal.viewAttachment")}
            </button>
          } />
        )}

        <div className="mt-6 pt-4 border-t border-slate-200">
          <DetailRow label={t("features.transactions.detailModal.createdBy")} value={transaction.createdBy?.name || '-'} />
          <DetailRow label={t("features.transactions.detailModal.createdAt")} value={formatDateTime(transaction.createdAt)} />
          <DetailRow label={t("features.transactions.detailModal.updatedAt")} value={formatDateTime(transaction.updatedAt)} />
        </div>
      </div>

      <AttachmentViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        url={transaction.attachmentUrl ? (transaction.attachmentUrl.startsWith('http') ? transaction.attachmentUrl : `${env.NEXT_PUBLIC_API_URL}${transaction.attachmentUrl}`) : null}
      />
    </Modal>
  );
}
