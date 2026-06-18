"use client";

import { useAuthStore } from "../../../../../store/auth-store";
import { useImportBatches } from "../../../../../features/imports/hooks/use-import-batches";
import { useAccounts } from "../../../../../features/accounts/hooks/use-accounts";
import { CashflowImportBatchTable } from "../../../../../features/imports/components/cashflow-import-batch-table";
import { CashflowImportUploadCard } from "../../../../../features/imports/components/cashflow-import-upload-card";
import { Alert, AlertDescription } from "../../../../../components/ui/alert";
import { importsApi } from "../../../../../features/imports/api";
import { ImportBatchItem } from "../../../../../types/import";
import { useRouter } from "next/navigation";

export default function CashflowImportPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const { data, meta, loading, globalError, fetchData } = useImportBatches();
  const { data: accounts, businessUnits } = useAccounts(); // Accounts fetch hook naturally gets both

  // Role Access Check
  if (!user || user.role === "STAFF_INPUT") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-800">403 Forbidden</h2>
        <p className="text-slate-500 mt-2">You don't have permission to access the Import module.</p>
      </div>
    );
  }

  const handleExecute = async (batch: ImportBatchItem) => {
    if (!confirm(`Are you sure you want to execute import for ${batch.fileName}?`)) return;
    try {
      await importsApi.executeCashflow(batch.id, { skipDuplicates: true, importOnlyValidRows: true });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to execute import");
    }
  };

  const handleCancel = async (batch: ImportBatchItem) => {
    if (!confirm(`Are you sure you want to cancel the batch preview for ${batch.fileName}?`)) return;
    try {
      await importsApi.cancelBatch(batch.id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel batch");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Cashflow Excel Import
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload legacy cashflow files, review the parsed rows, and bulk import to your transactions.
          </p>
        </div>
      </div>

      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      {/* Upload Form Card */}
      <CashflowImportUploadCard 
        accounts={accounts} 
        businessUnits={businessUnits} 
      />

      <div className="pt-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Import History</h3>
        {/* Table */}
        <CashflowImportBatchTable
          data={data}
          meta={meta}
          loading={loading}
          canMutate={true}
          onExecute={handleExecute}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
