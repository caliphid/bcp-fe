"use client";

import { useEffect, useState, useCallback } from "react";
import { productsApi } from "../../../../features/products/api";
import { businessUnitsApi } from "../../../../features/business-units/api";
import { Product } from "../../../../types/product";
import { BusinessUnit } from "../../../../types/business-unit";
import { PaginationMeta } from "../../../../types/common";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle, Pencil, Search } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { ProductForm } from "../../../../components/forms/product-form";
import { DataTable } from "../../../../components/ui/data-table";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { ConfirmDialog } from "../../../../components/ui/confirm-dialog";
import { Input } from "../../../../components/ui/input";
import { extractErrorMessage } from "../../../../lib/error";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { ProductType } from "../../../../types/enums";

export default function ProductsPage() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<Product[]>([]);
  const [businessUnits, setBusinessUnits] = useState<BusinessUnit[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [buFilter, setBuFilter] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

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

  useEffect(() => {
    businessUnitsApi.getBusinessUnits({ limit: 100, status: "ACTIVE" })
      .then(res => setBusinessUnits(res.data))
      .catch(err => console.error("Failed to fetch business units", err));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.getProducts({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        businessUnitId: buFilter || undefined,
      });
      setData(res.data);
      setMeta(res.meta);
      setGlobalError(null);
    } catch (err) {
      setGlobalError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter, buFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleToggleStatus = (item: Product) => {
    const isActivating = item.status === "INACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? "Activate Product" : "Deactivate Product",
      message: isActivating
        ? `Are you sure you want to activate ${item.name}?`
        : `Are you sure you want to deactivate ${item.name}?`,
      action: async () => {
        try {
          if (isActivating) {
            await productsApi.activateProduct(item.id);
          } else {
            await productsApi.deactivateProduct(item.id);
          }
          fetchData();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          setGlobalError(extractErrorMessage(err));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const formatCurrency = (val: string) => {
    const num = Number(val);
    return isNaN(num) ? "0" : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const columns = [
    { header: "Name", accessorKey: "name" as keyof Product },
    { header: "SKU", cell: (item: Product) => item.sku || "-" },
    { 
      header: "Business Unit", 
      cell: (item: Product) => item.businessUnit?.name || "-" 
    },
    { 
      header: "Type", 
      cell: (item: Product) => (
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
          {item.type.replace('_', ' ')}
        </span>
      )
    },
    { 
      header: "Price", 
      cell: (item: Product) => formatCurrency(item.defaultPrice)
    },
    {
      header: "Status",
      cell: (item: Product) => (
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
      cell: (item: Product) => (
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Products</h2>
          <p className="mt-1 text-sm text-slate-500">Manage master data for products and services.</p>
        </div>
        {canMutate && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Product
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
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <select
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
        </select>
        <select
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Types</option>
          {Object.values(ProductType).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={buFilter}
          onChange={(e) => {
            setBuFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Business Units</option>
          {businessUnits.map((bu) => (
            <option key={bu.id} value={bu.id}>{bu.name}</option>
          ))}
        </select>
      </div>

      <DataTable
        data={data}
        columns={columns}
        meta={meta}
        onPageChange={setPage}
        isLoading={loading}
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingItem ? "Edit Product" : "Create Product"}
      >
        <ProductForm
          initialData={editingItem || undefined}
          businessUnits={businessUnits}
          onSuccess={() => {
            setIsFormOpen(false);
            fetchData();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

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
