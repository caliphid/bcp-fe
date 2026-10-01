"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus, Loader2, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

import { productApi } from "../api";
import {
  Product,
  ProductType,
  ProductVariant,
  ProductVariantInput,
  CreateProductRequest,
  UpdateProductRequest,
  UpdateProductVariantRequest,
} from "../../../types/product";
import { BusinessUnit } from "../../../types/business-unit";
import { ProductCategory } from "../../../types/product-category";
import { extractErrorMessage } from "../../../lib/error";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Modal } from "../../../components/ui/modal";
import { useTranslation } from "../../../hooks/use-translation";
import { MasterStatus } from "../../../types/enums";
import { useRevalidateProductData } from "../hooks/use-products";
import { useSWRConfig } from "swr";

const MAX_VARIANTS_PER_REQUEST = 200;

const variantSchema = z.object({
  id: z.string().optional(),
  // Optional: backend generates <productCode>-<COLOR>-<SIZE> when empty
  sku: z.string().optional(),
  barcode: z.string().optional(),
  color: z.string().trim().min(1, "Color is required"),
  size: z.string().trim().min(1, "Size is required"),
  unitCost: z.string().min(1, "Unit Cost is required"),
  sellingPrice: z.string().optional(),
  minimumStock: z.number().int().min(0).optional(),
});

const schema = z
  .object({
    name: z.string().trim().min(2, "Product Name is required"),
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
  .superRefine((data, ctx) => {
    if (!data.hasVariants) return;
    const variants = data.variants || [];

    if (variants.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one variant is required when 'Has Variants' is checked",
        path: ["variants"],
      });
      return;
    }

    if (variants.filter((v) => !v.id).length > MAX_VARIANTS_PER_REQUEST) {
      ctx.addIssue({
        code: "custom",
        message: `Maximum ${MAX_VARIANTS_PER_REQUEST} new variants per save`,
        path: ["variants"],
      });
    }

    // Same rules as the backend: color/size compared case-insensitively,
    // SKU and barcode compared exactly after trimming.
    const flagDuplicates = (
      field: "color" | "sku" | "barcode",
      keyOf: (v: (typeof variants)[number]) => string,
      message: string,
    ) => {
      const seen = new Set<string>();
      variants.forEach((v, index) => {
        const key = keyOf(v);
        if (!key) return;
        if (seen.has(key)) {
          ctx.addIssue({ code: "custom", message, path: ["variants", index, field] });
        }
        seen.add(key);
      });
    };

    flagDuplicates(
      "color",
      (v) => `${v.color.trim().toUpperCase()}|${v.size.trim().toUpperCase()}`,
      "Duplicate color/size combination",
    );
    flagDuplicates("sku", (v) => v.sku?.trim() || "", "Duplicate SKU");
    flagDuplicates("barcode", (v) => v.barcode?.trim() || "", "Duplicate barcode");

    variants.forEach((v, index) => {
      if (v.id && !v.sku?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "SKU is required for existing variants",
          path: ["variants", index, "sku"],
        });
      }
    });
  });

type FormData = z.infer<typeof schema>;

// Maps known backend validation messages for POST/PATCH /products to form fields.
const PRODUCT_FIELD_ERRORS: { field: keyof FormData; match: (msg: string) => boolean }[] = [
  { field: "categoryId", match: (msg) => msg === "Product category not found or inactive" },
  { field: "businessUnitId", match: (msg) => msg === "Business unit not found or inactive" },
  { field: "productCode", match: (msg) => msg === "Product code already in use" },
  { field: "sku", match: (msg) => msg === "SKU already in use" || /^SKU .+ already in use by another product variant$/.test(msg) },
  { field: "defaultPrice", match: (msg) => msg === "Default price must be greater than or equal to default HPP" },
];

// "Rp 50.000" -> 50000; empty -> undefined
const parseMoney = (val?: string) => {
  const numeric = (val ?? "").replace(/\D/g, "");
  return numeric ? Number(numeric) : undefined;
};

type VariantFormValues = NonNullable<FormData["variants"]>[number];

