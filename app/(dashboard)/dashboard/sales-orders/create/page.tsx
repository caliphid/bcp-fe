"use client";

import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { SalesOrderForm } from "@/features/sales-orders/components/sales-order-form";
import { salesOrderApi } from "@/features/sales-orders/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreateSalesOrderPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  if (!canCreate) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
        <p className="text-slate-500">Anda tidak memiliki akses ke halaman ini.</p>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const res = await salesOrderApi.createSalesOrder(data);
      toast.success("Draft Sales Order berhasil dibuat");
      router.push(`/dashboard/sales-orders/${res.data.id}/edit`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal membuat Sales Order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Buat Draft Sales Order"
        description="Masukkan informasi utama pemesanan pelanggan. Item pesanan dapat ditambahkan di langkah berikutnya."
      />

      <SalesOrderForm 
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
      />
    </div>
  );
}
