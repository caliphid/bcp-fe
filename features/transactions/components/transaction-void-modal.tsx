import { Modal } from "../../../components/ui/modal";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";

interface TransactionVoidModalProps {
  isOpen: boolean;
  onClose: () => void;
  voidReason: string;
  setVoidReason: (reason: string) => void;
  onConfirm: () => void;
}

export function TransactionVoidModal({
  isOpen,
  onClose,
  voidReason,
  setVoidReason,
  onConfirm,
}: TransactionVoidModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Void Transaction">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Are you sure you want to void this transaction? This action cannot
          be undone and will revert the account balance changes.
        </p>
        <div className="space-y-2">
          <Label htmlFor="voidReason">
            Reason for voiding <span className="text-red-500">*</span>
          </Label>
          <Input
            id="voidReason"
            value={voidReason}
            onChange={(e) => setVoidReason(e.target.value)}
            placeholder="e.g. Input error"
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={!voidReason.trim()}
          >
            Void Transaction
          </Button>
        </div>
      </div>
    </Modal>
  );
}
