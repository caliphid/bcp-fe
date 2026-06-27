"use client";

import { useCustomers } from "../../../../features/customers/hooks/use-customers";
import { useCustomersStore } from "../../../../features/customers/store/customers-store";
import { CustomersTable } from "../../../../features/customers/components/customers-table";
import { CustomersFilterBar } from "../../../../features/customers/components/customers-filter-bar";
import { PageHeader } from "../../../../components/ui/page-header";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";
import { useAuthStore } from "../../../../store/auth-store";
import { Plus, Users } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { CustomerCreateModal } from "../../../../features/customers/components/customer-create-modal";
import { useState } from "react";

export default function CustomersPage() {
  const { filters, setFilter } = useCustomersStore();
  const { data, meta, isLoading, mutate } = useCustomers(filters);
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const canCreate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const canReviewDuplicates = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE"; // Admin can review, but merge only owner in some cases. Better let admin see list.

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('sidebar.items.customers')}
        description="Kelola data pelanggan, informasi kontak, dan alamat pengiriman."
        icon={<Users className="w-6 h-6" />}
      >
        <div className="flex gap-2">
          {canReviewDuplicates && (
            <Link href="/dashboard/customers/duplicates">
              <Button variant="outline">Review Duplikat</Button>
            </Link>
          )}
          {canCreate && (
            <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              {t('common.actions.create')}
            </Button>
          )}
        </div>
      </PageHeader>

      <CustomersFilterBar />

      <CustomersTable
        data={data}
        meta={meta}
        loading={isLoading}
        onPageChange={(page) => setFilter("page", page)}
      />

      {isCreateModalOpen && (
        <CustomerCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
}
