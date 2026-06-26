import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StockOpnameSession, StockOpnameSessionStatus, StockOpnameCountMode, StockOpnameScopeType } from "../../../types/stock-opname";
import { formatDate } from "../../../lib/utils";
import Link from "next/link";
import { Clock, CheckCircle2, Loader2, Ban, Eye, FileText, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

interface StockOpnamesTableProps {
  sessions: StockOpnameSession[];
  isLoading?: boolean;
}

export function StockOpnamesTable({ sessions, isLoading }: StockOpnamesTableProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="p-10 text-center animate-pulse text-slate-500">Loading stock opname sessions...</div>;
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{t("features.stockOpnames.table.noData")}</h3>
        <p className="text-slate-500"></p>
      </div>
    );
  }

  const renderStatus = (status: StockOpnameSessionStatus) => {
    switch (status) {
      case StockOpnameSessionStatus.COUNTING:
        return <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs font-semibold"><Clock className="w-3 h-3"/> COUNTING</span>;
      case StockOpnameSessionStatus.REVIEW_PENDING:
        return <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-semibold"><Loader2 className="w-3 h-3"/> REVIEW PENDING</span>;
      case StockOpnameSessionStatus.APPROVED:
        return <span className="inline-flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> APPROVED</span>;
      case StockOpnameSessionStatus.POSTED:
        return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> POSTED</span>;
      case StockOpnameSessionStatus.CANCELLED:
      case StockOpnameSessionStatus.VOIDED:
        return <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs font-semibold"><Ban className="w-3 h-3"/> {status}</span>;
      default:
        return <span className="text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-600 whitespace-nowrap">{t("features.stockOpnames.table.colSession")}</TableHead>
              <TableHead className="font-semibold text-slate-600 whitespace-nowrap">{t("features.stockOpnames.table.colWarehouse")}</TableHead>
              <TableHead className="font-semibold text-slate-600 whitespace-nowrap">{t("features.stockOpnames.table.colDate")}</TableHead>
              <TableHead className="font-semibold text-slate-600 whitespace-nowrap">{t("features.stockOpnames.table.colScopeMode")}</TableHead>
              <TableHead className="font-semibold text-slate-600 whitespace-nowrap text-center">{t("features.stockOpnames.table.colProgress")}</TableHead>
              <TableHead className="font-semibold text-slate-600 whitespace-nowrap">{t("features.stockOpnames.table.colStatus")}</TableHead>
              <TableHead className="font-semibold text-slate-600 whitespace-nowrap text-right">{t("features.stockOpnames.table.colActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id} className="hover:bg-slate-50/50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{session.sessionCode}</span>
                    <span className="text-sm text-slate-500 line-clamp-1">{session.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-slate-700">
                    {session.warehouse?.name || t("features.stockOpnames.filter.warehousePlaceholder")}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-700">{formatDate(session.sessionDate)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className={`px-1.5 py-0.5 rounded-sm font-medium w-fit ${session.scopeType === StockOpnameScopeType.FULL ? 'bg-indigo-100 text-indigo-700' : 'bg-fuchsia-100 text-fuchsia-700'}`}>
                      {session.scopeType}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-sm font-medium w-fit ${session.countMode === StockOpnameCountMode.BLIND ? 'bg-slate-200 text-slate-700' : 'bg-sky-100 text-sky-700'}`}>
                      {session.countMode}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <span>{session.countedItems}</span>
                      <span className="text-slate-400">/</span>
                      <span>{session.totalItems}</span>
                    </div>
                    {session.varianceItems > 0 && (
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 rounded mt-0.5 flex items-center gap-0.5">
                        <AlertCircle className="w-3 h-3" /> {session.varianceItems} {t("features.stockOpnames.table.variances")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {renderStatus(session.status)}
                </TableCell>
                <TableCell className="text-right">
                  <Link 
                    href={`/dashboard/stock-opnames/${session.id}`}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
