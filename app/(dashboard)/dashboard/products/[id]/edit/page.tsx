"use client";

import { useBusinessUnits } from "../../../../../../features/business-units/hooks/use-business-units";
import { useProductCategories } from "../../../../../../features/product-categories/hooks/use-product-categories";
import { useProduct, useProductVariants } from "../../../../../../features/products/hooks/use-products";
import { ProductForm } from "../../../../../../features/products/components/product-form";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "../../../../../../components/ui/page-header";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const { id } = useParams();
  const { data: businessUnits, loading: loadingBu } = useBusinessUnits();
  const { data: productCategories, loading: loadingCat } = useProductCategories();
  
  const { data: product, isLoading: loadingProduct } = useProduct(id as string);
  const { data: variants, isLoading: loadingVariants } = useProductVariants({ productId: id, limit: 100 });

  const loading = loadingBu || loadingCat || loadingProduct || loadingVariants;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!product) {
    return <div className="p-10 text-center text-red-500">Product not found</div>;
  }

  const initialData = {
    ...product,
    variants: variants || []
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href={`/dashboard/products/${id}`} 
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader 
          title="Edit Product" 
          description={`Ubah detail produk dan varian untuk ${product.name}`}
        />
      </div>

      <ProductForm 
        businessUnits={businessUnits || []} 
        productCategories={productCategories || []}
        initialData={initialData}
      />
    </div>
  );
}
