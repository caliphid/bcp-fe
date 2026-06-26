"use client";

import { useCustomer } from "../../../../../features/customers/hooks/use-customers";
import { CustomerDetailView } from "../../../../../features/customers/components/customer-detail-view";
import { CustomerMergeModal } from "../../../../../features/customers/components/customer-merge-modal";
import { PageHeader } from "../../../../../components/ui/page-header";
import { useAuthStore } from "../../../../../store/auth-store";
import { Users, GitMerge } from "lucide-react";
import { useState, use } from "react";
import { Button } from "../../../../../components/ui/button";
import { CustomerStatus } from "../../../../../types/customer";

import Link from "next/link";
import { Edit2 } from "lucide-react";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, isLoading, error, mutate } = useCustomer(resolvedParams.id);
  const { user } = useAuthStore();
  const isOwner = user?.role === "OWNER";
  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  if (isLoading) {
    return <div className="h-96 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>;
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-red-600">
        Gagal memuat detail customer.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.fullName}
        description={`Customer Code: ${data.customerCode}`}
        icon={<Users className="w-6 h-6" />}
        backHref="/dashboard/customers"
      >
        <div className="flex items-center gap-2">
          {isOwner && data.status !== CustomerStatus.MERGED ? (
            <Button 
              variant="outline" 
              className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
              onClick={() => setIsMergeModalOpen(true)}
            >
              <GitMerge className="w-4 h-4" /> Merge Customer
            </Button>
          ) : null}
          {canEdit && data.status !== CustomerStatus.MERGED && (
            <Link href={`/dashboard/customers/${data.id}/edit`}>
              <Button variant="default" className="gap-2">
                <Edit2 className="w-4 h-4" /> Edit Customer
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      <CustomerDetailView customer={data} />

      {isMergeModalOpen && isOwner && (
        <CustomerMergeModal
          isOpen={isMergeModalOpen}
          onClose={() => setIsMergeModalOpen(false)}
          sourceCustomer={data}
          onSuccess={() => {
            setIsMergeModalOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
}
