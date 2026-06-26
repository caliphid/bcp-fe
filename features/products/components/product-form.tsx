"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Info, Loader2, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

import { productApi } from "../api";
import {
  ProductType,
  CreateProductRequest,
  CreateProductVariantRequest,
} from "../../../types/product";
import { BusinessUnit } from "../../../types/business-unit";
import { ProductCategory } from "../../../types/product-category";
import { extractErrorMessage } from "../../../lib/error";
import { formatCurrency } from "../../debts/utils/formatters";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Modal } from "../../../components/ui/modal";
import { useTranslation } from "../../../hooks/use-translation";

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  color: z.string().min(1, "Color is required"),
  size: z.string().min(1, "Size is required"),
  unitCost: z.string().min(1, "Unit Cost is required"),
  sellingPrice: z.string().optional(),
  minimumStock: z.number().min(0).optional(),
});

const schema = z
  .object({
    name: z.string().min(2, "Product Name is required"),
    productCode: z.string().optional(),
    articleName: z.string().optional(),
    type: z.nativeEnum(ProductType, { error: "Product Type is required" }),
    businessUnitId: z.string().optional(),
    categoryId: z.string().optional(),
    description: z.string().optional(),

    // Base fields if no variants
    sku: z.string().optional(),
    defaultHpp: z.string().optional(),
    defaultPrice: z.string().optional(),

    hasVariants: z.boolean().optional(),
    variants: z.array(variantSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.hasVariants && (!data.variants || data.variants.length === 0)) {
        return false;
      }
      return true;
    },
    {
      message:
        "At least one variant is required when 'Has Variants' is checked",
      path: ["variants"],
    },
  );

type FormData = z.infer<typeof schema>;

interface ProductFormProps {
  businessUnits: BusinessUnit[];
  productCategories: ProductCategory[];
  initialData?: any; // The product object including variants
}

