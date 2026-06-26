"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "../../../../../store/auth-store";
import { Button } from "../../../../../components/ui/button";
import { PlusCircle, Search, AlertTriangle, SlidersHorizontal } from "lucide-react";
import { Input } from "../../../../../components/ui/input";
import { extractErrorMessage } from "../../../../../lib/error";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { useInventoryStock } from "../../../../../features/inventory/hooks/use-inventory";
import { useWarehouses } from "../../../../../features/warehouses/hooks/use-warehouses";
import { useProductVariants } from "../../../../../features/products/hooks/use-products";
import { OpeningStockModal } from "../../../../../features/inventory/components/opening-stock-modal";
import { StockAdjustmentModal } from "../../../../../features/inventory/components/stock-adjustment-modal";
import { DataTable } from "../../../../../components/ui/data-table";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { InventoryStock } from "../../../../../types/inventory";

export default function StockPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");

  const { data: warehousesData } = useWarehouses({ limit: 100, status: "ACTIVE" });
  const warehouses = warehousesData || [];

  // No longer fetching 1000 variants upfront
  // const { data: variantsData } = useProductVariants({ limit: 1000, status: "ACTIVE" });
  const variants: any[] = [];

  const { data: stockData, meta, isLoading, error, mutate: fetchData } = useInventoryStock({
    page,
    limit: 10,
    search: searchQuery || undefined,
    warehouseId: warehouseFilter || undefined,
  });

  const data = stockData || [];
  const globalError = error ? extractErrorMessage(error) : null;

  const [isOpeningStockOpen, setIsOpeningStockOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentTarget, setAdjustmentTarget] = useState<{
    warehouseId?: string;
    variantId?: string;
    variantLabel?: string;
  } | null>(null);

  const handleAdjustRow = (item: InventoryStock) => {
    setAdjustmentTarget({
      warehouseId: item.warehouseId || item.warehouse?.id || (item as any).warehouse_id,
      variantId: item.productVariantId || item.variant?.id || (item as any).variant_id || (item as any).product_variant_id,
      variantLabel: `${item.product?.name} - ${item.color} - ${item.size} (${item.sku})`
    });
    setIsAdjustmentOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const columns = [
    {
      header: t("common.labels.warehouse"),
      cell: (item: InventoryStock) => item.warehouse?.name || "-"
    },
    {
      header: t("common.labels.product"),
      cell: (item: InventoryStock) => (
        <div>
          <div className="font-semibold text-slate-900">{item.product?.name}</div>
          <div className="text-xs text-slate-500">{item.sku}</div>
        </div>
      )
    },
    {
      header: t("common.labels.variant"),
      cell: (item: InventoryStock) => `${item.color} - ${item.size}`
    },
    {
      header: t("common.labels.onHand"),
      className: "text-right font-medium text-slate-900",
      accessorKey: "onHand" as keyof InventoryStock
    },
    {
      header: t("common.labels.reserved"),
      className: "text-right font-medium text-amber-600",
      accessorKey: "reserved" as keyof InventoryStock
    },
    {
      header: t("common.labels.available"),
      className: "text-right font-bold text-emerald-600",
      cell: (item: InventoryStock) => (
        <div className="flex items-center justify-end gap-2">
          {item.isLowStock && (
            <AlertTriangle className="w-4 h-4 text-red-500" />
          )}
          <span className={item.isLowStock ? "text-red-600" : ""}>{item.available}</span>
        </div>
      )
    },
    {
      header: t("common.labels.actions"),
      className: "text-right",
      cell: (item: InventoryStock) => (
        canMutate ? (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAdjustRow(item)}
              title={t("pages.inventoryStock.adjustStock")}
              className="text-slate-500 hover:text-primary-600"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        ) : null
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("pages.inventoryStock.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("pages.inventoryStock.subtitle")}</p>
        </div>
        {canMutate && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="shadow-sm"
              onClick={() => setIsAdjustmentOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> {t("pages.inventoryStock.stockAdjustment")}
            </Button>
            <Button
              className="shadow-primary-500/30 shadow-md"
              onClick={() => setIsOpeningStockOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> {t("pages.inventoryStock.openingStock")}
            </Button>
          </div>
        )}
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2 col-span-2 sm:col-span-1 lg:col-span-2">
          <Input
            placeholder={t("pages.inventoryStock.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <SearchableSelect
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={warehouseFilter}
          onChange={(e) => {
            setWarehouseFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("common.labels.allWarehouses")}</option>
          {warehouses.map((w: any) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </SearchableSelect>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        meta={meta}
        onPageChange={setPage}
        isLoading={isLoading}
      />

      {/* Modals */}
      {isOpeningStockOpen && (
        <OpeningStockModal
          isOpen={isOpeningStockOpen}
          onClose={() => setIsOpeningStockOpen(false)}
          warehouses={warehouses}
          variants={variants}
          onSuccess={() => {
            setIsOpeningStockOpen(false);
            fetchData();
          }}
        />
      )}

      {isAdjustmentOpen && (
        <StockAdjustmentModal
          isOpen={isAdjustmentOpen}
          onClose={() => {
            setIsAdjustmentOpen(false);
            setAdjustmentTarget(null);
          }}
          warehouses={warehouses}
          variants={variants}
          initialWarehouseId={adjustmentTarget?.warehouseId}
          initialVariantId={adjustmentTarget?.variantId}
          initialVariantLabel={adjustmentTarget?.variantLabel}
          onSuccess={() => {
            setIsAdjustmentOpen(false);
            setAdjustmentTarget(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
