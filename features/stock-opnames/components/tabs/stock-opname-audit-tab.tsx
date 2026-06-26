import { StockOpnameSession } from "../../../../types/stock-opname";
import { formatDate } from "../../../../lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, User } from "lucide-react";

interface StockOpnameAuditTabProps {
  session: StockOpnameSession;
  auditLogs?: any[];
}

export function StockOpnameAuditTab({ session, auditLogs = [] }: StockOpnameAuditTabProps) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-600 mb-1">No activity recorded yet</h3>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[180px] font-semibold text-slate-600">Time</TableHead>
            <TableHead className="font-semibold text-slate-600">Action</TableHead>
            <TableHead className="font-semibold text-slate-600">Actor</TableHead>
            <TableHead className="font-semibold text-slate-600">Notes / Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm text-slate-500 font-medium">
                {formatDate(log.createdAt)}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                  {log.action}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-50 p-1 rounded-full">
                    <User className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{log.actor?.name || "System"}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-slate-600">{log.notes || "-"}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
