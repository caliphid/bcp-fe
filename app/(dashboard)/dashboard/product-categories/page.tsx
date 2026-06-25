"use client";

import { useState } from "react";
import { productCategoriesApi } from "../../../../features/product-categories/api";
import { ProductCategory } from "../../../../types/product-category";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { ProductCategoryForm } from "../../../../features/product-categories/components/product-category-form";
import { extractErrorMessage } from "../../../../lib/error";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useProductCategories } from "../../../../features/product-categories/hooks/use-product-categories";
import { ProductCategoryFilterBar } from "../../../../features/product-categories/components/product-category-filter-bar";
import { ProductCategoryTable } from "../../../../features/product-categories/components/product-category-table";

export default function ProductCategoriesPage() {
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const {
    data,
    loading,
    globalError,
    fetchData,
  } = useProductCategories();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductCategory | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Product Categories</h2>
          <p className="mt-1 text-sm text-slate-500">Manage categories for your products.</p>
        </div>
        {canMutate && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Category
          </Button>
        )}
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      <ProductCategoryFilterBar />

      <ProductCategoryTable
        data={data}
        loading={loading}
        canMutate={canMutate}
        onEdit={(item) => {
          setEditingItem(item);
          setIsFormOpen(true);
        }}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? "Edit Product Category" : "Create Product Category"}
        className="max-w-xl"
      >
        <ProductCategoryForm
          initialData={editingItem || undefined}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchData();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
