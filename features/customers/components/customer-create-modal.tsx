import { Modal } from "../../../components/ui/modal";
import { CustomerForm } from "./customer-form";
import { Customer } from "../../../types/customer";

interface CustomerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}

export function CustomerCreateModal({ isOpen, onClose, onSuccess }: CustomerCreateModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Customer Baru"
      className="max-w-4xl"
    >
      <div className="max-h-[80vh] overflow-y-auto pr-2">
        <CustomerForm onSuccess={onSuccess} onCancel={onClose} />
      </div>
    </Modal>
  );
}
