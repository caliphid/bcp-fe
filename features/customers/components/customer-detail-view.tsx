import { Customer, CustomerStatus } from "../../../types/customer";
import { formatMoney, formatDate } from "../../../lib/utils";
import dayjs from "dayjs";
import { CheckCircle2, Ban, Lock, MapPin, Building2, UserCircle, GitMerge, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { useAuthStore } from "../../../store/auth-store";
import { useTranslation } from "../../../hooks/use-translation";
import { CustomerAddressModal } from "./customer-address-modal";
import { useState } from "react";
import { useSWRConfig } from "swr";

interface CustomerDetailViewProps {
  customer: Customer;
}

export function CustomerDetailView({ customer }: CustomerDetailViewProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const canEdit = user?.role === "OWNER" || user?.role === "ADMIN_FINANCE";
  const isOwner = user?.role === "OWNER";
  const isStaff = user?.role === "STAFF_INPUT";

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  const handleCreateAddress = () => {
    setEditingAddress(null);
    setAddressModalOpen(true);
  };

  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setAddressModalOpen(true);
  };

  const handleAddressSuccess = () => {
    setAddressModalOpen(false);
    mutate(`/customers/${customer.id}`);
  };

  const renderStatus = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.ACTIVE:
        return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold"><CheckCircle2 className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      case CustomerStatus.INACTIVE:
        return <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold"><Ban className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      case CustomerStatus.BLOCKED:
        return <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold"><Lock className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      case CustomerStatus.MERGED:
        return <span className="inline-flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-md text-xs font-semibold"><GitMerge className="w-3 h-3"/> {t(`common.status.${status}`)}</span>;
      default:
        return <span className="text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner if merged */}
      {customer.status === CustomerStatus.MERGED && customer.mergedIntoCustomerId && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-start gap-3">
          <GitMerge className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-purple-900">Customer Telah Digabung (Merged)</h4>
            <p className="text-sm text-purple-700 mt-1">
              Data customer ini sudah tidak aktif dan telah digabungkan ke customer lain. Semua pesanan dan alamat telah dipindahkan.
            </p>
            <div className="mt-3">
              <Link href={`/dashboard/customers/${customer.mergedIntoCustomerId}`}>
                <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-100">
                  Lihat Customer Target
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}



      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <UserCircle className="w-4 h-4" /> Informasi Dasar
          </h3>
          
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <span className="text-slate-500">Customer Code</span>
            <span className="font-bold text-slate-900">{customer.customerCode}</span>

            <span className="text-slate-500">Nama Lengkap</span>
            <span className="font-bold text-slate-900">{customer.fullName}</span>

            <span className="text-slate-500">Status</span>
            <div className="flex items-center">{renderStatus(customer.status)}</div>

            <span className="text-slate-500">Tipe & Sumber</span>
            <div className="flex flex-col gap-1 items-start">
              <span className="inline-flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider">
                {t(`common.labels.${customer.customerType}`)}
              </span>
              <span className="inline-flex items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider">
                {t(`common.labels.${customer.source}`)}
              </span>
            </div>

            <span className="text-slate-500">Telepon</span>
            <span className="font-medium text-slate-800">{customer.phone || "-"}</span>

            <span className="text-slate-500">WhatsApp</span>
            <span className="font-medium text-slate-800">{customer.whatsapp || "-"}</span>

            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-800">{customer.email || "-"}</span>

            {!isStaff && (
              <>
                <span className="text-slate-500">Perusahaan</span>
                <span className="font-medium text-slate-800">{customer.companyName || "-"}</span>

                <span className="text-slate-500">NPWP</span>
                <span className="font-medium text-slate-800">{customer.taxNumber || "-"}</span>

                <span className="text-slate-500">Tags</span>
                <div className="flex flex-wrap gap-1">
                  {customer.tags && customer.tags.length > 0 ? customer.tags.map(tag => (
                    <span key={tag} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{tag}</span>
                  )) : "-"}
                </div>
              </>
            )}

            <span className="text-slate-500">Business Unit</span>
            <span className="font-medium text-slate-800">{customer.businessUnit?.name || "-"}</span>
          </div>

          {!isStaff && customer.notes && (
            <div className="pt-4 mt-4 border-t border-slate-100 text-sm">
              <span className="text-slate-500 font-semibold mb-2 block">Catatan Internal</span>
              <p className="text-slate-700 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Ringkasan Pesanan
          </h3>
          
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <span className="text-slate-500">Total Pesanan</span>
            <span className="font-bold text-slate-900">{customer.summary?.totalOrderCount || 0}</span>

            <span className="text-slate-500">Pesanan Pertama</span>
            <span className="font-medium text-slate-800">
              {formatDate(customer.summary?.firstOrderAt as any)}
            </span>

            <span className="text-slate-500">Pesanan Terakhir</span>
            <span className="font-medium text-slate-800">
              {formatDate(customer.summary?.lastOrderAt as any)}
            </span>

            {!isStaff && (
              <>
                <div className="col-span-2 h-px bg-slate-100 my-2"></div>
                
                <span className="text-slate-500">Total Penjualan (Principal)</span>
                <span className="font-bold text-indigo-600">{formatMoney(customer.summary?.principalAmount || "0")}</span>

                <span className="text-slate-500">Telah Dibayar (Collected)</span>
                <span className="font-bold text-emerald-600">{formatMoney(customer.summary?.amountCollected || "0")}</span>

                <span className="text-slate-500 font-semibold">Sisa Tagihan (Piutang)</span>
                <span className={`font-bold ${Number(customer.summary?.remainingBalance || 0) > 0 ? "text-rose-600" : "text-slate-900"}`}>
                  {formatMoney(customer.summary?.remainingBalance || "0")}
                </span>
              </>
            )}
          </div>
          
          {!isStaff && Number(customer.summary?.remainingBalance || 0) > 0 && (
            <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <p className="text-xs text-rose-700">Customer ini memiliki piutang yang belum lunas sebesar <strong>{formatMoney(customer.summary?.remainingBalance || 0)}</strong>.</p>
            </div>
          )}
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Daftar Alamat
          </h3>
          {canEdit && customer.status !== CustomerStatus.MERGED && (
            <Button size="sm" variant="outline" onClick={handleCreateAddress}>Tambah Alamat</Button>
          )}
        </div>

        {(!customer.addresses || customer.addresses.length === 0) ? (
          <div className="text-center py-6 text-slate-500 text-sm border border-dashed border-slate-200 rounded-xl">
            Belum ada alamat yang tersimpan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {customer.addresses.map(address => (
              <div key={address.id} className={`p-4 rounded-xl border ${address.isActive ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-slate-50/50 opacity-60'} relative`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{address.label || "Alamat"}</span>
                    {!address.isActive && <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">INACTIVE</span>}
                  </div>
                  {canEdit && customer.status !== CustomerStatus.MERGED && (
                    <button onClick={() => handleEditAddress(address)} className="text-xs text-indigo-600 font-medium hover:underline">Edit</button>
                  )}
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <div className="font-medium">{address.recipientName} {address.recipientPhone && `(${address.recipientPhone})`}</div>
                  <div>{address.addressLine1}</div>
                  {address.addressLine2 && <div>{address.addressLine2}</div>}
                  <div className="text-slate-500">
                    {[address.village, address.district, address.city, address.province, address.postalCode].filter(Boolean).join(", ")}
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  {address.isDefaultShipping && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-medium">Default Shipping</span>
                  )}
                  {address.isDefaultBilling && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Default Billing</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log */}
      {!isStaff && customer.auditLogs && customer.auditLogs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Audit Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Aktor</th>
                  <th className="px-4 py-3">Aksi</th>
                  <th className="px-4 py-3">Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {dayjs(log.createdAt).format("DD MMM YYYY HH:mm")}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {log.actor?.name || "System"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold tracking-wider text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {addressModalOpen && (
        <CustomerAddressModal
          isOpen={addressModalOpen}
          onClose={() => setAddressModalOpen(false)}
          onSuccess={handleAddressSuccess}
          customerId={customer.id}
          initialData={editingAddress}
        />
      )}
    </div>
  );
}
