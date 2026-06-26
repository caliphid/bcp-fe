import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { useTranslation } from "../../../hooks/use-translation";
import { marketplaceSettlementApi } from "../api";
import { extractErrorMessage } from "../../../lib/error";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ManualMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lineId: string | null;
  onSuccess: () => void;
}

export function ManualMatchModal({ isOpen, onClose, lineId, onSuccess }: ManualMatchModalProps) {
  const [salesOrderId, setSalesOrderId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineId) return;

    if (!salesOrderId.trim()) {
      setError("Sales Order ID is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await marketplaceSettlementApi.manualMatchLine(lineId, {
        salesOrderId: salesOrderId.trim(),
        notes: notes.trim() || undefined
      });
      toast.success("Line manually matched successfully");
      onSuccess();
      onClose();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("marketplace.settlement.manualMatch.title")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="salesOrderId">Sales Order ID <span className="text-red-500">*</span></Label>
          <Input 
            id="salesOrderId" 
            value={salesOrderId} 
            onChange={(e) => setSalesOrderId(e.target.value)} 
            placeholder="e.g. uuid-sales-order"
          />
          <p className="text-xs text-slate-500">Provide the exact internal ID of the Sales Order to match.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="manualNotes">Notes (Optional)</Label>
          <Textarea 
            id="manualNotes" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder={t("marketplace.settlement.manualMatch.notesHint")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm Match
          </Button>
        </div>
      </form>
    </Modal>
  );
}
