import React, { useState, useEffect } from "react";
import { Modal } from "../../../../components/ui/modal";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { ExternalParty, CreateExternalPartyPayload } from "@/types/receivable";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface ExternalPartyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  party: ExternalParty | null;
  onSubmit: (data: CreateExternalPartyPayload) => Promise<void>;
}

export function ExternalPartyFormModal({
  isOpen,
  onClose,
  party,
  onSubmit,
}: ExternalPartyFormModalProps) {
  const [formData, setFormData] = useState<CreateExternalPartyPayload>({
    name: "",
    type: "CUSTOMER",
    phone: "",
    email: "",
    address: "",
    identificationNumber: "",
    companyName: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (party && isOpen) {
      setFormData({
        name: party.name,
        type: party.type,
        phone: party.phone || "",
        email: party.email || "",
        address: party.address || "",
        identificationNumber: party.identificationNumber || "",
        companyName: party.companyName || "",
        notes: party.notes || "",
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        type: "CUSTOMER",
        phone: "",
        email: "",
        address: "",
        identificationNumber: "",
        companyName: "",
        notes: "",
      });
    }
  }, [party, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={party ? "Edit Pihak Eksternal" : "Add External Party"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. PT BCP or John Doe"
          />
        </div>

        <div>
          <Label htmlFor="type">Type *</Label>
          <SearchableSelect
            id="type"
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="VENDOR">Vendor</option>
            <option value="PARTNER">Partner</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="COMPANY">Company</option>
            <option value="OTHER">Other</option>
          </SearchableSelect>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">No. Telepon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Nama Perusahaan</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="identificationNumber">ID Number (KTP/NPWP)</Label>
            <Input
              id="identificationNumber"
              value={formData.identificationNumber}
              onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Alamat</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="notes">Catatan</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Save Party"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
