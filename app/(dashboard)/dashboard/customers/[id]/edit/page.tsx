"use client";

import { useCustomer } from "@/features/customers/hooks/use-customers";
import { CustomerForm } from "../../../../../../features/customers/components/customer-form";
import { CustomerAddressList } from "../../../../../../features/customers/components/customer-address-list";
import { PageHeader } from "../../../../../../components/ui/page-header";
import { useAuthStore } from "../../../../../../store/auth-store";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, use } from "react";
import { CustomerStatus } from "../../../../../../types/customer";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const { id } = use(params);
  const { data, isLoading: loading, error, mutate } = useCustomer(id);

  useEffect(() => {
    if (user && user.role !== "OWNER" && user.role !== "ADMIN_FINANCE") {
      router.replace("/dashboard/customers");
    }
  }, [user, router]);

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN_FINANCE")) {
    return null;
  }

  if (loading) {
    return <div className="h-96 bg-slate-50 animate-pulse rounded-2xl border border-slate-100 max-w-4xl"></div>;
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-red-600 max-w-4xl">
        Gagal memuat data customer.
      </div>
    );
  }

  if (data.status === CustomerStatus.MERGED) {
    return (
      <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-rose-600 max-w-4xl">
        Customer ini telah di-merge dan tidak bisa diedit.
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title={`Edit Customer: ${data.fullName}`}
        description="Perbarui informasi profil dan kontak pelanggan."
        icon={<Users className="w-6 h-6" />}
        backHref={`/dashboard/customers/${data.id}`}
      />

      <CustomerForm initialData={data} />
      
      <CustomerAddressList customer={data} onUpdated={() => mutate()} />
    </div>
  );
}
