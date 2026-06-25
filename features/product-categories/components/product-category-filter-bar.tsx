import { useProductCategoryStore } from "../store/product-category-store";
import { MasterStatus } from "../../../types/enums";
import { Input } from "../../../components/ui/input";
import { Search } from "lucide-react";

export function ProductCategoryFilterBar() {
  const { filters, setFilters } = useProductCategoryStore();

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search product categories..."
          className="pl-9 h-10 w-full bg-slate-50 border-slate-200 focus-visible:ring-primary-500"
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
      </div>
      <div className="w-full sm:w-48">
        <select
          className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value as MasterStatus | "" })}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
    </div>
  );
}
