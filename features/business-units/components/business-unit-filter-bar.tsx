import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useBusinessUnitStore } from "../store/business-unit-store";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function BusinessUnitFilterBar() {
  const { filters, setFilter } = useBusinessUnitStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("page", 1);
    setFilter("search", filters.searchInput);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <form onSubmit={handleSearch} className="flex-1 max-w-sm flex gap-2">
        <Input
          placeholder="Search..."
          value={filters.searchInput}
          onChange={(e) => setFilter("searchInput", e.target.value)}
        />
        <Button type="submit" variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>
      <SearchableSelect
        className="flex h-11 w-48 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        value={filters.status}
        onChange={(e) => {
          setFilter("status", e.target.value);
          setFilter("page", 1);
        }}
      >
        <option value="">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </SearchableSelect>
    </div>
  );
}
