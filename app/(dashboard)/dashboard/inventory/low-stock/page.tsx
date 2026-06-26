"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { useAuthStore } from "../../../../../store/auth-store";
import { Search, AlertTriangle } from "lucide-react";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import { extractErrorMessage } from "../../../../../lib/error";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { useLowStock } from "../../../../../features/inventory/hooks/use-inventory";
import { useWarehouses } from "../../../../../features/warehouses/hooks/use-warehouses";
import { DataTable } from "../../../../../components/ui/data-table";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { InventoryStock } from "../../../../../types/inventory";
import Link from "next/link";

export default function LowStockPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");

  const { data: warehousesData } = useWarehouses({ limit: 100, status: "ACTIVE" });
  const warehouses = warehousesData || [];

  const { data: stockData, meta, isLoading, error } = useLowStock({
    page,
    limit: 10,
    search: searchQuery || undefined,
    warehouseId: warehouseFilter || undefined,
  });

  const data = stockData || [];
  const globalError = error ? extractErrorMessage(error) : null;

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
          <Link href={`/dashboard/products/${item.productId}`} className="font-semibold text-indigo-600 hover:underline">
            {item.product?.name}
          </Link>
          <div className="text-xs text-slate-500">{item.sku}</div>
        </div>
      )
    },
    {
      header: t("common.labels.variant"),
      cell: (item: InventoryStock) => `${item.color} - ${item.size}`
    },
    {
      header: t("common.labels.minimumStock"),
      className: "text-right font-medium text-slate-500",
      accessorKey: "minimumStock" as keyof InventoryStock
    },
    {
      header: t("common.labels.available"),
      className: "text-right font-bold text-red-600",
      cell: (item: InventoryStock) => (
        <div className="flex items-center justify-end gap-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span>{item.available}</span>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            {t("pages.lowStock.title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t("pages.lowStock.subtitle")}</p>
        </div>
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
            placeholder={t("pages.lowStock.searchPlaceholder")}
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
    </div>
  );
}
