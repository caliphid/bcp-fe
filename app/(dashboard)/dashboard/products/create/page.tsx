"use client";

import { useBusinessUnits } from "../../../../../features/business-units/hooks/use-business-units";
import { useProductCategories } from "../../../../../features/product-categories/hooks/use-product-categories";
import { ProductForm } from "../../../../../features/products/components/product-form";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "../../../../../components/ui/page-header";

export default function CreateProductPage() {
  const { data: businessUnits, loading: loadingBu } = useBusinessUnits();
  const { data: productCategories, loading: loadingCat } = useProductCategories();

  if (loadingBu || loadingCat) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/products" 
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader 
          title="Create Product" 
          description="Tambahkan produk atau layanan baru ke dalam sistem"
        />
      </div>

      <ProductForm 
        businessUnits={businessUnits || []} 
        productCategories={productCategories || []}
      />
    </div>
  );
}