const toVariantInput = (v: VariantFormValues): ProductVariantInput => ({
  color: v.color.trim(),
  size: v.size.trim(),
  sku: v.sku?.trim() || undefined,
  barcode: v.barcode?.trim() || undefined,
  unitCost: parseMoney(v.unitCost),
  sellingPrice: parseMoney(v.sellingPrice),
  minimumStock: v.minimumStock,
});

// Only the fields of an existing variant that actually changed.
const getVariantChanges = (v: VariantFormValues, original: ProductVariant) => {
  const changes: UpdateProductVariantRequest = {};
  const sku = v.sku?.trim() || "";
  const barcode = v.barcode?.trim() || "";
  const unitCost = parseMoney(v.unitCost) ?? 0;
  const sellingPrice = parseMoney(v.sellingPrice) ?? 0;

  if (sku !== original.sku) changes.sku = sku;
  if (barcode && barcode !== (original.barcode || "")) changes.barcode = barcode;
  if (v.color.trim() !== original.color) changes.color = v.color.trim();
  if (v.size.trim() !== original.size) changes.size = v.size.trim();
  if (unitCost !== Number(original.unitCost)) changes.unitCost = String(unitCost);
  if (sellingPrice !== Number(original.sellingPrice || 0)) changes.sellingPrice = String(sellingPrice);
  if (v.minimumStock !== undefined && v.minimumStock !== original.minimumStock) {
    changes.minimumStock = v.minimumStock;
  }
  return changes;
};

