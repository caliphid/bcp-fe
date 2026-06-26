import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCustomersStore } from "../store/customers-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuthStore } from "@/store/auth-store";
import { useTranslation } from "@/hooks/use-translation";

export function CustomersFilterBar() {
  const { filters, setFilter, resetFilters } = useCustomersStore();
  const [localSearch, setLocalSearch] = useState(filters.search || "");
  const debouncedSearch = useDebounce(localSearch, 500);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const user = useAuthStore(s => s.user);
  const { t } = useTranslation();

  useEffect(() => {
    setFilter("search", debouncedSearch);
  }, [debouncedSearch, setFilter]);

  const hasActiveFilters = 
    filters.search || 
    filters.status || 
    filters.customerType || 
    filters.source ||
    filters.businessUnitId;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={user?.role === 'STAFF_INPUT' ? "Cari Nama atau Kode..." : "Cari Nama, Kode, Phone, Email..."}
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
            <span className="hidden sm:inline">{t('common.actions.filter')}</span>
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
              <span className="hidden sm:inline">{t('common.actions.reset')}</span>
            </Button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 fade-in duration-200">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('common.labels.status')}</label>
            <select
              value={filters.status || ""}
              onChange={(e) => setFilter("status", e.target.value || undefined)}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{t('common.labels.allStatus')}</option>
              <option value="ACTIVE">{t('common.status.ACTIVE')}</option>
              <option value="INACTIVE">{t('common.status.INACTIVE')}</option>
              <option value="BLOCKED">{t('common.status.BLOCKED')}</option>
              <option value="MERGED">{t('common.status.MERGED')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('common.labels.customerType')}</label>
            <select
              value={filters.customerType || ""}
              onChange={(e) => setFilter("customerType", e.target.value || undefined)}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Semua Tipe</option>
              <option value="RETAIL">{t('common.labels.RETAIL')}</option>
              <option value="RESELLER">{t('common.labels.RESELLER')}</option>
              <option value="WHOLESALE">{t('common.labels.WHOLESALE')}</option>
              <option value="CORPORATE">{t('common.labels.CORPORATE')}</option>
              <option value="MARKETPLACE">{t('common.labels.MARKETPLACE')}</option>
              <option value="OTHER">{t('common.labels.OTHER')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('common.labels.customerSource')}</label>
            <select
              value={filters.source || ""}
              onChange={(e) => setFilter("source", e.target.value || undefined)}
              className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Semua Sumber</option>
              <option value="SHOPEE">{t('common.labels.SHOPEE')}</option>
              <option value="TOKOPEDIA">{t('common.labels.TOKOPEDIA')}</option>
              <option value="TIKTOK_SHOP">{t('common.labels.TIKTOK_SHOP')}</option>
              <option value="LAZADA">{t('common.labels.LAZADA')}</option>
              <option value="WHATSAPP">{t('common.labels.WHATSAPP')}</option>
              <option value="RESELLER">{t('common.labels.RESELLER')}</option>
              <option value="OFFLINE">{t('common.labels.OFFLINE')}</option>
              <option value="IMPORT">{t('common.labels.IMPORT')}</option>
              <option value="MANUAL">{t('common.labels.MANUAL')}</option>
              <option value="OTHER">{t('common.labels.OTHER')}</option>
            </select>
          </div>

          {(user?.role === 'OWNER' || user?.role === 'ADMIN_FINANCE') && (
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('common.labels.businessUnit')}</label>
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
