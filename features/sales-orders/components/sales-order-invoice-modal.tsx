import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Receipt, AlertTriangle } from "lucide-react";
import { SalesOrder, CreateSalesOrderInvoiceRequest } from "@/types/sales-order";
import { useExternalParties } from "@/features/external-money/hooks/use-external-parties";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { formatMoney } from "@/lib/utils";

interface SalesOrderInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSalesOrderInvoiceRequest) => Promise<void>;
  isLoading: boolean;
  order: SalesOrder | undefined;
}

export function SalesOrderInvoiceModal({ isOpen, onClose, onSubmit, isLoading, order }: SalesOrderInvoiceModalProps) {
  const { data: externalParties } = useExternalParties();
  const parties = useMemo(() => externalParties || [], [externalParties]);

  const [externalPartyId, setExternalPartyId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  useMemo(() => {
    if (isOpen) {
      setExternalPartyId("");
      setInvoiceDate(new Date().toISOString().split("T")[0]);
      setDueDate("");
      setNotes("");
      setAttachmentUrl("");
    }
  }, [isOpen]);

  if (!order) return null;

  const totalPaid = order.payments?.filter(p => p.status === 'POSTED').reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;
  const totalRefunded = order.refunds?.filter(r => r.status === 'POSTED').reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
  const netPaid = totalPaid - totalRefunded;
  const principalAmount = parseFloat(order.grandTotal) - netPaid;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalPartyId || !invoiceDate) return;

    const payload: CreateSalesOrderInvoiceRequest = {
      externalPartyId,
      invoiceDate: new Date(invoiceDate),
    };

    if (dueDate) payload.dueDate = new Date(dueDate);
    if (notes) payload.notes = notes;
    if (attachmentUrl) payload.attachmentUrl = attachmentUrl;

    await onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Invoice Receivable" className="max-w-xl">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Invoice Split Notice</p>
            <p>Creating this invoice will lock direct payment and refund functionalities on this Sales Order. The remaining balance of <strong>{formatMoney(principalAmount)}</strong> will be transferred to a <strong>Receivable</strong> record.</p>
            <p className="mt-1">Future collections must be handled via the Receivable module.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>External Party (Customer / Bill To) <span className="text-red-500">*</span></Label>
            <SearchableSelect required value={externalPartyId} onChange={(e) => setExternalPartyId(e.target.value)}>
              <option value="">-- Select External Party --</option>
              {parties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </SearchableSelect>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invoice Date <span className="text-red-500">*</span></Label>
              <Input type="date" required value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Attachment URL (Optional)</Label>
            <Input type="url" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Terms or other notes..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !externalPartyId || !invoiceDate}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Receipt className="w-4 h-4 mr-2" />}
            Generate Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
}
