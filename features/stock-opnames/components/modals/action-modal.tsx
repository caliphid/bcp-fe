import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actionLabel: string;
  actionVariant?: "default" | "destructive";
  onSubmit: (text: string) => Promise<void>;
  inputLabel: string;
  inputPlaceholder: string;
  isRequired?: boolean;
}

export function ActionModal({
  isOpen,
  onClose,
  title,
  description,
  actionLabel,
  actionVariant = "default",
  onSubmit,
  inputLabel,
  inputPlaceholder,
  isRequired = false,
}: ActionModalProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isRequired && !text.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(text);
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{description}</p>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            {inputLabel} {isRequired && <span className="text-rose-500">*</span>}
          </label>
          <Textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={inputPlaceholder}
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant={actionVariant}
            onClick={handleSubmit}
            disabled={isSubmitting || (isRequired && !text.trim())}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {actionLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
