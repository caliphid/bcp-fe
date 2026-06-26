import { Search } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useAccountStore } from "../store/account-store";
import { BusinessUnit } from "../../../types/business-unit";
import { AccountType } from "../../../types/enums";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useTranslation } from "../../../hooks/use-translation";

interface FilterBarProps {
  businessUnits: BusinessUnit[];
}

export function AccountFilterBar({ businessUnits }: FilterBarProps) {
  const { t } = useTranslation();
  const { filters, setFilter } = useAccountStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter("page", 1);
    setFilter("search", filters.searchInput);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder={t("features.accounts.filterBar.searchPh")}
          value={filters.searchInput}
          onChange={(e) => setFilter("searchInput", e.target.value)}
        />
        <Button type="submit" variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>
      <SearchableSelect
        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        value={filters.status}
        onChange={(e) => {
          setFilter("status", e.target.value);
          setFilter("page", 1);
        }}
      >
        <option value="">{t("features.accounts.filterBar.allStatus")}</option>
        <option value="ACTIVE">{t("features.accounts.filterBar.statusActive")}</option>
        <option value="INACTIVE">{t("features.accounts.filterBar.statusInactive")}</option>
      </SearchableSelect>
      <SearchableSelect
        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        value={filters.type}
        onChange={(e) => {
          setFilter("type", e.target.value);
          setFilter("page", 1);
        }}
      >
        <option value="">{t("features.accounts.filterBar.allTypes")}</option>
        {Object.values(AccountType).map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </SearchableSelect>
      <SearchableSelect
        className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        value={filters.businessUnitId}
        onChange={(e) => {
          setFilter("businessUnitId", e.target.value);
          setFilter("page", 1);
        }}
      >
        <option value="">{t("features.accounts.filterBar.allBusinessUnits")}</option>
        {businessUnits.map((bu) => (
          <option key={bu.id} value={bu.id}>{bu.name}</option>
        ))}
      </SearchableSelect>
    </div>
  );
}
