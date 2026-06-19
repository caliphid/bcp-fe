"use client";
import { extractErrorMessage } from "@/lib/error";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ExternalPartiesTable } from "../../../../features/external-money/components/external-parties/external-parties-table";
import { ExternalPartyFormModal } from "../../../../features/external-money/components/external-parties/external-party-form-modal";
import { useExternalParties } from "../../../../features/external-money/hooks/use-external-parties";
import { externalMoneyApi } from "../../../../features/external-money/api";
import { useExternalPartyStore } from "../../../../features/external-money/store/external-party-store";
import {
  ExternalParty,
  CreateExternalPartyPayload,
} from "../../../../types/receivable";

export default function ExternalPartiesPage() {
  const { data, meta, loading, refetch } = useExternalParties();
  const { setFilter } = useExternalPartyStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<ExternalParty | null>(
    null,
  );

  const handlePageChange = (page: number) => {
    setFilter("page", page);
  };

  const handleAdd = () => {
    setSelectedParty(null);
    setIsModalOpen(true);
  };

  const handleEdit = (party: ExternalParty) => {
    setSelectedParty(party);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: CreateExternalPartyPayload) => {
    try {
      if (selectedParty) {
        await externalMoneyApi.updateExternalParty(selectedParty.id, payload);
        toast.error("External party updated successfully");
      } else {
        await externalMoneyApi.createExternalParty(payload);
        toast.error("External party created successfully");
      }
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to save external party"));
      throw err;
    }
  };

  const handleToggleStatus = async (party: ExternalParty) => {
    try {
      if (party.status === "ACTIVE") {
        await externalMoneyApi.deactivateExternalParty(party.id);
        toast.error("Party deactivated");
      } else {
        await externalMoneyApi.activateExternalParty(party.id);
        toast.error("Party activated");
      }
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to toggle status"));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Pihak Eksternal"
        description="Kelola data pelanggan, vendor, mitra, dll untuk uang eksternal"
      />

      <ExternalPartiesTable
        data={data}
        meta={meta}
        loading={loading}
        onPageChange={handlePageChange}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
      />

      <ExternalPartyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        party={selectedParty}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
