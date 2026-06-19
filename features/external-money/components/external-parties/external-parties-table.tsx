import React, { useState } from "react";
import { DataTable } from "../../../../components/ui/data-table";
import { StatusBadge } from "../../../../components/ui/status-badge";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { ExternalParty } from "@/types/receivable";
import { useExternalPartyStore } from "../../store/external-party-store";
import { Search, Plus, Edit } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface ExternalPartiesTableProps {
  data: ExternalParty[];
  meta?: any;
  loading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (party: ExternalParty) => void;
  onToggleStatus: (party: ExternalParty) => void;
  onAdd: () => void;
}

export function ExternalPartiesTable({
  data,
  meta,
  loading,
  onPageChange,
  onEdit,
  onToggleStatus,
  onAdd,
}: ExternalPartiesTableProps) {
  const { user } = useAuthStore();
  const isReadonly = user?.role === "STAFF_INPUT";
  const { filters, setFilter } = useExternalPartyStore();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter("search", e.target.value);
  };

  const columns = [
    {
      header: "Kode",
      accessorKey: "partyCode" as keyof ExternalParty,
      className: "font-medium text-slate-900",
    },
    {
      header: "Nama",
      accessorKey: "name" as keyof ExternalParty,
    },
    {
      header: "Tipe",
      accessorKey: "type" as keyof ExternalParty,
    },
    {
      header: "Kontak",
      cell: (item: ExternalParty) => (
        <div>
          {item.phone && <div className="text-sm">{item.phone}</div>}
          {item.email && <div className="text-xs text-slate-500">{item.email}</div>}
        </div>
      ),
    },
    {
      header: "Perusahaan",
      accessorKey: "companyName" as keyof ExternalParty,
    },
    {
      header: "Status",
      cell: (item: ExternalParty) => (
        <StatusBadge
          status={item.status}
          canToggle={!isReadonly}
          onToggle={() => onToggleStatus(item)}
        />
      ),
    },
    {
      header: "Aksi",
      cell: (item: ExternalParty) => (
        !isReadonly ? (
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4 text-slate-500" />
          </Button>
        ) : null
      ),
    },
  ];

  const headerActions = (
    <div className="flex items-center gap-3">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari pihak eksternal..."
          className="pl-9 h-9 text-sm"
          value={filters.search || ""}
          onChange={handleSearch}
        />
      </div>
      <SearchableSelect
        value={filters.type || ""}
        onChange={(e) => setFilter("type", e.target.value)}
        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Types</option>
        <option value="CUSTOMER">CUSTOMER</option>
        <option value="VENDOR">VENDOR</option>
        <option value="PARTNER">PARTNER</option>
        <option value="EMPLOYEE">EMPLOYEE</option>
        <option value="INDIVIDUAL">INDIVIDUAL</option>
        <option value="COMPANY">COMPANY</option>
        <option value="OTHER">OTHER</option>
      </SearchableSelect>
      <SearchableSelect
        value={filters.status || ""}
        onChange={(e) => setFilter("status", e.target.value)}
        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Status</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
      </SearchableSelect>
      {!isReadonly && (
        <Button onClick={onAdd} size="sm" className="h-9">
          <Plus className="mr-2 h-4 w-4" /> Add Party
        </Button>
      )}
    </div>
  );

  return (
    <DataTable
      title="Pihak Eksternal"
      description="Kelola pelanggan, vendor, dan pihak lain untuk pencatatan uang eksternal."
      data={data}
      columns={columns}
      meta={meta}
      onPageChange={onPageChange}
      isLoading={loading}
      headerActions={headerActions}
    />
  );
}
