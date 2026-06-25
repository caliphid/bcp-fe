"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../../../../../components/ui/input";
import { Button } from "../../../../../components/ui/button";
import { extractErrorMessage } from "../../../../../lib/error";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { useInventoryMovements } from "../../../../../features/inventory/hooks/use-inventory";
import { useWarehouses } from "../../../../../features/warehouses/hooks/use-warehouses";
import { DataTable } from "../../../../../components/ui/data-table";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  InventoryMovement,
  InventoryMovementType,
} from "../../../../../types/inventory";
import { formatDate } from "../../../../../lib/utils";
import Link from "next/link";
import useSWR from "swr";
import { usersApi } from "@/features/users/api";
import { Warehouse } from "@/types/warehouse";

const getMovementColor = (type: InventoryMovementType | string) => {
  switch (type) {
    case InventoryMovementType.OPENING_STOCK:
    case InventoryMovementType.STOCK_ADJUSTMENT_IN:
    case InventoryMovementType.VENDOR_RECEIPT:
    case InventoryMovementType.CUSTOMER_RETURN_RESTOCK:
    case InventoryMovementType.SALE_RETURN:
      return "text-emerald-600 bg-emerald-50";
    case InventoryMovementType.STOCK_ADJUSTMENT_OUT:
    case InventoryMovementType.DAMAGED:
    case InventoryMovementType.SALE_FULFILLMENT:
    case InventoryMovementType.CUSTOMER_RETURN_DAMAGED:
    case InventoryMovementType.EXCHANGE_FULFILLMENT:
      return "text-rose-600 bg-rose-50";
    case InventoryMovementType.SALE_RESERVATION:
    case InventoryMovementType.EXCHANGE_RESERVATION:
      return "text-amber-600 bg-amber-50";
    case InventoryMovementType.SALE_RESERVATION_RELEASE:
    case InventoryMovementType.VENDOR_RECEIPT_REVERSAL:
    case InventoryMovementType.CUSTOMER_RETURN_REVERSAL:
    case InventoryMovementType.EXCHANGE_RESERVATION_RELEASE:
      return "text-indigo-600 bg-indigo-50";
    default:
      return "text-slate-600 bg-slate-50";
  }
};

const formatMovementType = (type: string) => {
  if (!type) return "-";
  return type
    .split("_")
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

export default function MovementsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: warehousesData } = useWarehouses({
    limit: 100,
    status: "ACTIVE",
  });
  const warehouses = warehousesData || [];

  const { data: usersResponse } = useSWR("users-list", usersApi.getUsers);
  const users = usersResponse?.data || [];
  const usersMap = new Map(users.map((u) => [u.id, u]));

  const {
    data: movementsData,
    meta,
    isLoading,
    error,
  } = useInventoryMovements({
    page,
    limit: 20,
    search: searchQuery || undefined,
    warehouseId: warehouseFilter || undefined,
    movementType: typeFilter || undefined,
  });

  const data = movementsData || [];
  const globalError = error ? extractErrorMessage(error) : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const columns = [
    {
      header: "Date",
      cell: (item: InventoryMovement) => (
        <div>
          <div className="font-medium text-slate-900">
            {formatDate(item.movementDate as string)}
          </div>
          <div className="text-xs text-slate-500">
            {new Date(item.movementDate).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ),
    },
    {
      header: "Warehouse",
      cell: (item: InventoryMovement) => item.warehouse?.name || "-",
    },
    {
      header: "Product / Variant",
      cell: (item: InventoryMovement) => {
        const variant = item.productVariant || item.variant;
        const product = item.product || variant?.product;
        const productId = item.productId || product?.id;

        return (
          <div>
            {productId ? (
              <Link
                href={`/dashboard/products/${productId}`}
                className="font-semibold text-indigo-600 hover:underline"
              >
                {product?.name || "-"}
              </Link>
            ) : (
              <span className="font-semibold text-slate-900">
                {product?.name || "-"}
              </span>
            )}
            <div className="text-xs text-slate-500 mt-1">
              {variant
                ? `${variant.sku} • ${variant.color} • ${variant.size}`
                : "-"}
            </div>
          </div>
        );
      },
    },
    {
      header: "Type",
      cell: (item: InventoryMovement) => (
        <span
          className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${getMovementColor(item.movementType)}`}
        >
          {formatMovementType(item.movementType)}
        </span>
      ),
    },
    {
      header: "Qty",
      className: "text-right font-bold text-slate-900",
      cell: (item: InventoryMovement) => {
        const isPositive = [
          InventoryMovementType.OPENING_STOCK,
          InventoryMovementType.STOCK_ADJUSTMENT_IN,
          InventoryMovementType.SALE_RESERVATION_RELEASE,
          InventoryMovementType.VENDOR_RECEIPT,
          InventoryMovementType.CUSTOMER_RETURN_RESTOCK,
          InventoryMovementType.SALE_RETURN,
          InventoryMovementType.EXCHANGE_RESERVATION_RELEASE
        ].includes(item.movementType);

        return (
          <span className={isPositive ? "text-emerald-600" : "text-red-600"}>
            {isPositive ? "+" : ""}
            {item.quantity}
          </span>
        );
      },
    },
    {
      header: "Reference",
      cell: (item: InventoryMovement) => (
        <div>
          <div className="text-sm font-medium text-slate-700">
            {item.referenceCode || "-"}
          </div>
          {item.reason && (
            <div className="text-xs text-slate-500 mt-0.5">{item.reason}</div>
          )}
        </div>
      ),
    },
    {
      header: "User",
      cell: (item: InventoryMovement) => {
        const creator =
          item.createdBy ||
          usersMap.get((item as any).createdById || (item as any).created_by_id);
        return creator?.name || "-";
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Movement Log
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View history of inventory movements and adjustments.
          </p>
        </div>
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search Reference..."
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
          <option value="">All Warehouses</option>
          {warehouses.map((w: Warehouse) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </SearchableSelect>
        <SearchableSelect
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Movement Types</option>
          {Object.values(InventoryMovementType).map(
            (t: InventoryMovementType) => (
              <option key={t} value={t}>
                {formatMovementType(t)}
              </option>
            ),
          )}
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
