import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { AdCampaignItem, AdCampaignStatus } from "../../../types/ads";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface CampaignStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: AdCampaignItem | null;
  onSubmit: (status: AdCampaignStatus) => Promise<void>;
}

export function CampaignStatusModal({
  isOpen,
  onClose,
  campaign,
  onSubmit,
}: CampaignStatusModalProps) {
  const [status, setStatus] = useState<AdCampaignStatus | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && campaign) {
      setStatus(campaign.status);
      setError(null);
    }
  }, [isOpen, campaign]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status || status === campaign?.status) {
      onClose();
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await onSubmit(status as AdCampaignStatus);
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (!campaign) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ubah Status Campaign"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg mb-4">
          <p className="text-sm font-medium text-slate-900">{campaign.name}</p>
          <p className="text-xs text-slate-500 mt-1">Status saat ini: <strong className="text-slate-700">{campaign.status}</strong></p>
        </div>

        <div className="space-y-2">
          <Label>Pilih Status Baru <span className="text-rose-500">*</span></Label>
          <SearchableSelect
            required
            className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            value={status}
            onChange={(e) => setStatus(e.target.value as AdCampaignStatus)}
          >
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="INACTIVE">INACTIVE</option>
          </SearchableSelect>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" disabled={loading || status === campaign.status}>
            {loading ? "Menyimpan..." : "Update Status"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
