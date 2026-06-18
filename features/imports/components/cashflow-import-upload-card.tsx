import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

import { UploadCloud, FileSpreadsheet, X, Loader2 } from "lucide-react";
import { Account } from "../../../types/account";
import { BusinessUnit } from "../../../types/business-unit";
import { importsApi } from "../api";
import { useRouter } from "next/navigation";

interface Props {
  accounts: Account[];
  businessUnits: BusinessUnit[];
}

export function CashflowImportUploadCard({ accounts, businessUnits }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [activeYear, setActiveYear] = useState<string>("");
  const [defaultAccountId, setDefaultAccountId] = useState<string>("");
  const [defaultBusinessUnitId, setDefaultBusinessUnitId] = useState<string>("");
  const [forcePreview, setForcePreview] = useState<boolean>(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !defaultAccountId) {
      setError("File and Default Account are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("defaultAccountId", defaultAccountId);
    if (activeYear) formData.append("activeYear", activeYear);
    if (defaultBusinessUnitId && defaultBusinessUnitId !== "none") {
      formData.append("defaultBusinessUnitId", defaultBusinessUnitId);
    }
    if (forcePreview) formData.append("forcePreview", "true");

    try {
      const res = await importsApi.previewCashflow(formData);
      router.push(`/dashboard/imports/cashflow/${res.data.batchId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(", "));
      } else {
        setError(msg || "An unexpected error occurred during upload.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader className="bg-indigo-50/50 pb-4">
        <CardTitle className="text-lg text-indigo-900">Upload Cashflow Excel</CardTitle>
        <CardDescription>Upload legacy cashflow format (.xlsx or .xls) to generate a preview before importing.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm ring-1 ring-inset ring-red-600/20">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Excel File <span className="text-red-500">*</span></Label>
                {!file ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-colors"
                  >
                    <UploadCloud className="h-8 w-8 text-indigo-400 mb-2" />
                    <p className="text-sm font-medium">Click to select file</p>
                    <p className="text-xs text-slate-400 mt-1">.xlsx or .xls (Max 10MB)</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-indigo-100 p-2 rounded text-indigo-600">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} className="text-slate-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileChange} 
                />
              </div>

              {/* Expected Format Box */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mt-4">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Expected Columns</h4>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-600">
                  <span className="bg-white px-2 py-1 rounded border border-slate-200">tgl</span>
                  <span className="bg-white px-2 py-1 rounded border border-slate-200">keterangan</span>
                  <span className="bg-white px-2 py-1 rounded border border-slate-200">in</span>
                  <span className="bg-white px-2 py-1 rounded border border-slate-200">out</span>
                  <span className="bg-white px-2 py-1 rounded border border-slate-200">saldo</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Format ini disesuaikan dengan template laporan cashflow lama. Pastikan nama sheet adalah nama bulan (contoh: "januari").
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="forcePreview"
                  checked={forcePreview}
                  onChange={(e) => setForcePreview(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                />
                <Label htmlFor="forcePreview" className="text-sm font-normal text-slate-600">
                  Force preview (ignore duplicate file warnings)
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Account <span className="text-red-500">*</span></Label>
                <select
                  value={defaultAccountId}
                  onChange={(e) => setDefaultAccountId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="" disabled>Select account...</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Fallback account if sheet name doesn't match any account.</p>
              </div>

              <div className="space-y-2">
                <Label>Default Business Unit (Optional)</Label>
                <select
                  value={defaultBusinessUnitId}
                  onChange={(e) => setDefaultBusinessUnitId(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="none">None</option>
                  {businessUnits.map((bu) => (
                    <option key={bu.id} value={bu.id}>
                      {bu.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Active Year (Optional)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 2026" 
                  value={activeYear} 
                  onChange={(e) => setActiveYear(e.target.value)} 
                />
                <p className="text-xs text-slate-500">Explicitly set the year if the file relies on implicit years.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" disabled={!file || !defaultAccountId || loading} className="min-w-[120px]">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Generate Preview"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