interface ProductFormProps {
  businessUnits: BusinessUnit[];
  productCategories: ProductCategory[];
  initialData?: Product; // The product object including variants
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
  const { mutate } = useSWRConfig();
  const revalidateProductData = useRevalidateProductData();

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
    setError: setFieldError,
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
        initialData?.variants?.map((v) => ({
          id: v.id,
          sku: v.sku || "",
          barcode: v.barcode || "",
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

  // Only ACTIVE categories can be assigned; keep the current one so an edit doesn't silently drop it.
  const selectableCategories = productCategories.filter(
    (cat) => cat.status === MasterStatus.ACTIVE || cat.id === initialData?.categoryId,
  );

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

    const baseHpp = getValues("defaultHpp") || "0";
    const basePrice = getValues("defaultPrice") || "0";

    const existingVariants = getValues("variants") || [];
    const newVariants = [];

    for (const c of finalColors) {
      for (const s of finalSizes) {
        // Cek apakah varian dengan warna & ukuran ini sudah ada
        const existing = existingVariants.find(
          (v) =>
            v.color.trim().toUpperCase() === c.toUpperCase() &&
            v.size.trim().toUpperCase() === s.toUpperCase(),
        );

        if (existing) {
          // Pertahankan varian yang sudah ada (termasuk ID dan SKU lama)
          newVariants.push(existing);
        } else {
          // SKU dikosongkan: backend generate <productCode>-<COLOR>-<SIZE>
          newVariants.push({
            sku: "",
            barcode: "",
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
    let productSaved = false;
    try {
      const variants = data.hasVariants ? data.variants || [] : [];
      const defaultHpp = String(parseMoney(data.defaultHpp) ?? 0);
      const defaultPrice = String(parseMoney(data.defaultPrice) ?? 0);
      let productId: string;

      if (!initialData) {
        // Product + all variants in one atomic request
        const payload: CreateProductRequest = {
          name: data.name,
          type: data.type,
          // Empty productCode: backend generates PRD-YYYYMMDD-NNNN
          productCode: data.productCode?.trim() || undefined,
          businessUnitId: data.businessUnitId || undefined,
          categoryId: data.categoryId || undefined,
          articleName: data.articleName?.trim() || undefined,
          description: data.description?.trim() || undefined,
        };
        if (data.hasVariants) {
          payload.variants = variants.map(toVariantInput);
        } else {
          // Without variants the backend creates a DEFAULT/DEFAULT variant
          payload.sku = data.sku?.trim() || undefined;
          payload.defaultHpp = defaultHpp;
          payload.defaultPrice = defaultPrice;
        }

        const created = await productApi.createProduct(payload);
        productId = created.data.id;
        productSaved = true;
        mutate(`/products/${productId}`, created, { revalidate: false });
      } else {
        productId = initialData.id;

        // 1. Patch only the product fields that changed
        const changes: UpdateProductRequest = {};
        const productCode = data.productCode?.trim() || "";
        const articleName = data.articleName?.trim() || "";
        const description = data.description?.trim() || "";

        if (data.name !== initialData.name) changes.name = data.name;
        if (data.type !== initialData.type) changes.type = data.type;
        // Empty productCode means "unchanged"
        if (productCode && productCode !== initialData.productCode) changes.productCode = productCode;
        if (data.businessUnitId && data.businessUnitId !== initialData.businessUnitId) {
          changes.businessUnitId = data.businessUnitId;
        }
        if (data.categoryId && data.categoryId !== initialData.categoryId) {
          changes.categoryId = data.categoryId;
        }
        if (articleName !== (initialData.articleName || "")) changes.articleName = articleName;
        if (description !== (initialData.description || "")) changes.description = description;
        if (!data.hasVariants) {
          const sku = data.sku?.trim() || "";
          // Sending "" clears the product SKU
          if (sku !== (initialData.sku || "")) changes.sku = sku;
          if (Number(defaultHpp) !== Number(initialData.defaultHpp)) changes.defaultHpp = defaultHpp;
          if (Number(defaultPrice) !== Number(initialData.defaultPrice)) changes.defaultPrice = defaultPrice;
        }

        if (Object.keys(changes).length > 0) {
          await productApi.updateProduct(productId, changes);
        }
        productSaved = true;

        if (data.hasVariants) {
          const originalVariants = new Map(
            (initialData.variants || []).map((v) => [v.id, v]),
          );

          // 2. Patch existing variants that actually changed
          const variantUpdates = variants
            .filter((v) => v.id && originalVariants.has(v.id))
            .map((v) => ({
              id: v.id as string,
              changes: getVariantChanges(v, originalVariants.get(v.id as string) as ProductVariant),
            }))
            .filter((u) => Object.keys(u.changes).length > 0);

          await Promise.all(
            variantUpdates.map((u) => productApi.updateProductVariant(u.id, u.changes)),
          );

          // 3. Create all new variants in one atomic request
          const newVariants = variants.filter((v) => !v.id);
          if (newVariants.length > 0) {
            await productApi.createProductVariantsBulk(productId, {
              variants: newVariants.map(toVariantInput),
            });
          }

          // 4. Deactivate variants removed from the form
          const keptIds = new Set(variants.map((v) => v.id).filter(Boolean));
          const variantsToRemove = (initialData.variants || []).filter(
            (v) => !keptIds.has(v.id) && v.status === MasterStatus.ACTIVE,
          );
          await Promise.all(
            variantsToRemove.map((v) => productApi.deactivateProductVariant(v.id)),
          );
        }

        mutate(`/products/${productId}`);
      }

      revalidateProductData();
      toast.success(
        `Product successfully ${initialData ? "updated" : "created"}!`,
      );
      router.push(`/dashboard/products/${productId}`);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast.error(message);
      if (!productSaved) {
        const fieldError = PRODUCT_FIELD_ERRORS.find((e) => e.match(message));
        if (fieldError) {
          setFieldError(fieldError.field, { type: "server", message });
        }
      }
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
            {t("features.products.form.section1")}
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 h-8 px-3">
            <HelpCircle className="w-4 h-4 mr-1.5" /> {t("features.products.form.tutorial")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>
              {t("features.products.form.productName")} <span className="text-rose-500">*</span>
            </Label>
            <Input placeholder={t("features.products.form.productNamePh")} {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t("features.products.form.articleName")}</Label>
            <Input
              placeholder={t("features.products.form.articleNamePh")}
              {...register("articleName")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("features.products.form.productCode")}</Label>
            <Input placeholder={t("features.products.form.productCodePh")} {...register("productCode")} />
            {errors.productCode ? (
              <p className="text-sm text-red-500">{errors.productCode.message}</p>
            ) : (
              <p className="text-xs text-slate-500">
                {t("features.products.form.productCodeNote")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              {t("features.products.form.productType")} <span className="text-rose-500">*</span>
            </Label>
            <select
              className="w-full h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              {...register("type")}
            >
              <option value="PHYSICAL_PRODUCT">{t("features.products.form.physicalProduct")}</option>
              <option value="SERVICE">{t("features.products.form.service")}</option>
              <option value="RAW_MATERIAL">{t("features.products.form.rawMaterial")}</option>
              <option value="OTHER">{t("features.products.form.other")}</option>
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
            {errors.businessUnitId && (
              <p className="text-sm text-red-500">{errors.businessUnitId.message}</p>
            )}
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
                  {selectableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </SearchableSelect>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-red-500">{errors.categoryId.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>{t("features.products.form.description")}</Label>
            <Textarea
              rows={3}
              placeholder={t("features.products.form.descriptionPh")}
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
              {t("features.products.form.section2")}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t("features.products.form.section2Desc")}
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
              {errors.sku && (
                <p className="text-sm text-red-500">{errors.sku.message}</p>
              )}
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
              <Label>{t("features.products.form.defaultPrice")}</Label>
              <Input
                placeholder="Rp 0"
                {...register("defaultPrice")}
                onChange={(e) => {
                  setValue("defaultPrice", formatInputMoney(e.target.value));
                }}
              />
              {errors.defaultPrice && (
                <p className="text-sm text-red-500">{errors.defaultPrice.message}</p>
              )}
            </div>
          </div>
        )}

        {/* VARIANT FIELDS */}
        {hasVariants && (
          <div className="space-y-6">
            {/* VARIANT GENERATOR */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3">
                {t("features.products.form.autoGenerate")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-indigo-700">
                    {t("features.products.form.colors")}
                  </Label>
                  <Input
                    placeholder={t("features.products.form.colorsPh")}
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    className="bg-white border-indigo-200 focus-visible:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-indigo-700">
                    {t("features.products.form.sizes")}
                  </Label>
                  <Input
                    placeholder={t("features.products.form.sizesPh")}
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
                    {t("features.products.form.bulkApply")}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {t("features.products.form.bulkApplyDesc")}
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

            <p className="text-xs text-slate-500">
              {t("features.products.form.variantSkuHint")}
            </p>

            {errors.variants?.root && (
              <p className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded">
                {errors.variants.root.message}
              </p>
            )}

            {fields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-14 gap-3 items-end p-4 bg-slate-50 border border-slate-200 rounded-xl relative hover:border-slate-300 transition-colors"
              >
                {/* Visual number indicator */}
                <div className="absolute -left-3 -top-3 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                  {index + 1}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">SKU</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder={t("features.products.form.variantSkuPh")}
                    {...register(`variants.${index}.sku` as const)}
                  />
                  {errors.variants?.[index]?.sku && (
                    <p className="text-[10px] text-red-500">
                      {errors.variants[index]?.sku?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-xs">{t("features.products.form.barcode")}</Label>
                  <Input
                    className="h-9 text-sm"
                    {...register(`variants.${index}.barcode` as const)}
                  />
                  {errors.variants?.[index]?.barcode && (
                    <p className="text-[10px] text-red-500">
                      {errors.variants[index]?.barcode?.message}
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
                  barcode: "",
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
              <p className="text-xs text-blue-700">Biarkan <i>checkbox</i> &quot;This product has multiple options&quot; tidak dicentang. Anda cukup mengisi SKU, HPP (Harga Modal), dan Harga Jual (Selling Price) di bagian <i>Default Pricing</i>.</p>
            </div>
            
            <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
              <span className="font-semibold text-indigo-800 block mb-1">Produk dengan Varian</span>
              <p className="text-xs text-indigo-700">Centang &quot;This product has multiple options&quot;. Bagian bawah akan berubah menampilkan opsi <i>Variant Generator</i>.</p>
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
