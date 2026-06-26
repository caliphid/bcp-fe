import { useState } from "react";
import { Customer, CustomerAddress, CustomerAddressType } from "../../../types/customer";
import { Button } from "../../../components/ui/button";
import { Plus, Edit2, PowerOff, Power } from "lucide-react";
import { CustomerAddressModal } from "./customer-address-modal";
import { customerApi } from "../api";

interface CustomerAddressListProps {
  customer: Customer;
  onUpdated: () => void;
}

export function CustomerAddressList({ customer, onUpdated }: CustomerAddressListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const addresses = customer.addresses || [];

  const handleAdd = () => {
    setSelectedAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (address: CustomerAddress) => {
    setSelectedAddress(address);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (address: CustomerAddress) => {
    try {
      setIsUpdating(address.id);
      await customerApi.updateCustomerAddress(customer.id, address.id, {
        isActive: !address.isActive
      });
      onUpdated();
    } catch (error) {
      console.error("Failed to toggle address status", error);
      alert("Gagal mengubah status alamat");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    onUpdated();
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-800">Daftar Alamat</h3>
        <Button onClick={handleAdd} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Alamat
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          Belum ada alamat tersimpan untuk customer ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`p-4 rounded-xl border relative ${address.isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {address.label && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                      {address.label}
                    </span>
                  )}
                  {address.addressType === CustomerAddressType.SHIPPING && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                      Pengiriman
                    </span>
                  )}
                  {address.addressType === CustomerAddressType.BILLING && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md">
                      Penagihan
                    </span>
                  )}
                  {address.addressType === CustomerAddressType.BOTH && (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-md">
                      Pengiriman & Penagihan
                    </span>
                  )}
                  {!address.isActive && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-md">
                      Nonaktif
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-500 hover:text-slate-900"
                    onClick={() => handleEdit(address)}
                    disabled={isUpdating === address.id}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 ${address.isActive ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-green-500 hover:text-green-700 hover:bg-green-50'}`}
                    onClick={() => handleToggleActive(address)}
                    disabled={isUpdating === address.id}
                    title={address.isActive ? "Nonaktifkan" : "Aktifkan"}
                  >
                    {address.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                  {address.recipientName}
                  {address.recipientPhone && (
                    <span className="font-normal text-slate-500 text-sm">
                      ({address.recipientPhone})
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-600 leading-relaxed">
                  {address.addressLine1}
                  {address.addressLine2 && <><br/>{address.addressLine2}</>}
                  <br/>
                  {[address.village, address.district, address.city, address.province].filter(Boolean).join(", ")}
                  {address.postalCode && ` ${address.postalCode}`}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {address.isDefaultShipping && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Default Pengiriman
                  </span>
                )}
                {address.isDefaultBilling && (
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Default Penagihan
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CustomerAddressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          customerId={customer.id}
          initialData={selectedAddress}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