export function ProductForm({
  businessUnits,
  productCategories,
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // Variant generator state
  const [colorsInput, setColorsInput] = useState("");
  const [sizesInput, setSizesInput] = useState("");

  // Bulk apply state
  const [bulkUnitCost, setBulkUnitCost] = useState("");
  const [bulkSellingPrice, setBulkSellingPrice] = useState("");
  const [bulkMinStock, setBulkMinStock] = useState<number | "">("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      productCode: initialData?.productCode || "",
      articleName: initialData?.articleName || "",
      type: initialData?.type || ProductType.PHYSICAL_PRODUCT,
      businessUnitId: initialData?.businessUnitId || "",
      categoryId: initialData?.categoryId || "",
      description: initialData?.description || "",
      sku: initialData?.sku || "",
      defaultHpp: initialData?.defaultHpp
        ? String(initialData.defaultHpp)
        : "0",
      defaultPrice: initialData?.defaultPrice
        ? String(initialData.defaultPrice)
        : "0",
      hasVariants: initialData
        ? initialData.variants && initialData.variants.length > 0
        : false,
      variants:
        initialData?.variants?.map((v: any) => ({
          id: v.id,
          sku: v.sku || "",
          color: v.color || "",
          size: v.size || "",
          unitCost: String(v.unitCost),
          sellingPrice: String(v.sellingPrice || v.unitCost || "0"),
          minimumStock: v.minimumStock || 0,
        })) || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  const hasVariants = watch("hasVariants");

  const formatInputMoney = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (!numeric) return "";
    return `Rp ${numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  const handleGenerateVariants = () => {
    const colors = colorsInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const sizes = sizesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (colors.length === 0 && sizes.length === 0) {
      toast.error("Please enter at least one color or size option.");
      return;
    }

    const finalColors = colors.length > 0 ? colors : ["-"];
    const finalSizes = sizes.length > 0 ? sizes : ["-"];

    const baseHpp = watch("defaultHpp") || "0";
    const basePrice = watch("defaultPrice") || "0";

    const baseCode = watch("productCode") || "";
    const existingVariants = getValues("variants") || [];
    const newVariants = [];

    for (const c of finalColors) {
      for (const s of finalSizes) {
        // Cek apakah varian dengan warna & ukuran ini sudah ada
        const existing = existingVariants.find((v) => v.color === c && v.size === s);

        if (existing) {
          // Pertahankan varian yang sudah ada (termasuk ID dan SKU lama)
          newVariants.push(existing);
        } else {
          // Generate SKU: CODE-COLOR-SIZE untuk varian baru
          const skuParts = [];
          if (baseCode) skuParts.push(baseCode);
          if (c !== "-") skuParts.push(c);
          if (s !== "-") skuParts.push(s);
          
          newVariants.push({
            sku: skuParts.join("-").toUpperCase(),
            color: c,
            size: s,
            unitCost: baseHpp,
            sellingPrice: basePrice,
            minimumStock: 0,
          });
        }
      }
    }

    setValue("variants", newVariants, { shouldValidate: true });
    toast.success(`Generated ${newVariants.length} variants!`);
  };

  const handleBulkApply = () => {
    const currentVariants = getValues("variants") || [];
    if (currentVariants.length === 0) {
      toast.error("No variants to apply to.");
      return;
    }

    let hasChanges = false;
    const updatedVariants = currentVariants.map((v) => {
      let changed = false;
      const newV = { ...v };

      if (bulkUnitCost) {
        newV.unitCost = bulkUnitCost;
        changed = true;
      }
      if (bulkSellingPrice) {
        newV.sellingPrice = bulkSellingPrice;
        changed = true;
      }
      if (bulkMinStock !== "") {
        newV.minimumStock = Number(bulkMinStock);
        changed = true;
      }

      if (changed) hasChanges = true;
      return newV;
    });

    if (hasChanges) {
      setValue("variants", updatedVariants, { shouldValidate: true });
      toast.success("Applied to all variants!");
    } else {
      toast.error("Please fill at least one bulk field to apply.");
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      // 1. Create/Update Base Product
      const productPayload: any = {
        name: data.name,
        type: data.type,
        productCode: data.productCode || undefined,
        businessUnitId: data.businessUnitId || undefined,
        categoryId: data.categoryId || undefined,
        articleName: data.articleName || undefined,
        description: data.description || undefined,
      };

      // Only set these base fields if it's NOT a variant product
      if (!data.hasVariants) {
        productPayload.sku = data.sku || undefined;
        productPayload.defaultHpp = data.defaultHpp
          ? String(parseFloat(data.defaultHpp.replace(/\D/g, "")))
          : "0";
        productPayload.defaultPrice = data.defaultPrice
          ? String(parseFloat(data.defaultPrice.replace(/\D/g, "")))
          : "0";
      }

      let productId = initialData?.id;

      if (initialData) {
        await productApi.updateProduct(productId, productPayload);
      } else {
        const createdProduct = await productApi.createProduct(productPayload);
        productId = createdProduct?.data?.id || (createdProduct as any)?.id;
        
        if (!productId) {
          console.error("Created Product Response:", createdProduct);
          throw new Error("Failed to create product. ID not returned.");
        }
      }

      // 2. Manage Variants
      if (data.hasVariants && data.variants && data.variants.length > 0) {
        const variantPromises = data.variants.map((v: any) => {
          const variantPayload: any = {
            sku: v.sku,
            color: v.color,
            size: v.size,
            unitCost: String(parseFloat(String(v.unitCost).replace(/\D/g, ""))),
            sellingPrice: v.sellingPrice
              ? String(parseFloat(String(v.sellingPrice).replace(/\D/g, "")))
              : undefined,
            minimumStock: v.minimumStock,
          };

          if (v.id) {
            // Update existing variant
            return productApi.updateProductVariant(v.id, variantPayload);
          } else {
            // Create new variant
            variantPayload.productId = productId;
            return productApi.createProductVariant(variantPayload);
          }
        });

        await Promise.all(variantPromises);
      }

      // 3. Deactivate variants removed from form
      if (initialData?.variants) {
        const currentVariantIds = new Set(
          data.variants?.filter((v: any) => v.id).map((v: any) => v.id) || [],
        );
        const originalVariants = initialData.variants;
        const variantsToRemove = originalVariants.filter(
          (v: any) => !currentVariantIds.has(v.id) && v.status === "ACTIVE",
        );

        if (variantsToRemove.length > 0) {
          await Promise.all(
            variantsToRemove.map((v: any) =>
              productApi.deactivateProductVariant(v.id),
            ),
          );
        }
      }

      toast.success(
        `Product successfully ${initialData ? "updated" : "created"}!`,
      );
      router.push(`/dashboard/products/${productId}`);
    } catch (err) {
      setError(extractErrorMessage(err));
      toast.error(
        `Failed to ${initialData ? "update" : "create"} product completely. Check logs.`,
      );
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* SECTION 1: Product Master Detail */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-800">
            {t("features.products.form.sectionProductDetail")}
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 h-8 px-3">
            <HelpCircle className="w-4 h-4 mr-1.5" /> Panduan Produk & Varian
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>
              {t("features.products.form.productName")} <span className="text-rose-500">*</span>
            </Label>
            <Input placeholder={t("features.products.form.productNamePlaceholder")} {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("features.products.form.articleName")}</Label>
            <Input
              placeholder={t("features.products.form.articleNamePlaceholder")}
              {...register("articleName")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("features.products.form.productCode")}</Label>
            <Input placeholder={t("features.products.form.productCodePlaceholder")} {...register("productCode")} />
            <p className="text-xs text-slate-500">
              {t("features.products.form.productCodeHint")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              {t("features.products.form.productType")} <span className="text-rose-500">*</span>
            </Label>
            <select
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              {...register("type")}
            >
              <option value="PHYSICAL_PRODUCT">{t("features.products.form.typePhysical")}</option>
              <option value="SERVICE">{t("features.products.form.typeService")}</option>
              <option value="RAW_MATERIAL">{t("features.products.form.typeRawMaterial")}</option>
              <option value="OTHER">{t("features.products.form.typeOther")}</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("features.products.form.businessUnit")}</Label>
            <Controller
              control={control}
              name="businessUnitId"
              render={({ field }) => (
                <SearchableSelect
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="">{t("features.products.form.noBusinessUnit")}</option>
                  {businessUnits.map((bu) => (
                    <option key={bu.id} value={bu.id}>
                      {bu.name}
                    </option>
                  ))}
                </SearchableSelect>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("features.products.form.category")}</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <SearchableSelect
                  className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="">{t("features.products.form.noCategory")}</option>
                  {productCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </SearchableSelect>
              )}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>{t("features.products.form.description")}</Label>
            <Textarea
              rows={3}
              placeholder={t("features.products.form.descriptionPlaceholder")}
              {...register("description")}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Variants Option */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {t("features.products.form.sectionPricingVariants")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t("features.products.form.sectionPricingVariantsHint")}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
            <input
              type="checkbox"
              id="hasVariants"
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
              {...register("hasVariants")}
            />
            <Label
              htmlFor="hasVariants"
              className="font-semibold cursor-pointer"
            >
              {t("features.products.form.hasVariants")}
            </Label>
          </div>
        </div>

        {/* NON-VARIANT FIELDS */}
        {!hasVariants && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="space-y-2">
              <Label>{t("features.products.form.baseSku")}</Label>
              <Input placeholder="SKU-XXX" {...register("sku")} />
            </div>
            <div className="space-y-2">
              <Label>{t("features.products.form.defaultHpp")}</Label>
              <Input
                placeholder="Rp 0"
                {...register("defaultHpp")}
                onChange={(e) => {
                  setValue("defaultHpp", formatInputMoney(e.target.value));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("features.products.form.defaultSellingPrice")}</Label>
              <Input
                placeholder="Rp 0"
                {...register("defaultPrice")}
                onChange={(e) => {
                  setValue("defaultPrice", formatInputMoney(e.target.value));
                }}
              />
            </div>
          </div>
        )}

        {/* VARIANT FIELDS */}
        {hasVariants && (
          <div className="space-y-6">
            {/* VARIANT GENERATOR */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3">
                {t("features.products.form.autoGenerateVariants")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-indigo-700">
                    {t("features.products.form.colorsLabel")}
                  </Label>
                  <Input
                    placeholder={t("features.products.form.colorsPlaceholder")}
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    className="bg-white border-indigo-200 focus-visible:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-indigo-700">
                    {t("features.products.form.sizesLabel")}
                  </Label>
                  <Input
                    placeholder={t("features.products.form.sizesPlaceholder")}
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    className="bg-white border-indigo-200 focus-visible:ring-indigo-500 text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={handleGenerateVariants}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {t("features.products.form.generateCombinations")}
                </Button>
              </div>
            </div>

            {/* BULK APPLY ACTION */}
            {fields.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">
                    {t("features.products.form.bulkApplyTitle")}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {t("features.products.form.bulkApplyHint")}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">{t("features.products.form.unitCost")}</Label>
                    <Input
                      placeholder="Rp 50.000"
                      value={bulkUnitCost}
                      onChange={(e) =>
                        setBulkUnitCost(formatInputMoney(e.target.value))
                      }
                      className="bg-white text-sm h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("features.products.form.sellingPrice")}</Label>
                    <Input
                      placeholder="Rp 100.000"
                      value={bulkSellingPrice}
                      onChange={(e) =>
                        setBulkSellingPrice(formatInputMoney(e.target.value))
                      }
                      className="bg-white text-sm h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t("features.products.form.minStock")}</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={bulkMinStock}
                      onChange={(e) =>
                        setBulkMinStock(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      className="bg-white text-sm h-9"
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBulkApply}
                      className="w-full h-9 border-slate-300"
                    >
                      {t("features.products.form.applyToAll")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {errors.variants?.root && (
              <p className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">
                {errors.variants.root.message}
              </p>
            )}

            {fields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-slate-50 border border-slate-200 rounded-xl relative hover:border-slate-300 transition-colors"
              >
                {/* Visual number indicator */}
                <div className="absolute -left-3 -top-3 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                  {index + 1}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">
                    SKU <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="e.g. TS-BLK-S"
                    {...register(`variants.${index}.sku` as const)}
                  />
                  {errors.variants?.[index]?.sku && (
                    <p className="text-[10px] text-red-500">
                      {errors.variants[index]?.sku?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">
                    Color <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="e.g. Black"
                    {...register(`variants.${index}.color` as const)}
                  />
                  {errors.variants?.[index]?.color && (
                    <p className="text-[10px] text-red-500">
                      {errors.variants[index]?.color?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">
                    Size <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="e.g. S, M, L"
                    {...register(`variants.${index}.size` as const)}
                  />
                  {errors.variants?.[index]?.size && (
                    <p className="text-[10px] text-red-500">
                      {errors.variants[index]?.size?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">
                    Unit Cost (HPP) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Rp 0"
                    {...register(`variants.${index}.unitCost` as const)}
                    onChange={(e) => {
                      setValue(
                        `variants.${index}.unitCost`,
                        formatInputMoney(e.target.value),
                      );
                    }}
                  />
                  {errors.variants?.[index]?.unitCost && (
                    <p className="text-[10px] text-red-500">
                      {errors.variants[index]?.unitCost?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">Selling Price</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="Rp 0"
                    {...register(`variants.${index}.sellingPrice` as const)}
                    onChange={(e) => {
                      setValue(
                        `variants.${index}.sellingPrice`,
                        formatInputMoney(e.target.value),
                      );
                    }}
                  />
                </div>

                <div className="md:col-span-1 space-y-2">
                  <Label className="text-xs">Min Stock</Label>
                  <Input
                    type="number"
                    min="0"
                    className="h-9 text-sm"
                    {...register(`variants.${index}.minimumStock` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="md:col-span-1 flex justify-end pb-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 h-9 px-3"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-2 py-6 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
              onClick={() =>
                append({
                  sku: "",
                  color: "",
                  size: "",
                  unitCost: "0",
                  sellingPrice: "0",
                  minimumStock: 0,
                })
              }
            >
              <Plus className="h-5 w-5 mr-2" /> {t("features.products.form.addVariant")}
            </Button>
          </div>
        )}
        <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[140px] shadow-primary-500/30 shadow-md"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : initialData ? (
              "Save Changes"
            ) : (
              "Create Product"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowTutorial(true)}
            className="text-slate-400 hover:text-indigo-600"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </form>
    
    <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Membuat Produk & Varian" className="max-w-3xl">
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
        <p className="mb-2">Produk di dalam sistem ini bisa berupa produk <strong>Tunggal</strong> (tanpa varian) atau produk yang memiliki <strong>Varian</strong> (seperti Warna dan Ukuran).</p>
        
        <div className="space-y-4 mt-4">
          <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">1. Master Produk (Induk)</h4>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-600 mb-2">Ini adalah payung utama dari barang yang Anda jual. <br/>Misalnya: <strong>T-Shirt Polos Cotton Combed</strong>.</p>
            <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
              <li><strong>Type:</strong> Pilih <i>INVENTORY</i> jika barang ini ada wujud fisiknya dan stoknya dikelola. Pilih <i>SERVICE</i> untuk jasa.</li>
              <li><strong>Category:</strong> Pilih kategori produk (Misal: Pakaian Pria). Ini menentukan akun COA mana yang akan dijurnal saat barang terjual.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">2. Single vs Multi-Variant</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <span className="font-semibold text-blue-800 block mb-1">Produk Tunggal (Tanpa Varian)</span>
              <p className="text-xs text-blue-700">Biarkan <i>checkbox</i> "This product has multiple options" tidak dicentang. Anda cukup mengisi SKU, HPP (Harga Modal), dan Harga Jual (Selling Price) di bagian <i>Default Pricing</i>.</p>
            </div>
            
            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
              <span className="font-semibold text-indigo-800 block mb-1">Produk dengan Varian</span>
              <p className="text-xs text-indigo-700">Centang "This product has multiple options". Bagian bawah akan berubah menampilkan opsi <i>Variant Generator</i>.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">3. Membuat Varian secara Otomatis</h4>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <ol className="list-decimal pl-4 text-xs text-slate-600 space-y-2">
              <li>Ketikkan <strong>Colors</strong> dipisah koma (Misal: <i>Black, White</i>)</li>
              <li>Ketikkan <strong>Sizes</strong> dipisah koma (Misal: <i>S, M, L</i>)</li>
              <li>Klik tombol <strong>Generate Combinations</strong>. Sistem akan otomatis membuatkan tabel baris varian (Misal: Black S, Black M, dst).</li>
              <li>Anda bisa menggunakan fitur <strong>Bulk Edit</strong> untuk menyamakan Harga Modal dan Harga Jual semua varian sekaligus, lalu klik Apply.</li>
            </ol>
            <p className="text-xs mt-3 text-rose-600 bg-rose-50 p-2 rounded"><strong>Catatan Penting:</strong> Stok barang tidak bisa diisi di form ini. Stok hanya bisa ditambah melalui menu <strong>Penerimaan Barang (Purchase)</strong> atau <strong>Penyesuaian Stok (Stock Adjustment)</strong> agar riwayatnya tercatat rapi di jurnal.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
          <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
