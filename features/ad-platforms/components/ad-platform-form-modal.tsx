import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { AdPlatformItem, CreateAdPlatformPayload } from "../../../types/ads";

interface AdPlatformFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdPlatformPayload) => Promise<void>;
  initialData?: AdPlatformItem | null;
}

export function AdPlatformFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: AdPlatformFormModalProps) {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState<Partial<CreateAdPlatformPayload>>({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (isOpen !== prevIsOpen || initialData !== prevInitialData) {
    setPrevIsOpen(isOpen);
    setPrevInitialData(initialData);
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          description: initialData.description || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
        });
      }
      setError(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: CreateAdPlatformPayload = {
        name: formData.name || "",
        description: formData.description || null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to save platform");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Ad Platform" : "Add New Ad Platform"}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label>Platform Name <span className="text-rose-500">*</span></Label>
          <Input
            required
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Meta Ads, TikTok Ads"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Platform description..."
            className="resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Platform"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
