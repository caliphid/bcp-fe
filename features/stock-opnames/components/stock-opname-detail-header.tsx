import { StockOpnameSession, StockOpnameSessionStatus, StockOpnameCountMode } from "../../../types/stock-opname";
import { formatDate } from "../../../lib/utils";
import { Clock, CheckCircle2, Loader2, Ban, AlertCircle, FileText, Check, FileMinus, FilePlus } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface StockOpnameDetailHeaderProps {
  session: StockOpnameSession;
}

export function StockOpnameDetailHeader({ session }: StockOpnameDetailHeaderProps) {
  const { t } = useTranslation();

  const renderStatus = (status: StockOpnameSessionStatus) => {
    switch (status) {
      case StockOpnameSessionStatus.COUNTING:
        return <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-100 px-3 py-1.5 rounded-md text-sm font-bold"><Clock className="w-4 h-4"/> COUNTING</span>;
      case StockOpnameSessionStatus.REVIEW_PENDING:
        return <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-100 px-3 py-1.5 rounded-md text-sm font-bold"><Loader2 className="w-4 h-4"/> REVIEW PENDING</span>;
      case StockOpnameSessionStatus.APPROVED:
        return <span className="inline-flex items-center gap-1.5 text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded-md text-sm font-bold"><CheckCircle2 className="w-4 h-4"/> APPROVED</span>;
      case StockOpnameSessionStatus.POSTED:
        return <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-md text-sm font-bold"><CheckCircle2 className="w-4 h-4"/> POSTED</span>;
      case StockOpnameSessionStatus.CANCELLED:
      case StockOpnameSessionStatus.VOIDED:
        return <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-100 px-3 py-1.5 rounded-md text-sm font-bold"><Ban className="w-4 h-4"/> {status}</span>;
      default:
        return <span className="text-sm font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {session.isSnapshotStale && session.status !== StockOpnameSessionStatus.POSTED && session.status !== StockOpnameSessionStatus.VOIDED && session.status !== StockOpnameSessionStatus.CANCELLED && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-sm">{t("features.stockOpnames.detail.staleSnapshotTitle")}</h4>
            <p className="text-xs mt-1">
              {t("features.stockOpnames.detail.staleSnapshotDesc")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">{t("features.stockOpnames.detail.sessionInfo")}</h3>
          
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-slate-500">{t("features.stockOpnames.detail.sessionCode")}</span>
            <span className="font-bold text-slate-900">{session.sessionCode}</span>

            <span className="text-slate-500">Name</span>
            <span className="font-medium text-slate-800">{session.name}</span>

            <span className="text-slate-500">{t("features.stockOpnames.detail.warehouse")}</span>
            <span className="font-medium text-slate-800">{session.warehouse?.name || session.warehouseId}</span>

            <span className="text-slate-500">{t("features.stockOpnames.detail.sessionDate")}</span>
            <span className="font-medium text-slate-800">{formatDate(session.sessionDate)}</span>

            <span className="text-slate-500">Status</span>
            <div className="flex">
              {renderStatus(session.status)}
            </div>

            <span className="text-slate-500">Scope Type</span>
            <span className="font-medium text-slate-800">{session.scopeType}</span>

            <span className="text-slate-500">Count Mode</span>
            <span className="font-medium text-slate-800">{session.countMode === StockOpnameCountMode.BLIND ? 'BLIND (Hidden Target)' : 'NON-BLIND'}</span>
            
            <span className="text-slate-500">Description</span>
            <span className="font-medium text-slate-800">{session.description || "-"}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Progress & Summary</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center items-center">
              <span className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wider">Count Progress</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800">{session.countedItems}</span>
                <span className="text-sm font-medium text-slate-400">/ {session.totalItems}</span>
              </div>
            </div>

            <div className={`rounded-xl p-4 border flex flex-col justify-center items-center ${session.varianceItems > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <span className={`text-xs font-semibold mb-1 uppercase tracking-wider ${session.varianceItems > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Variances</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${session.varianceItems > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>{session.varianceItems}</span>
                <span className={`text-sm font-medium ${session.varianceItems > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>items</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 text-sm mt-4 pt-4 border-t border-slate-100">
            <span className="text-slate-500">Created At</span>
            <span className="font-medium text-slate-800">{formatDate(session.createdAt)}</span>
            
            <span className="text-slate-500">Reviewer</span>
            <span className="font-medium text-slate-800">{session.reviewer?.name || "-"}</span>
            
            <span className="text-slate-500">Approver</span>
            <span className="font-medium text-slate-800">{session.approver?.name || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
