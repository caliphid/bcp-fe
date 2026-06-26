"use client";

import { useState } from "react";
import { warehouseApi } from "../../../../features/warehouses/api";
import { Warehouse } from "../../../../types/warehouse";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle, Pencil, Search, CheckCircle2 } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { ConfirmDialog } from "../../../../components/ui/confirm-dialog";
import { extractErrorMessage } from "../../../../lib/error";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useWarehouses } from "../../../../features/warehouses/hooks/use-warehouses";
import { useBusinessUnits } from "../../../../features/business-units/hooks/use-business-units";
import { WarehouseFormModal } from "../../../../features/warehouses/components/warehouse-form-modal";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { DataTable } from "../../../../components/ui/data-table";
import toast from "react-hot-toast";
import Link from "next/link";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTranslation } from "@/hooks/use-translation";

export default function WarehousesPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [businessUnitFilter, setBusinessUnitFilter] = useState("");

  const { data: businessUnitsData } = useBusinessUnits();
  const businessUnits = businessUnitsData || [];

  const { data: warehousesData, meta, isLoading, error, mutate: fetchData } = useWarehouses({
    page,
    limit: 10,
    search: searchQuery || undefined,
    status: statusFilter || undefined,
    businessUnitId: businessUnitFilter || undefined,
  });

  const data = warehousesData || [];
  const globalError = error ? extractErrorMessage(error) : null;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Warehouse | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: async () => {},
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleToggleStatus = (item: Warehouse) => {
    const isActivating = item.status === "INACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? t("pages.warehouses.activateWarehouse") : t("pages.warehouses.deactivateWarehouse"),
      message: isActivating
        ? t("pages.warehouses.confirmActivate").replace("{name}", item.name)
        : t("pages.warehouses.confirmDeactivate").replace("{name}", item.name),
      action: async () => {
        try {
          if (isActivating) {
            await warehouseApi.activateWarehouse(item.id);
          } else {
            await warehouseApi.deactivateWarehouse(item.id);
          }
          fetchData();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          toast.success(isActivating ? t("pages.warehouses.activated") : t("pages.warehouses.deactivated"));
        } catch (err) {
          toast.error(extractErrorMessage(err));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const columns = [
    { 
      header: "Warehouse Name", 
      accessorKey: "name" as keyof Warehouse,
      cell: (item: Warehouse) => (
        <div className="font-semibold text-slate-900 flex items-center gap-2">
          {item.name}
          {item.isDefault && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
              <CheckCircle2 className="w-3 h-3" /> Default
            </span>
          )}
        </div>
      )
    },
    { header: "Code", cell: (item: Warehouse) => item.warehouseCode || "-" },
    { 
      header: "Business Unit", 
      cell: (item: Warehouse) => item.businessUnit?.name || "-" 
    },
    { 
      header: "Address", 
      cell: (item: Warehouse) => <span className="text-slate-500 max-w-[200px] truncate block" title={item.address}>{item.address || "-"}</span> 
    },
    {
      header: "Status",
      cell: (item: Warehouse) => (
        <StatusBadge
          status={item.status}
          canToggle={canMutate}
          onToggle={() => handleToggleStatus(item)}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item: Warehouse) => (
        <div className="flex justify-end gap-2">
          {canMutate && (
            <button
              onClick={() => {
                setEditingItem(item);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("pages.warehouses.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("pages.warehouses.subtitle")}</p>
        </div>
        {canMutate && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> {t("pages.warehouses.createWarehouse")}
          </Button>
        )}
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
            placeholder={t("pages.warehouses.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <SearchableSelect
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </SearchableSelect>
        <SearchableSelect
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={businessUnitFilter}
          onChange={(e) => {
            setBusinessUnitFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Business Units</option>
          {businessUnits.map((bu: any) => (
            <option key={bu.id} value={bu.id}>{bu.name}</option>
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

      {/* Form Modal */}
      {isFormOpen && (
        <WarehouseFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          businessUnits={businessUnits}
          initialData={editingItem}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchData();
          }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
