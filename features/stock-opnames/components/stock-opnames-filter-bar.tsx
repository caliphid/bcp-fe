import { Search, SlidersHorizontal, X } from "lucide-react";
import { useStockOpnamesStore } from "../store/stock-opnames-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { StockOpnameSessionStatus, StockOpnameCountMode } from "../../../types/stock-opname";
import { useTranslation } from "@/hooks/use-translation";

export function StockOpnamesFilterBar() {
  const { t } = useTranslation();
  const { filters, setFilter, resetFilters } = useStockOpnamesStore();
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const debouncedSearch = useDebounce(localSearch, 500);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setFilter("search", debouncedSearch);
  }, [debouncedSearch, setFilter]);

  const hasActiveFilters = 
    filters.search || 
    filters.status || 
    filters.countMode || 
    filters.dateFrom || 
    filters.dateTo ||
    filters.warehouseId;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("features.stockOpnames.filter.searchPlaceholder")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={showAdvanced ? "default" : "outline"}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="shrink-0 gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>

          {hasActiveFilters && (
            <Button 
              variant="outline"
              onClick={() => {
                resetFilters();
                setLocalSearch("");
                setShowAdvanced(false);
              }}
              className="shrink-0 gap-2 text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Status</label>
            <select
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.status || ""}
              onChange={(e) => setFilter("status", e.target.value || undefined)}
            >
              <option value="">All Status</option>
              {Object.values(StockOpnameSessionStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Count Mode</label>
            <select
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.countMode || ""}
              onChange={(e) => setFilter("countMode", e.target.value || undefined)}
            >
              <option value="">All Modes</option>
              <option value={StockOpnameCountMode.BLIND}>Blind Count</option>
              <option value={StockOpnameCountMode.NON_BLIND}>Non-Blind Count</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Date From</label>
            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => setFilter("dateFrom", e.target.value || undefined)}
              className="h-9 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Date To</label>
            <Input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => setFilter("dateTo", e.target.value || undefined)}
              className="h-9 bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
