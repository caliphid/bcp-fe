import { Search } from "lucide-react";
import { useAdCampaignStore } from "../store/ad-campaign-store";
import { useDebounce } from "../../../hooks/use-debounce";
import { useEffect, useState } from "react";
import { useBusinessUnits } from "../../business-units/hooks/use-business-units";
import { useAdPlatforms } from "../../ad-platforms/hooks/use-ad-platforms";
import { SearchableSelect } from "@/components/ui/searchable-select";

export function AdCampaignFilterBar() {
  const { params, setFilter } = useAdCampaignStore();
  const [searchTerm, setSearchTerm] = useState((params.search as string) || "");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const { data: businessUnits } = useBusinessUnits();
  const { data: platforms } = useAdPlatforms({ status: "ACTIVE" });

  useEffect(() => {
    setFilter("search", debouncedSearch);
  }, [debouncedSearch, setFilter]);

  return (
    <div className="flex flex-col flex-wrap sm:flex-row gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search campaigns..."
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
        <option value="">All Statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="ACTIVE">Active</option>
        <option value="PAUSED">Paused</option>
        <option value="COMPLETED">Completed</option>
        <option value="INACTIVE">Inactive</option>
      </SearchableSelect>

      <SearchableSelect
        value={(params.businessUnitId as string) || ""}
        onChange={(e) => setFilter("businessUnitId", e.target.value)}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">All Business Units</option>
        {businessUnits?.map((bu) => (
          <option key={bu.id} value={bu.id}>
            {bu.name}
          </option>
        ))}
      </SearchableSelect>

      <SearchableSelect
        value={(params.platformId as string) || ""}
        onChange={(e) => setFilter("platformId", e.target.value)}
        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">All Platforms</option>
        {platforms?.map((platform) => (
          <option key={platform.id} value={platform.id}>
            {platform.name}
          </option>
        ))}
      </SearchableSelect>
    </div>
  );
}
