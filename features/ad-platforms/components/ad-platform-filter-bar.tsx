import { Search } from "lucide-react";
import { useAdPlatformStore } from "../store/ad-platform-store";
import { useDebounce } from "../../../hooks/use-debounce";
import { useEffect, useState } from "react";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function AdPlatformFilterBar() {
  const { params, setFilter } = useAdPlatformStore();
  const [searchTerm, setSearchTerm] = useState((params.search as string) || "");
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    setFilter("search", debouncedSearch);
  }, [debouncedSearch, setFilter]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search platforms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <SearchableSelect
        value={(params.status as string) || ""}
        onChange={(e) => setFilter("status", e.target.value)}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </SearchableSelect>
    </div>
  );
}
