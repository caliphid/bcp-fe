"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { crewApi } from "../../../../features/crew/api";
import { Crew } from "../../../../types/crew";
import { PaginationMeta } from "../../../../types/common";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle, Pencil, Search } from "lucide-react";
import { Modal } from "../../../../components/ui/modal";
import { CrewForm } from "../../../../components/forms/crew-form";
import { DataTable } from "../../../../components/ui/data-table";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { ConfirmDialog } from "../../../../components/ui/confirm-dialog";
import { Input } from "../../../../components/ui/input";
import { extractErrorMessage } from "../../../../lib/error";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { SearchableSelect } from "@/components/ui/searchable-select";

export default function CrewPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<Crew[]>([]);
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
  const [editingItem, setEditingItem] = useState<Crew | null>(null);

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
      const res = await crewApi.getCrew({
        page,
        limit: 10,
        search,
        status: statusFilter || undefined,
      });
      setData(res.data);
      setMeta(res.meta);
      setGlobalError(null);
    } catch (err) {
      setGlobalError(t("pages.crew.fetchFailed"));
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

  const handleToggleStatus = (item: Crew) => {
    const isActivating = item.status === "INACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? t("pages.crew.activateCrew") : t("pages.crew.deactivateCrew"),
      message: isActivating
        ? t("pages.crew.confirmActivate").replace("{name}", item.name)
        : t("pages.crew.confirmDeactivate").replace("{name}", item.name),
      action: async () => {
        try {
          if (isActivating) {
            await crewApi.activateCrew(item.id);
          } else {
            await crewApi.deactivateCrew(item.id);
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

  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const columns = [
    { header: t("common.labels.name"), accessorKey: "name" as keyof Crew },
    { header: t("common.labels.position"), cell: (item: Crew) => item.position || "-" },
    { header: t("common.labels.phone"), cell: (item: Crew) => item.phone || "-" },
    {
      header: t("common.labels.joinedAt"),
      cell: (item: Crew) => item.joinedAt ? new Date(item.joinedAt).toLocaleDateString() : "-"
    },
    {
      header: t("common.labels.status"),
      cell: (item: Crew) => (
        <StatusBadge
          status={item.status}
          canToggle={canMutate}
          onToggle={() => handleToggleStatus(item)}
        />
      ),
    },
    {
      header: t("common.labels.actions"),
      className: "text-right",
      cell: (item: Crew) => (
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t("pages.crew.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("pages.crew.subtitle")}</p>
        </div>
        {canMutate && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> {t("pages.crew.addCrew")}
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
            placeholder={t("pages.crew.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <SearchableSelect
          className="flex h-11 w-48 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("common.labels.allStatus")}</option>
          <option value="ACTIVE">{t("common.status.active")}</option>
          <option value="INACTIVE">{t("common.status.inactive")}</option>
        </SearchableSelect>
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
        title={editingItem ? t("pages.crew.editCrew") : t("pages.crew.createCrew")}
        className="max-w-2xl"
      >
        <CrewForm
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
