"use client";
import { useState } from "react";
import Link from "next/link";
import { productApi } from "../../../../features/products/api";
import { Product } from "../../../../types/product";
import toast from "react-hot-toast";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { ProductForm } from "../../../../components/forms/product-form";
import { ConfirmDialog } from "../../../../components/ui/confirm-dialog";
import { extractErrorMessage } from "../../../../lib/error";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useProducts } from "../../../../features/products/hooks/use-products";
import { useBusinessUnits } from "../../../../features/business-units/hooks/use-business-units";
import { useProductStore } from "../../../../features/products/store/product-store";
import { ProductFilterBar } from "../../../../features/products/components/product-filter-bar";
import { ProductTable } from "../../../../features/products/components/product-table";

export default function ProductsPage() {
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const { filters } = useProductStore();

  const { data: businessUnitsData } = useBusinessUnits();
  const businessUnits = businessUnitsData || [];

  const { data: productsData, meta, isLoading: loading, error, mutate: fetchData } = useProducts({
    page: filters.page,
    limit: 10,
    search: filters.search || undefined,
    status: filters.status || undefined,
    type: filters.type || undefined,
    businessUnitId: filters.businessUnitId || undefined,
  });

  const data = productsData || [];
  const globalError = error ? extractErrorMessage(error) : null;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: async () => {},
  });

  const handleToggleStatus = (item: Product) => {
    const isActivating = item.status === "INACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? "Activate Product" : "Deactivate Product",
      message: isActivating
        ? `Are you sure you want to activate ${item.name}?`
        : `Are you sure you want to deactivate ${item.name}?`,
      action: async () => {
        try {
          if (isActivating) {
            await productApi.activateProduct(item.id);
          } else {
            await productApi.deactivateProduct(item.id);
          }
          fetchData();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error(extractErrorMessage(err));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Products</h2>
          <p className="mt-1 text-sm text-slate-500">Manage master data for products and services.</p>
        </div>
        {canMutate && (
          <Link href="/dashboard/products/create">
            <Button className="w-full sm:w-auto shadow-primary-500/30 shadow-md">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Product
            </Button>
          </Link>
        )}
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <ProductFilterBar businessUnits={businessUnits} />

      {/* Table */}
      <ProductTable
        data={data}
        meta={meta}
        loading={loading}
        canMutate={canMutate}
        onEdit={(item) => {
          setEditingItem(item);
          setIsFormOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
      />

      {/* Form Modal (For Edit Only) */}
      <Modal
        isOpen={isFormOpen && editingItem !== null}
        onClose={() => setIsFormOpen(false)}
        title="Edit Product"
        className="max-w-2xl"
      >
        <ProductForm
          initialData={editingItem || undefined}
          businessUnits={businessUnits}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchData();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
