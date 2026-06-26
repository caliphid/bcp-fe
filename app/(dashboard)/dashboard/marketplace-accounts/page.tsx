"use client";

import { useState } from "react";
import { useAuthStore } from "../../../../store/auth-store";
import { Button } from "../../../../components/ui/button";
import { PlusCircle } from "lucide-react";
import { ConfirmDialog } from "../../../../components/ui/confirm-dialog";
import { extractErrorMessage } from "../../../../lib/error";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import { useMarketplaceAccounts } from "../../../../features/marketplace-accounts/hooks/use-marketplace-accounts";
import { MarketplaceAccountsTable } from "../../../../features/marketplace-accounts/components/marketplace-accounts-table";
import { MarketplaceAccount } from "../../../../types/marketplace";
import { marketplaceAccountApi } from "../../../../features/marketplace-accounts/api";
import { useRouter } from "next/navigation";
import { Input } from "../../../../components/ui/input";
import { useTranslation } from "../../../../hooks/use-translation";

export default function MarketplaceAccountsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const canMutate = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { data, meta, isLoading, mutate } = useMarketplaceAccounts({
    page,
    limit: 10,
    search,
  });

  const { t } = useTranslation();

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

  const handleToggleStatus = (item: MarketplaceAccount) => {
    const isActivating = item.status === "INACTIVE";
    setConfirmDialog({
      isOpen: true,
      title: isActivating ? "Activate Account" : "Deactivate Account",
      message: isActivating
        ? `Are you sure you want to activate ${item.name}?`
        : `Are you sure you want to deactivate ${item.name}?`,
      action: async () => {
        try {
          if (isActivating) {
            await marketplaceAccountApi.activateMarketplaceAccount(item.id);
          } else {
            await marketplaceAccountApi.deactivateMarketplaceAccount(item.id);
          }
          mutate();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          setGlobalError(extractErrorMessage(err));
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('marketplace.account.title')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('marketplace.account.subtitle')}</p>
        </div>
        {canMutate && (
          <Button
            className="w-full sm:w-auto shadow-primary-500/30 shadow-md"
            onClick={() => router.push("/dashboard/marketplace-accounts/create")}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> {t('marketplace.account.createTitle')}
          </Button>
        )}
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <Input
          placeholder={t('marketplace.account.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <MarketplaceAccountsTable
        data={data}
        meta={meta}
        loading={isLoading}
        onPageChange={setPage}
        onToggleStatus={handleToggleStatus}
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
