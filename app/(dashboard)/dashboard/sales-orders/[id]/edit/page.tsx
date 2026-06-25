"use client";

import { useAuthStore } from "@/store/auth-store";
import { PageHeader } from "@/components/ui/page-header";
import { SalesOrderForm } from "@/features/sales-orders/components/sales-order-form";
import { SalesOrderItemsEditor } from "@/features/sales-orders/components/sales-order-items-editor";
import { salesOrderApi } from "@/features/sales-orders/api";
import { useSalesOrder } from "@/features/sales-orders/hooks/use-sales-orders";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function EditSalesOrderPage() {
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const id = params.id as string;
  const { data: order, isLoading, mutate } = useSalesOrder(id);

  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const isReadOnly = !canEdit || (order && order.status !== 'DRAFT');

  if (isLoading) {
    return <div className="p-10 text-center animate-pulse">Loading order...</div>;
  }

  if (!order) {
    return <div className="p-10 text-center text-slate-500">Order tidak ditemukan</div>;
  }

  const handleUpdateHeader = async (data: any) => {
    setIsSubmitting(true);
    try {
      await salesOrderApi.updateSalesOrder(id, data);
      toast.success("Header pesanan berhasil diupdate");
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal mengupdate pesanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItem = async (data: any) => {
    setIsSubmitting(true);
    try {
      await salesOrderApi.addSalesOrderItem(id, data);
      toast.success("Item berhasil ditambahkan");
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal menambahkan item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateItem = async (itemId: string, data: any) => {
    setIsSubmitting(true);
    try {
      await salesOrderApi.updateSalesOrderItem(id, itemId, data);
      toast.success("Item berhasil diupdate");
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal mengupdate item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm("Hapus item pesanan ini?")) return;
    setIsSubmitting(true);
    try {
      await salesOrderApi.removeSalesOrderItem(id, itemId);
      toast.success("Item berhasil dihapus");
      mutate();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal menghapus item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={isReadOnly ? "Sales Order Detail" : "Edit Draft Sales Order"}
        description={`Sales Order #${order.orderCode} - Status: ${order.status}`}
      />

      <SalesOrderForm 
        initialData={order}
        onSubmit={handleUpdateHeader} 
        isLoading={isSubmitting} 
      />

      <SalesOrderItemsEditor
        order={order}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
        isReadOnly={!!isReadOnly}
        isLoading={isSubmitting}
      />
    </div>
  );
}
