import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSalesOrdersStore } from "../store/sales-orders-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/auth-store";

export function SalesOrdersFilterBar() {
  const { filters, setFilter, resetFilters } = useSalesOrdersStore();
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const debouncedSearch = useDebounce(localSearch, 500);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    setFilter("search", debouncedSearch);
  }, [debouncedSearch, setFilter]);

  const hasActiveFilters = 
    filters.search || 
    filters.status || 
    filters.salesChannel || 
    filters.orderType || 
    filters.dateFrom || 
    filters.dateTo ||
    filters.businessUnitId ||
    filters.warehouseId;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari Order Code atau Customer..."
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
              }}
              className="shrink-0 gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-200">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Status</label>
            <select
              value={filters.status || ""}
              onChange={(e) => setFilter("status", e.target.value || undefined)}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Semua Status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Sales Channel</label>
            <Input
              placeholder="Ketik Sales Channel..."
              value={filters.salesChannel || ""}
              onChange={(e) => setFilter("salesChannel", e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Order Type</label>
            <Input
              placeholder="Ketik Order Type..."
              value={filters.orderType || ""}
              onChange={(e) => setFilter("orderType", e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Tanggal Order Dari</label>
            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => setFilter("dateFrom", e.target.value || undefined)}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Tanggal Order Sampai</label>
            <Input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => setFilter("dateTo", e.target.value || undefined)}
            />
          </div>

          {user?.role === 'OWNER' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Business Unit ID</label>
              <Input
                placeholder="Business Unit ID..."
                value={filters.businessUnitId || ""}
                onChange={(e) => setFilter("businessUnitId", e.target.value || undefined)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
