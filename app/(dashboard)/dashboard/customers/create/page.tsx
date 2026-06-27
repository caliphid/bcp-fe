"use client";

import { CustomerForm } from "../../../../../features/customers/components/customer-form";
import { PageHeader } from "../../../../../components/ui/page-header";
import { useAuthStore } from "../../../../../store/auth-store";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateCustomerPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "OWNER" && user.role !== "ADMIN_FINANCE") {
      router.replace("/dashboard/customers");
    }
  }, [user, router]);

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN_FINANCE")) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Buat Customer Baru"
        description="Tambahkan data pelanggan baru ke dalam sistem."
        icon={<Users className="w-6 h-6" />}
        backHref="/dashboard/customers"
      />

      <CustomerForm />
    </div>
  );
}
