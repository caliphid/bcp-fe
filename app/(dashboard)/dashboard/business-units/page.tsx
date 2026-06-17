"use client";

import { useEffect, useState, useCallback } from "react";
import { businessUnitsApi } from "../../../../features/business-units/api";
import { BusinessUnit } from "../../../../types/business-unit";
import { PaginationMeta } from "../../../../types/common";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle, Pencil, Search } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { BusinessUnitForm } from "../../../../components/forms/business-unit-form";
import { DataTable } from "../../../../components/ui/data-table";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { ConfirmDialog } from "../../../../components/ui/confirm-dialog";
import { Input } from "../../../../components/ui/input";
import { extractErrorMessage } from "../../../../lib/error";
import { Alert, AlertDescription } from "../../../../components/ui/alert";

export default function BusinessUnitsPage() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<BusinessUnit[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessUnit | null>(null);

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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await businessUnitsApi.getBusinessUnits({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      });
      setData(res.data);
      setMeta(res.meta);
      setGlobalError(null);
    } catch (err) {
      setGlobalError("Failed to fetch business units");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleToggleStatus = (item: BusinessUnit) => {
    const isActivating = item.status === "INACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? "Activate Business Unit" : "Deactivate Business Unit",
      message: isActivating
        ? `Are you sure you want to activate ${item.name}?`
        : `Are you sure you want to deactivate ${item.name}? This will fail if it's still used by active accounts or products.`,
      action: async () => {
        try {
          if (isActivating) {
            await businessUnitsApi.activateBusinessUnit(item.id);
          } else {
            await businessUnitsApi.deactivateBusinessUnit(item.id);
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

  const columns = [
    { header: "Name", accessorKey: "name" as keyof BusinessUnit },
    { header: "Description", accessorKey: "description" as keyof BusinessUnit },
    {
      header: "Status",
      cell: (item: BusinessUnit) => (
        <StatusBadge
          status={item.status}
          canToggle={user?.role === "OWNER"}
          onToggle={() => handleToggleStatus(item)}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item: BusinessUnit) => (
        <div className="flex justify-end gap-2">
          {user?.role === "OWNER" && (
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Business Units</h2>
          <p className="mt-1 text-sm text-slate-500">Manage your business units and brands.</p>
        </div>
        {user?.role === "OWNER" && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Unit
          </Button>
        )}
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-sm flex gap-2">
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
          className="flex h-11 w-48 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
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
        title={editingItem ? "Edit Business Unit" : "Create Business Unit"}
      >
        <BusinessUnitForm
          initialData={editingItem || undefined}
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
