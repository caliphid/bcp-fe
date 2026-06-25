import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { customerReturnsApi } from "../api";
import { ReturnResolutionType } from "../types";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../../lib/error";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  returnId: string;
  onSuccess: () => void;
}

export function ApproveReturnModal({ isOpen, onClose, returnId, onSuccess }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolutionType, setResolutionType] = useState<ReturnResolutionType>(ReturnResolutionType.REFUND);
  const [approvedRefundAmount, setApprovedRefundAmount] = useState<number | "">("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await customerReturnsApi.approveReturn(returnId, {
        resolutionType,
        approvedRefundAmount: approvedRefundAmount !== "" ? Number(approvedRefundAmount) : undefined,
        notes: notes || undefined,
      });
      toast.success("Return approved successfully");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error) || "Failed to approve return");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Approve Customer Return">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-1 block">Resolution Type</Label>
          <select 
            className="w-full h-10 rounded-lg border border-slate-200 px-3"
            value={resolutionType}
            onChange={(e) => setResolutionType(e.target.value as ReturnResolutionType)}
            required
          >
            {Object.values(ReturnResolutionType).map(t => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-1 block">Approved Refund Amount</Label>
          <Input 
            type="number" 
            min="0"
            value={approvedRefundAmount}
            onChange={(e) => setApprovedRefundAmount(e.target.value ? Number(e.target.value) : "")}
            placeholder="e.g. 150000"
          />
          <p className="text-xs text-slate-500 mt-1">Leave blank if no refund or handled automatically later.</p>
        </div>

        <div>
          <Label className="mb-1 block">Notes (Optional)</Label>
          <Input 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Approval notes..."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Approving..." : "Approve"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
