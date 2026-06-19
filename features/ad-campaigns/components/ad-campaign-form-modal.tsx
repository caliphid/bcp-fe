import { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/modal";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { AdCampaignItem, CreateAdCampaignPayload } from "../../../types/ads";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { useAdPlatforms } from "../../ad-platforms/hooks/use-ad-platforms";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface AdCampaignFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CreateAdCampaignPayload>) => Promise<void>;
  initialData?: AdCampaignItem | null;
}

export function AdCampaignFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: AdCampaignFormModalProps) {
  const isEdit = !!initialData;
  const { data: businessUnits } = useBusinessUnits();
  const { data: platforms } = useAdPlatforms({ status: "ACTIVE" });

  const [formData, setFormData] = useState<Partial<CreateAdCampaignPayload>>({
    businessUnitId: "",
    platformId: "",
    name: "",
    externalCampaignId: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [budgetStr, setBudgetStr] = useState("");
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
          businessUnitId: initialData.businessUnit.id,
          platformId: initialData.platform.id,
          name: initialData.name,
          externalCampaignId: initialData.externalCampaignId || "",
          startDate: initialData.startDate.split("T")[0],
          endDate: initialData.endDate ? initialData.endDate.split("T")[0] : "",
          notes: initialData.notes || "",
        });
        setBudgetStr(
          initialData.budget && parseFloat(initialData.budget) > 0
            ? parseFloat(initialData.budget).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            : ""
        );
      } else {
        setFormData({
          businessUnitId: "",
          platformId: "",
          name: "",
          externalCampaignId: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          notes: "",
        });
        setBudgetStr("");
      }
      setError(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!formData.businessUnitId || !formData.platformId || !formData.name || !formData.startDate) {
      setError("Mohon lengkapi field yang wajib diisi");
      setLoading(false);
      return;
    }

    if (formData.endDate && formData.endDate < formData.startDate) {
      setError("End Date tidak boleh sebelum Start Date");
      setLoading(false);
      return;
    }

    try {
      const payload: Partial<CreateAdCampaignPayload> = {
        ...formData,
        externalCampaignId: formData.externalCampaignId || null,
        endDate: formData.endDate || null,
        notes: formData.notes || null,
        budget: budgetStr ? parseFloat(budgetStr.replace(/\./g, "")) : null,
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string | string[] } } };
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Campaign" : "Add New Campaign"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-rose-50 text-rose-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Business Unit <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              required
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.businessUnitId || ""}
              onChange={(e) => setFormData({ ...formData, businessUnitId: e.target.value })}
            >
              <option value="" disabled>Pilih Business Unit</option>
              {businessUnits?.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </SearchableSelect>
          </div>

          <div className="space-y-2">
            <Label>Ad Platform <span className="text-rose-500">*</span></Label>
            <SearchableSelect
              required
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.platformId || ""}
              onChange={(e) => setFormData({ ...formData, platformId: e.target.value })}
            >
              <option value="" disabled>Pilih Platform</option>
              {platforms?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </SearchableSelect>
          </div>

          <div className="space-y-2">
            <Label>Campaign Name <span className="text-rose-500">*</span></Label>
            <Input
              required
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Prospecting June T-Shirt"
            />
          </div>

          <div className="space-y-2">
            <Label>External Campaign ID (Optional)</Label>
            <Input
              value={formData.externalCampaignId || ""}
              onChange={(e) => setFormData({ ...formData, externalCampaignId: e.target.value })}
              placeholder="e.g. meta-12345"
            />
          </div>

          <div className="space-y-2">
            <Label>Start Date <span className="text-rose-500">*</span></Label>
            <Input
              required
              type="date"
              value={formData.startDate || ""}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>End Date (Optional)</Label>
            <Input
              type="date"
              value={formData.endDate || ""}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Total Budget (IDR) - Optional</Label>
            <Input
              type="text"
              inputMode="numeric"
              value={budgetStr}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setBudgetStr(val.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
              }}
              placeholder="e.g. 10.000.000 (Kosongkan jika unlimited)"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Notes / Keterangan</Label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tambahan keterangan campaign..."
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Campaign"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
