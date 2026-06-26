"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Search, HelpCircle } from "lucide-react";
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
import { Modal } from "@/components/ui/modal";

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
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);

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
      header: t("common.labels.date"),
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
      header: t("common.labels.warehouse"),
      cell: (item: InventoryMovement) => item.warehouse?.name || "-",
    },
    {
      header: t("common.labels.productVariant"),
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
      header: t("common.labels.type"),
      cell: (item: InventoryMovement) => (
        <span
          className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${getMovementColor(item.movementType)}`}
        >
          {formatMovementType(item.movementType)}
        </span>
      ),
    },
    {
      header: t("common.labels.qty"),
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
      header: t("common.labels.reference"),
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
      header: t("common.labels.user"),
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
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {t("pages.movementsLog.title")}
            </h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200 h-8 px-3">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Panduan Log Stok
            </Button>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {t("pages.movementsLog.subtitle")}
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
            placeholder={t("pages.movementsLog.searchPlaceholder")}
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
          <option value="">{t("pages.movementsLog.allMovementTypes")}</option>
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

      <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Log Pergerakan Stok" className="max-w-3xl">
        <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          <p className="mb-2">Halaman <strong>Log Pergerakan</strong> (Inventory Movements) adalah pusat audit stok barang Anda. Semua penambahan atau pengurangan stok dicatat secara ketat di sini dan <strong>tidak bisa dihapus</strong> untuk mencegah kecurangan (fraud).</p>
          
          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">1. Konsep Mutasi Stok</h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-600 mb-2">Jika stok tiba-tiba tidak sesuai dengan fisik, halaman inilah yang harus Anda cek pertama kali. Setiap baris mewakili 1 kejadian (transaksi).</p>
              <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                <li>Kolom <strong>Qty Before</strong>: Sisa stok sebelum transaksi terjadi.</li>
                <li>Kolom <strong>Qty Change</strong>: Jumlah barang yang masuk (angka positif hijau) atau keluar (angka negatif merah).</li>
                <li>Kolom <strong>Qty After</strong>: Sisa stok akhir setelah transaksi tersebut.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4 mt-6">
            <h4 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">2. Membaca Tipe Pergerakan (Movement Type)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <span className="font-semibold text-emerald-800 block mb-1">Pemasukan Stok (+)</span>
                <ul className="list-disc pl-4 text-xs text-emerald-700 space-y-1">
                  <li><strong>Vendor Receipt:</strong> Terima barang dari Supplier.</li>
                  <li><strong>Customer Return:</strong> Pembeli mengembalikan barang (retur).</li>
                  <li><strong>Stock Adjustment In:</strong> Hasil penyesuaian stok opname manual.</li>
                </ul>
              </div>
              
              <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100">
                <span className="font-semibold text-rose-800 block mb-1">Pengeluaran Stok (-)</span>
                <ul className="list-disc pl-4 text-xs text-rose-700 space-y-1">
                  <li><strong>Sale Fulfillment:</strong> Barang dikirim ke pembeli (Sales Order).</li>
                  <li><strong>Damaged:</strong> Barang dilaporkan rusak/cacat.</li>
                  <li><strong>Stock Adjustment Out:</strong> Penyesuaian stok turun (hilang/selisih).</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-6">
            <span className="font-semibold text-amber-800 block mb-1">Catatan Keamanan (Security)</span>
            <p className="text-xs text-amber-700">Untuk menjaga keabsahan data akuntansi, setiap pergerakan yang memengaruhi HPP (seperti penerimaan atau penjualan) akan secara otomatis men-jurnal ke buku besar (General Ledger). Anda dapat melihat siapa yang memicu pergerakan tersebut di kolom <strong>User</strong>.</p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
            <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
