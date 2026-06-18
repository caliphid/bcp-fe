import { Transaction } from "../../../types/transaction";
import { Modal } from "../../../components/ui/modal";
import { StatusBadge } from "../../../components/ui/status-badge";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function TransactionDetailModal({ isOpen, onClose, transaction }: Props) {
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
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details">
      <div className="space-y-1">
        <DetailRow label="Trx Code" value={transaction.transactionCode} />
        <DetailRow label="Date" value={formatDate(transaction.transactionDate)} />
        <DetailRow label="Status" value={
          <StatusBadge status={transaction.status} />
        } />
        
        {transaction.status === 'VOID' && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-100 my-2">
            <p className="text-xs text-red-600 font-semibold mb-1">Void Information</p>
            <p className="text-sm text-red-800"><span className="font-medium">Reason:</span> {transaction.voidReason || '-'}</p>
            <p className="text-sm text-red-800"><span className="font-medium">Voided At:</span> {formatDateTime(transaction.voidedAt)}</p>
            {transaction.voidedBy && (
              <p className="text-sm text-red-800"><span className="font-medium">Voided By:</span> {transaction.voidedBy.name}</p>
            )}
          </div>
        )}

        <DetailRow label="Type" value={
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
            transaction.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {transaction.type}
          </span>
        } />
        
        <DetailRow label="Amount" className="text-lg" value={
          <span className={transaction.type === 'IN' ? 'text-emerald-600' : 'text-red-600'}>
            {formatCurrency(transaction.amount)}
          </span>
        } />

        <DetailRow label="Account" value={transaction.account?.name || '-'} />
        <DetailRow label="Category" value={transaction.category?.name || '-'} />
        <DetailRow label="Business Unit" value={transaction.businessUnit?.name || '-'} />
        
        <DetailRow label="Description" value={transaction.description || '-'} />
        <DetailRow label="Notes" value={transaction.notes || '-'} />
        
        {transaction.attachmentUrl && (
          <DetailRow label="Attachment" value={
            <a href={transaction.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              View Attachment
            </a>
          } />
        )}

        <div className="mt-6 pt-4 border-t border-slate-200">
          <DetailRow label="Created By" value={transaction.createdBy?.name || '-'} />
          <DetailRow label="Created At" value={formatDateTime(transaction.createdAt)} />
          <DetailRow label="Updated At" value={formatDateTime(transaction.updatedAt)} />
        </div>
      </div>
    </Modal>
  );
}
