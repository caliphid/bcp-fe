"use client";
import { extractErrorMessage } from "@/lib/error";
import { toast } from "react-hot-toast";

import { use, useState } from "react";
import { useAuthStore } from "../../../../../../store/auth-store";
import { useImportBatchDetail } from "../../../../../../features/imports/hooks/use-import-batch-detail";
import { useImportRows } from "../../../../../../features/imports/hooks/use-import-rows";
import { CashflowImportPreviewSummary } from "../../../../../../features/imports/components/cashflow-import-preview-summary";
import { CashflowImportRowsTable } from "../../../../../../features/imports/components/cashflow-import-rows-table";
import { Alert, AlertDescription } from "../../../../../../components/ui/alert";
import { Button } from "../../../../../../components/ui/button";
import { ImportStatusBadge } from "../../../../../../features/imports/components/import-status-badge";
import { importsApi } from "../../../../../../features/imports/api";
import { ArrowLeft, PlayCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CashflowImportDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const user = useAuthStore((state) => state.user);

  const { data: batch, loading: batchLoading, error: batchError, fetchDetail } = useImportBatchDetail(id);
  const { data: rows, meta: rowsMeta, loading: rowsLoading, error: rowsError, fetchRows } = useImportRows(id);

  const [executing, setExecuting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Role Access Check
  if (!user || user.role === "STAFF_INPUT") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-800">403 Forbidden</h2>
      </div>
    );
  }

  const handleExecute = async () => {
    if (!batch) return;
    if (!confirm(`Execute import for ${batch.fileName}? This will insert ${batch.validRows} valid rows into transactions.`)) return;
    setExecuting(true);
    try {
      await importsApi.executeCashflow(batch.id, { skipDuplicates: true, importOnlyValidRows: true });
      fetchDetail();
      fetchRows();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to execute import"));
    } finally {
      setExecuting(false);
    }
  };

  const handleCancel = async () => {
    if (!batch) return;
    if (!confirm(`Cancel the batch preview for ${batch.fileName}?`)) return;
    setCancelling(true);
    try {
      await importsApi.cancelBatch(batch.id);
      fetchDetail();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to cancel batch"));
    } finally {
      setCancelling(false);
    }
  };

  if (batchLoading) return <div className="animate-pulse h-64 w-full rounded-2xl bg-slate-100"></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/dashboard/imports/cashflow" 
          className="p-2 -ml-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            Batch Detail
            {batch && <ImportStatusBadge status={batch.status} />}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {batch?.fileName}
          </p>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          {batch && (batch.status === "PREVIEWED" || batch.status === "PARTIAL_FAILED") && (
            <>
              {batch.status === "PREVIEWED" && (
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleCancel} disabled={cancelling || executing}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel Batch
                </Button>
              )}
              <Button onClick={handleExecute} disabled={executing || cancelling} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 shadow-md">
                <PlayCircle className="mr-2 h-4 w-4" /> 
                {executing ? "Executing..." : "Execute Import"}
              </Button>
            </>
          )}
        </div>
      </div>

      {(batchError || rowsError) && (
        <Alert variant="destructive">
          <AlertDescription>{batchError || rowsError}</AlertDescription>
        </Alert>
      )}

      {batch && (
        <CashflowImportPreviewSummary batch={batch} />
      )}

      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Parsed Rows</h3>
        <CashflowImportRowsTable
          data={rows}
          meta={rowsMeta}
          loading={rowsLoading}
        />
      </div>
    </div>
  );
}
