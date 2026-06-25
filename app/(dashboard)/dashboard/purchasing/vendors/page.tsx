"use client";
import { useState } from "react";
import { useVendors } from "../../../../../features/purchasing/hooks/use-purchasing";
import { Vendor, VendorStatus } from "../../../../../features/purchasing/types";
import { purchasingApi } from "../../../../../features/purchasing/api";
import { useAuthStore } from "../../../../../store/auth-store";
import { extractErrorMessage } from "../../../../../lib/error";
import { DataTable } from "../../../../../components/ui/data-table";
import { Button } from "../../../../../components/ui/button";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { ConfirmDialog } from "../../../../../components/ui/confirm-dialog";
import { PlusCircle, Search, Edit2 } from "lucide-react";
import { VendorFormModal } from "../../../../../features/purchasing/components/vendor-form-modal";
import toast from "react-hot-toast";

export default function VendorsPage() {
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorStatus | "">("");

  const { data, meta, isLoading, error, mutate } = useVendors({
    page,
    limit: 10,
    search: search || undefined,
    vendorStatus: statusFilter || undefined,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

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

  const handleToggleStatus = (item: Vendor) => {
    const isActivating = item.status === VendorStatus.INACTIVE;
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? "Activate Vendor" : "Deactivate Vendor",
      message: isActivating
        ? `Are you sure you want to activate ${item.name}?`
        : `Are you sure you want to deactivate ${item.name}? It cannot be deactivated if there are active purchase orders.`,
      action: async () => {
        try {
          if (isActivating) {
            await purchasingApi.activateVendor(item.id);
          } else {
            await purchasingApi.deactivateVendor(item.id);
          }
          toast.success(`Vendor ${item.name} ${isActivating ? 'activated' : 'deactivated'} successfully!`);
          mutate();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error(extractErrorMessage(err));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const columns = [
    {
      header: "Code",
      cell: (item: Vendor) => (
        <span className="font-medium text-slate-900">{item.vendorCode}</span>
      ),
    },
    {
      header: "Name",
      cell: (item: Vendor) => (
        <div>
          <div className="font-semibold text-slate-800">{item.name}</div>
          {item.contactPerson && <div className="text-sm text-slate-500">Contact: {item.contactPerson}</div>}
        </div>
      ),
    },
    {
      header: "Contact Info",
      cell: (item: Vendor) => (
        <div className="text-sm">
          {item.phone && <div>{item.phone}</div>}
          {item.email && <div className="text-slate-500">{item.email}</div>}
          {!item.phone && !item.email && <span className="text-slate-400">-</span>}
        </div>
      ),
    },
    {
      header: "Payment Term",
      cell: (item: Vendor) => (
        <span className="text-sm">
          {item.paymentTermDays === 0 ? "Cash (0 days)" : `${item.paymentTermDays} days`}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item: Vendor) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.status === VendorStatus.ACTIVE
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-100 text-slate-800"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (item: Vendor) => (
        <div className="flex items-center gap-2">
          {canMutate && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingVendor(item);
                  setIsFormOpen(true);
                }}
              >
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={
                  item.status === VendorStatus.ACTIVE
                    ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                }
                onClick={() => handleToggleStatus(item)}
              >
                {item.status === VendorStatus.ACTIVE ? "Deactivate" : "Activate"}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Vendors</h2>
          <p className="mt-1 text-sm text-slate-500">Manage supplier information and terms.</p>
        </div>
        {canMutate && (
          <Button
            onClick={() => {
              setEditingVendor(null);
              setIsFormOpen(true);
            }}
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Vendor
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{extractErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex-shrink-0 w-full md:w-48">
          <select
            className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as VendorStatus | "");
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value={VendorStatus.ACTIVE}>Active</option>
            <option value={VendorStatus.INACTIVE}>Inactive</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data || []}
        isLoading={isLoading}
        emptyMessage="No vendors found"
      />

      {/* Pagination */}
      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-slate-200 sm:px-6 rounded-b-xl shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page * meta.limit >= meta.total}
              variant="outline"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Showing <span className="font-medium">{(page - 1) * meta.limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * meta.limit, meta.total)}
                </span>{" "}
                of <span className="font-medium">{meta.total}</span> results
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Button
                  variant="outline"
                  className="rounded-l-md rounded-r-none"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="rounded-l-none rounded-r-md"
                  onClick={() => setPage(page + 1)}
                  disabled={page * meta.limit >= meta.total}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <VendorFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={editingVendor}
        onSuccess={() => {
          setIsFormOpen(false);
          mutate();
          toast.success(`Vendor successfully ${editingVendor ? 'updated' : 'created'}`);
        }}
      />

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
