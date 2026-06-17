import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { PaginationMeta } from "../../types/common";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 py-3 border-t border-slate-100">
      <div className="flex items-center text-sm text-slate-500">
        Showing <span className="font-medium text-slate-900 mx-1">{((meta.page - 1) * meta.limit) + 1}</span> 
        to <span className="font-medium text-slate-900 mx-1">{Math.min(meta.page * meta.limit, meta.total)}</span> 
        of <span className="font-medium text-slate-900 mx-1">{meta.total}</span> entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page <= 1}
          className="h-8 px-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-slate-600 px-2">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
          className="h-8 px-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
