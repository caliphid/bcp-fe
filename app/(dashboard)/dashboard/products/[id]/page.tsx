"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "../../../../../store/auth-store";
import { useProduct, useProductVariants, useRevalidateProductData } from "../../../../../features/products/hooks/use-products";
import { productApi } from "../../../../../features/products/api";
import { ProductVariant } from "../../../../../types/product";
import { Button } from "../../../../../components/ui/button";
import { PageHeader } from "../../../../../components/ui/page-header";
import { StatusBadge } from "../../../../../components/ui/status-badge";
import { formatMoney } from "../../../../../lib/utils";
import { extractErrorMessage } from "../../../../../lib/error";
import { PlusCircle, Pencil, Box, Trash2 } from "lucide-react";
import { VariantFormModal } from "../../../../../features/products/components/variant-form-modal";
import { ConfirmDialog } from "../../../../../components/ui/confirm-dialog";
import toast from "react-hot-toast";
import { useTranslation } from "@/hooks/use-translation";

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const { data: product, isLoading: loadingProduct } = useProduct(id as string);
  const { data: variantsData, isLoading: loadingVariants, mutate: mutateVariants } = useProductVariants({ productId: id, limit: 100 });

  const variants = variantsData || [];
  const revalidateProductData = useRevalidateProductData();

  const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    confirmText?: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: async () => {},
  });
  const [isConfirming, setIsConfirming] = useState(false);

  const handleToggleStatus = (item: ProductVariant) => {
    const isActivating = item.status === "INACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? "Activate Variant" : "Deactivate Variant",
      message: isActivating
        ? `Are you sure you want to activate variant ${item.sku}?`
        : `Are you sure you want to deactivate variant ${item.sku}?`,
      action: async () => {
        try {
          if (isActivating) {
            await productApi.activateProductVariant(item.id);
          } else {
            await productApi.deactivateProductVariant(item.id);
          }
          mutateVariants();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          toast.success(`Variant ${isActivating ? 'activated' : 'deactivated'}`);
        } catch (err) {
          toast.error(extractErrorMessage(err));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDelete = () => {
    if (!product) return;
    setConfirmDialog({
      isOpen: true,
      title: t("pages.products.deleteProduct"),
      message: t("pages.products.confirmDelete").replace("{name}", product.name),
      isDestructive: true,
      confirmText: t("pages.products.delete"),
      action: async () => {
        setIsConfirming(true);
        try {
          await productApi.deleteProduct(product.id);
          toast.success(t("pages.products.deleteSuccess"));
          revalidateProductData();
          router.replace("/dashboard/products");
        } catch (err) {
          toast.error(extractErrorMessage(err));
          setIsConfirming(false);
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (loadingProduct) {
    return <div className="p-10 text-center animate-pulse">Loading product...</div>;
  }

  if (!product) {
    return <div className="p-10 text-center text-red-500">Product not found</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start">
        <PageHeader 
          title="Product Detail" 
          description={product.name}
        />
        {canMutate && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2 shadow-sm bg-white"
              onClick={() => router.push(`/dashboard/products/${id}/edit`)}
            >
              <Pencil className="w-4 h-4" /> Edit Product
            </Button>
            <Button
              variant="destructive"
              className="gap-2 shadow-sm"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" /> {t("pages.products.delete")}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Product Code</p>
            <p className="font-semibold text-slate-900">{product.productCode}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Type</p>
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
              {product.type.replace('_', ' ')}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Category</p>
            <p className="font-semibold text-slate-900">{product.category?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Business Unit</p>
            <p className="font-semibold text-slate-900">{product.businessUnit?.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">SKU (Parent)</p>
            <p className="font-semibold text-slate-900">{product.sku || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Default Price</p>
            <p className="font-bold text-slate-900">{formatMoney(product.defaultPrice)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Status</p>
            <StatusBadge status={product.status} canToggle={false} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Box className="w-5 h-5 text-slate-500" /> Product Variants
          </div>
          {canMutate && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditingVariant(null);
                setIsVariantFormOpen(true);
              }}
            >
              <PlusCircle className="w-4 h-4" /> Add Variant
            </Button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Color</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4 text-right">Unit Cost</th>
                <th className="px-6 py-4 text-right">Selling Price</th>
                <th className="px-6 py-4">Status</th>
                {canMutate && <th className="px-6 py-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingVariants ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading variants...</td>
                </tr>
              ) : variants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No variants found.</td>
                </tr>
              ) : (
                variants.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{v.sku}</td>
                    <td className="px-6 py-4">{v.color}</td>
                    <td className="px-6 py-4">{v.size}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">{formatMoney(v.unitCost)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">{formatMoney(v.sellingPrice)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={v.status}
                        canToggle={canMutate}
                        onToggle={() => handleToggleStatus(v)}
                      />
                    </td>
                    {canMutate && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setEditingVariant(v);
                            setIsVariantFormOpen(true);
                          }}
                          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <VariantFormModal
        isOpen={isVariantFormOpen}
        onClose={() => setIsVariantFormOpen(false)}
        productId={product.id}
        initialData={editingVariant}
        onSuccess={() => {
          setIsVariantFormOpen(false);
          mutateVariants();
        }}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
        confirmText={confirmDialog.confirmText}
        isLoading={isConfirming}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
