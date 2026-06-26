import { useState } from "react";
import { CustomerDuplicateCandidate, CustomerDuplicateStatus } from "../../../types/customer";
import { customerApi } from "../api";
import { extractErrorMessage } from "../../../lib/error";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { useTranslation } from "../../../hooks/use-translation";
import dayjs from "dayjs";
import { CheckCircle2, XCircle, Clock, GitMerge, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../../../store/auth-store";

interface DuplicateReviewCardProps {
  candidate: CustomerDuplicateCandidate;
  onReviewed: () => void;
}

function DuplicateReviewCard({ candidate, onReviewed }: DuplicateReviewCardProps) {
  const { t } = useTranslation();
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const isOwner = user?.role === "OWNER";

  const handleReview = async (status: CustomerDuplicateStatus) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await customerApi.reviewCustomerDuplicate(candidate.id, { status, reviewNotes });
      onReviewed();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatus = (status: CustomerDuplicateStatus) => {
    switch (status) {
      case CustomerDuplicateStatus.POSSIBLE_DUPLICATE: return <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-semibold"><Clock className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      case CustomerDuplicateStatus.CONFIRMED_DUPLICATE: return <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      case CustomerDuplicateStatus.NOT_DUPLICATE: return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold"><XCircle className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      case CustomerDuplicateStatus.MERGED: return <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-md text-xs font-semibold"><GitMerge className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      default: return null;
    }
  };

  const customerA = candidate.customerA;
  const customerB = candidate.customerB;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            Match Reason: <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs">{candidate.matchedBy.join(", ")}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Detected on {dayjs(candidate.createdAt).format("DD MMM YYYY HH:mm")}</div>
        </div>
        <div>
          {renderStatus(candidate.status)}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-px bg-slate-200 transform -translate-x-1/2"></div>
        <div className="hidden md:flex absolute left-1/2 top-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full items-center justify-center transform -translate-x-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs shadow-sm">VS</div>

        {/* Customer A */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Customer A</h4>
            <Link href={`/dashboard/customers/${customerA.id}`} target="_blank">
              <Button size="sm" variant="outline" className="h-7 text-xs">Lihat Detail</Button>
            </Link>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm">
            <div>
              <div className="text-xs text-slate-500">Nama & Kode</div>
              <div className="font-bold text-slate-900">{customerA.fullName}</div>
              <div className="text-slate-600">{customerA.customerCode}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Kontak</div>
              <div className="font-medium">{customerA.phone || "-"} / {customerA.email || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Tipe & Sumber</div>
              <div className="font-medium">{customerA.customerType} - {customerA.source}</div>
            </div>
          </div>
        </div>

        {/* Customer B */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-800">Customer B</h4>
            <Link href={`/dashboard/customers/${customerB.id}`} target="_blank">
              <Button size="sm" variant="outline" className="h-7 text-xs">Lihat Detail</Button>
            </Link>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-sm">
            <div>
              <div className="text-xs text-slate-500">Nama & Kode</div>
              <div className="font-bold text-slate-900">{customerB.fullName}</div>
              <div className="text-slate-600">{customerB.customerCode}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Kontak</div>
              <div className="font-medium">{customerB.phone || "-"} / {customerB.email || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Tipe & Sumber</div>
              <div className="font-medium">{customerB.customerType} - {customerB.source}</div>
            </div>
          </div>
        </div>
      </div>

      {candidate.status === CustomerDuplicateStatus.POSSIBLE_DUPLICATE && (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {error && <div className="text-red-500 text-xs mb-3">{error}</div>}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 w-full">
              <Input 
                placeholder="Catatan review (opsional)..." 
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto shrink-0">
              <Button 
                variant="outline" 
                className="w-full md:w-auto text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                onClick={() => handleReview(CustomerDuplicateStatus.NOT_DUPLICATE)}
                disabled={isSubmitting}
              >
                Bukan Duplikat
              </Button>
              <Button 
                variant="outline" 
                className="w-full md:w-auto text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                onClick={() => handleReview(CustomerDuplicateStatus.CONFIRMED_DUPLICATE)}
                disabled={isSubmitting}
              >
                Konfirmasi Duplikat
              </Button>
            </div>
          </div>
        </div>
      )}

      {candidate.status === CustomerDuplicateStatus.CONFIRMED_DUPLICATE && isOwner && (
        <div className="p-4 bg-rose-50 border-t border-rose-100 flex items-center justify-between">
          <div className="text-sm text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Telah dikonfirmasi sebagai duplikat. Silakan merge salah satu customer.
          </div>
          <Link href={`/dashboard/customers/${customerA.id}`}>
            <Button size="sm" variant="destructive">Proses Merge</Button>
          </Link>
        </div>
      )}
      
      {candidate.reviewedBy && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
          <span>Direview oleh {candidate.reviewedBy.name} pada {dayjs(candidate.reviewedAt).format("DD MMM YYYY HH:mm")}</span>
          {candidate.reviewNotes && <span>Catatan: {candidate.reviewNotes}</span>}
        </div>
      )}
    </div>
  );
}

interface DuplicateReviewListProps {
  candidates: CustomerDuplicateCandidate[];
  onReviewed: () => void;
}

export function DuplicateReviewList({ candidates, onReviewed }: DuplicateReviewListProps) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
        <p className="text-slate-500">Tidak ada kandidat duplikat ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {candidates.map(candidate => (
        <DuplicateReviewCard key={candidate.id} candidate={candidate} onReviewed={onReviewed} />
      ))}
    </div>
  );
}
