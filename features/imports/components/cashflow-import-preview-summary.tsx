import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { ImportBatchItem } from "../../../types/import";
import { FileSpreadsheet, CheckCircle2, AlertCircle, SkipForward } from "lucide-react";

interface Props {
  batch: ImportBatchItem;
}

export function CashflowImportPreviewSummary({ batch }: Props) {
  const isCompleted = batch.status === "COMPLETED";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Preview Summary</CardTitle>
            <CardDescription>
              {batch.fileName} • {batch.activeYear}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100">
          <div className="p-6">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Total Rows</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{batch.totalRows}</p>
          </div>
          
          <div className="p-6 bg-emerald-50/30">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">{isCompleted ? "Imported" : "Valid"}</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{isCompleted ? batch.importedRows : batch.validRows}</p>
          </div>
          
          <div className="p-6 bg-red-50/30">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">{isCompleted ? "Failed" : "Invalid"}</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{isCompleted ? batch.failedRows : batch.invalidRows}</p>
          </div>

          <div className="p-6 bg-amber-50/30">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <SkipForward className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Skipped</span>
            </div>
            <p className="text-3xl font-bold text-amber-600">{batch.skippedRows}</p>
          </div>
        </div>

        {/* Optional: Render sheet summary if previewPayload exists and has sheets */}
        {batch.previewPayload?.sheets && Array.isArray(batch.previewPayload.sheets) && (
          <div className="border-t border-slate-100 p-6 bg-slate-50/50">
            <h4 className="text-sm font-semibold text-slate-900 mb-4">Sheet Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {batch.previewPayload.sheets.map((sheet: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <p className="text-sm font-medium text-slate-800 capitalize mb-2 truncate" title={sheet.sheetName}>
                    {sheet.sheetName}
                  </p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Rows: {sheet.totalRows}</span>
                    <div className="flex gap-2">
                      <span className="text-emerald-600 font-medium">{sheet.validRows}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-red-600 font-medium">{sheet.invalidRows}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
