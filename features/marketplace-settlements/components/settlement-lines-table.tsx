import { MarketplaceSettlementLine, MarketplaceSettlementLineStatus, MarketplaceSettlementWarningCode, MarketplaceCustomerLinkStatus } from "../../../types/marketplace";
import { CheckCircle2, AlertCircle, ShieldAlert, Link as LinkIcon, Unlink, Activity, FileWarning, SearchX } from "lucide-react";
import { useState } from "react";
import { ManualMatchModal } from "./manual-match-modal";
import { useTranslation } from "../../../hooks/use-translation";

interface SettlementLinesTableProps {
  lines?: MarketplaceSettlementLine[];
  canEdit: boolean;
  status: string;
  onMutate: () => void;
}

export function SettlementLinesTable({ lines, canEdit, status, onMutate }: SettlementLinesTableProps) {
  const { t } = useTranslation();
  const [matchLineId, setMatchLineId] = useState<string | null>(null);

  if (!lines || lines.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-500">
        No lines added to this settlement yet.
      </div>
    );
  }

  const formatMoney = (val?: number) => {
    if (!val) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const renderStatus = (s: MarketplaceSettlementLineStatus) => {
    switch (s) {
      case 'MATCHED': return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold"><CheckCircle2 className="w-3 h-3"/> MATCHED</span>;
      case 'PARTIALLY_MATCHED': return <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold"><Activity className="w-3 h-3"/> PARTIAL</span>;
      case 'UNMATCHED': return <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold"><SearchX className="w-3 h-3"/> UNMATCHED</span>;
      case 'IGNORED': return <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-bold">IGNORED</span>;
      case 'ERROR': return <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px] font-bold"><ShieldAlert className="w-3 h-3"/> ERROR</span>;
      default: return <span>{s}</span>;
    }
  };

  const renderLinkStatus = (s: MarketplaceCustomerLinkStatus) => {
    switch (s) {
      case 'LINKED': return <span className="text-emerald-500" title="Linked to Customer"><LinkIcon className="w-4 h-4"/></span>;
      case 'UNLINKED': return <span className="text-slate-400" title="Unlinked"><Unlink className="w-4 h-4"/></span>;
      case 'NOT_APPLICABLE': return <span className="text-slate-300" title="N/A">-</span>;
      default: return <span className="text-amber-500" title={s}><AlertCircle className="w-4 h-4"/></span>;
    }
  };

  const renderWarnings = (warnings: MarketplaceSettlementWarningCode[]) => {
    if (!warnings || warnings.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {warnings.map(w => (
          <span key={w} className="inline-flex items-center text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-[9px] font-semibold border border-red-100 uppercase" title={w}>
            <FileWarning className="w-2.5 h-2.5 mr-1"/> {w.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                <th className="px-4 py-3">Order / Trans Ref</th>
                <th className="px-4 py-3">Type & Dir</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Match</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                  <td className="px-4 py-3 text-center text-xs text-slate-400">{line.lineNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700">{line.externalOrderId || '-'}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{line.externalTransactionId || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-slate-600">{line.lineType}</div>
                    <div className={`text-[10px] font-bold ${line.direction === 'INCREASE' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {line.direction}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="text-xs text-slate-700 truncate" title={line.description}>{line.description || '-'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate" title={line.notes}>{line.notes || ''}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-700">
                    {formatMoney(line.amount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">{renderLinkStatus(line.customerLinkStatus)}</div>
                  </td>
                  <td className="px-4 py-3">
                    {renderStatus(line.status)}
                    {renderWarnings(line.warningCodes)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {canEdit && status === 'NEEDS_REVIEW' && ['UNMATCHED', 'PARTIALLY_MATCHED', 'ERROR'].includes(line.status) && (
                      <button
                        onClick={() => setMatchLineId(line.id)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 px-2 py-1 rounded"
                      >
                        Manual Match
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ManualMatchModal 
        isOpen={!!matchLineId} 
        onClose={() => setMatchLineId(null)} 
        lineId={matchLineId} 
        onSuccess={onMutate} 
      />
    </>
  );
}
