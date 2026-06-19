"use client";
import { extractErrorMessage } from "@/lib/error";

import { toast } from "react-hot-toast";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "../../../../../store/auth-store";
import { useReceivableDetail } from "../../../../../features/external-money/hooks/use-receivable-detail";
import { useReceivableCollections } from "../../../../../features/external-money/hooks/use-receivable-collections";
import { useReceivableWriteOffs } from "../../../../../features/external-money/hooks/use-receivable-write-offs";
import { externalMoneyApi } from "../../../../../features/external-money/api";
import { ReceivableDetailView } from "../../../../../features/external-money/components/receivables/receivable-detail-view";
import { CollectionFormModal } from "../../../../../features/external-money/components/collections/collection-form-modal";
import { WriteOffFormModal } from "../../../../../features/external-money/components/write-offs/write-off-form-modal";
import {
  CreateCollectionPayload,
  CreateWriteOffPayload,
} from "../../../../../types/receivable";

export default function ReceivableDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { user } = useAuthStore();
  const isOwner = user?.role === "OWNER";

  const {
    data: receivable,
    loading: receivableLoading,
    refetch: refetchReceivable,
  } = useReceivableDetail(id);
  const {
    data: collections,
    loading: collectionsLoading,
    refetch: refetchCollections,
  } = useReceivableCollections(id);
  const {
    data: writeOffs,
    loading: writeOffsLoading,
    refetch: refetchWriteOffs,
  } = useReceivableWriteOffs(id);

  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [isWriteOffModalOpen, setIsWriteOffModalOpen] = useState(false);

  const loading = receivableLoading || collectionsLoading || writeOffsLoading;

  const refreshAll = () => {
    refetchReceivable();
    refetchCollections();
    refetchWriteOffs();
  };

  const handleAddCollection = async (payload: CreateCollectionPayload) => {
    try {
      await externalMoneyApi.createCollection(id, payload);
      toast.success("Pengumpulan berhasil dicatat");
      refreshAll();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal mencatat pengumpulan"));
      throw err;
    }
  };

  const handleAddWriteOff = async (payload: CreateWriteOffPayload) => {
    try {
      await externalMoneyApi.createWriteOff(id, payload);
      toast.success("Penghapusan berhasil dicatat");
      refreshAll();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal mencatat penghapusan"));
      throw err;
    }
  };

  const handleVoidCollection = async (collectionId: string) => {
    if (
      !confirm(
        "Are you sure you want to void this collection? This cannot be undone.",
      )
    )
      return;
    try {
      await externalMoneyApi.voidCollection(collectionId, {
        voidReason: "Voided by user",
      });
      toast.success("Pengumpulan dibatalkan");
      refreshAll();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal membatalkan pengumpulan"));
    }
  };

  const handleVoidWriteOff = async (writeOffId: string) => {
    if (
      !confirm(
        "Are you sure you want to void this write-off? This cannot be undone.",
      )
    )
      return;
    try {
      await externalMoneyApi.voidWriteOff(writeOffId, {
        voidReason: "Voided by user",
      });
      toast.success("Penghapusan dibatalkan");
      refreshAll();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Gagal membatalkan penghapusan"));
    }
  };

  if (loading || !receivable) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  const remainingBalanceNum = parseFloat(receivable.remainingBalance);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title={`Piutang/Pinjaman: ${receivable.receivableCode}`}
        description={`Detail view for ${receivable.title}`}
        backHref="/dashboard/receivables"
      />

      <ReceivableDetailView
        receivable={receivable}
        collections={collections}
        writeOffs={writeOffs}
        onAddCollection={() => setIsCollectionModalOpen(true)}
        onAddWriteOff={() => setIsWriteOffModalOpen(true)}
        onVoidCollection={handleVoidCollection}
        onVoidWriteOff={handleVoidWriteOff}
      />

      {isCollectionModalOpen && (
        <CollectionFormModal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          onSubmit={handleAddCollection}
          maxAmount={remainingBalanceNum}
        />
      )}

      {isWriteOffModalOpen && isOwner && (
        <WriteOffFormModal
          isOpen={isWriteOffModalOpen}
          onClose={() => setIsWriteOffModalOpen(false)}
          onSubmit={handleAddWriteOff}
          maxAmount={remainingBalanceNum}
        />
      )}
    </div>
  );
}
