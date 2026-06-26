"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { customerReturnsApi } from "../../../../../features/customer-returns/api";
import { salesOrderApi } from "../../../../../features/sales-orders/api";
import { customerApi } from "../../../../../features/customers/api";
import { CustomerReturnType, CreateCustomerReturnRequest } from "../../../../../features/customer-returns/types";
import { useAuthStore } from "../../../../../store/auth-store";
import { extractErrorMessage } from "../../../../../lib/error";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { PageHeader } from "../../../../../components/ui/page-header";
import { AsyncSearchableSelect } from "../../../../../components/ui/async-searchable-select";
import { warehouseApi } from "../../../../../features/warehouses/api";
import { productApi } from "../../../../../features/products/api";
import { ArrowLeft, Plus, Trash2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

// Very simplified for now. In a real app we would fetch a specific SO 
// to populate items, use react-hook-form, zod validation, etc.
// Here we'll build a simple manual form.

const loadSalesOrders = async (search: string) => {
  const res = await salesOrderApi.getSalesOrders({ search, limit: 30 });
  return (res.data || []).map(so => ({ 
    value: so.id, 
    label: `${so.orderCode} - ${so.customerName || so.customer?.fullName || ''}`,
    salesOrder: so 
  }));
};

const loadCustomers = async (search: string) => {
  const res = await customerApi.getCustomers({ search, limit: 30, status: "ACTIVE" });
  return (res.data || []).map(c => ({
    value: c.id,
    label: `${c.fullName} ${c.customerCode ? `(${c.customerCode})` : ''}`,
    customer: c
  }));
};

const loadWarehouses = async (search: string) => {
  const res = await warehouseApi.getWarehouses({ search, limit: 30 });
  return (res.data || []).map(w => ({ value: w.id, label: w.name }));
};

const loadVariants = async (search: string) => {
  const res = await productApi.getProductVariants({ search, limit: 30 });
  return (res.data || []).map((v: any) => ({
    value: v.id,
    label: `${v.sku} - ${v.product?.name || ''} ${v.color ? `(${v.color})` : ''} ${v.size ? `[${v.size}]` : ''}`
  }));
};

export default function CreateCustomerReturnPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CreateCustomerReturnRequest>>({
    returnDate: new Date().toISOString().split("T")[0],
    returnType: CustomerReturnType.CUSTOMER_RETURN,
    reason: "",
    items: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.salesOrderId) return toast.error("Sales Order ID is required");
    if (!formData.reason) return toast.error("Reason is required");
    if (!formData.items || formData.items.length === 0) return toast.error("At least one item is required");

    setIsSubmitting(true);
    try {
      // Strip out internal frontend-only state fields before sending payload to backend
      const { _customerDetails, isCustomerLocked, ...payload } = formData as any;

      const res = await customerReturnsApi.createCustomerReturn(payload as CreateCustomerReturnRequest);
      toast.success("Customer return created successfully");
      router.push(`/dashboard/customer-returns/${res.data?.id}`);
    } catch (error: any) {
      toast.error(extractErrorMessage(error) || "Failed to create return");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...(prev.items || []), 
        { salesOrderItemId: "", requestedQuantity: 1 }
      ]
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...(prev.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const removeItem = (index: number) => {
    setFormData(prev => {
      const newItems = [...(prev.items || [])];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const loadSalesOrderItems = async (search: string) => {
    if (!formData.salesOrderId) return [];
    try {
      const res = await salesOrderApi.getSalesOrderById(formData.salesOrderId);
      const items = res.data?.items || [];
      return items
        .filter((i: any) => {
           const sku = (i.variant?.sku || i.productVariant?.sku || i.product?.sku || i.sku || "").toLowerCase();
           const name = (i.variant?.product?.name || i.productVariant?.product?.name || i.product?.name || i.name || "").toLowerCase();
           const s = search.toLowerCase();
           return sku.includes(s) || name.includes(s);
        })
        .map((i: any) => {
           const sku = i.variant?.sku || i.productVariant?.sku || i.product?.sku || i.sku || "Unknown SKU";
           const name = i.variant?.product?.name || i.productVariant?.product?.name || i.product?.name || i.name || "Unknown Product";
           return {
             value: i.id,
             label: `${sku} - ${name} (Qty: ${i.quantity})`
           };
        });
    } catch {
      return [];
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <PageHeader title="Create Customer Return" description="Initiate a return, exchange, or refund request" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-2">General Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block text-slate-700">Sales Order <span className="text-rose-500">*</span></Label>
              <AsyncSearchableSelect 
                required 
                placeholder="Search Sales Order (Code or Name)"
                value={formData.salesOrderId || ""}
                onChange={(e: any) => {
                  const so = e.option?.salesOrder;
                  const customerId = so?.customerId || so?.customer?.id || "";
                  const customerName = so?.customer?.fullName || so?.customerName || "";
                  const customerPhone = so?.customer?.phone || so?.customerPhone || "";
                  
                  setFormData(prev => ({ 
                    ...prev, 
                    salesOrderId: e.target.value,
                    customerId,
                    customerName,
                    customerPhone,
                    isCustomerLocked: !!customerId,
                    _customerDetails: so?.customer ? {
                      fullName: so.customer.fullName,
                      customerCode: so.customer.customerCode,
                      customerType: so.customer.customerType || (so.customer as any).type,
                      status: so.customer.status
                    } : null
                  }));
                }}
                loadOptions={loadSalesOrders}
                defaultOptions={true}
              />
            </div>

            <div>
              <Label className="mb-2 block text-slate-700">Return Date <span className="text-rose-500">*</span></Label>
              <Input 
                required 
                type="date"
                value={formData.returnDate || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
              />
            </div>

            <div>
              <Label className="mb-2 block text-slate-700">Return Type <span className="text-rose-500">*</span></Label>
              <select 
                required
                className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.returnType}
                onChange={(e) => setFormData(prev => ({ ...prev, returnType: e.target.value as CustomerReturnType }))}
              >
                {Object.values(CustomerReturnType).map(t => (
                  <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="mb-2 block text-slate-700">Return Warehouse (Dest)</Label>
              <AsyncSearchableSelect 
                placeholder="Search Warehouse"
                value={formData.warehouseId || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, warehouseId: e.target.value }))}
                loadOptions={loadWarehouses}
                defaultOptions={true}
              />
            </div>

            <div className="md:col-span-2">
              <Label className="mb-2 block text-slate-700">Reason <span className="text-rose-500">*</span></Label>
              <Input 
                required 
                placeholder="e.g., Items arrived damaged"
                value={formData.reason || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>

            {/* Optional Customer Manual Link if SO is not locked */}
            {!(formData as any).isCustomerLocked && formData.salesOrderId && (
              <div className="md:col-span-2">
                <Label className="mb-2 block text-slate-700">Link Customer Master (Optional)</Label>
                <p className="text-xs text-slate-500 mb-2">Since the selected Sales Order is not linked to a Master Customer, you may optionally link one here for this return.</p>
                <AsyncSearchableSelect 
                  placeholder="Search Master Customer"
                  value={formData.customerId || ""}
                  onChange={(e: any) => {
                    const c = e.option?.customer;
                    if (c) {
                      setFormData(prev => ({
                        ...prev,
                        customerId: c.id,
                        _customerDetails: {
                          fullName: c.fullName,
                          customerCode: c.customerCode,
                          customerType: c.customerType || c.type,
                          status: c.status
                        }
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        customerId: "",
                        _customerDetails: null
                      }));
                    }
                  }}
                  loadOptions={loadCustomers}
                  defaultOptions={true}
                />
              </div>
            )}

            {/* Customer Details Display */}
            {(formData as any)._customerDetails ? (
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl mt-2">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-800">Linked Customer Master</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Name</p>
                    <p className="font-medium text-slate-800">{(formData as any)._customerDetails.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Code</p>
                    <p className="font-medium text-slate-800">{(formData as any)._customerDetails.customerCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Type</p>
                    <p className="font-medium text-slate-800">{(formData as any)._customerDetails.customerType || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status</p>
                    <p className="font-medium text-slate-800">{(formData as any)._customerDetails.status}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label className="mb-2 block text-slate-700">Customer Name (Snapshot)</Label>
                  <Input 
                    readOnly
                    className="bg-slate-50 text-slate-500 cursor-not-allowed"
                    value={formData.customerName || ""}
                    placeholder="Auto-filled from Sales Order"
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block text-slate-700">Customer Phone (Snapshot)</Label>
                  <Input 
                    readOnly
                    className="bg-slate-50 text-slate-500 cursor-not-allowed"
                    value={formData.customerPhone || ""}
                    placeholder="Auto-filled from Sales Order"
                  />
                </div>
              </>
            )}
            
            <div>
              <Label className="mb-2 block text-slate-700">Tracking Number (Inbound)</Label>
              <Input 
                value={formData.returnTrackingNumber || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, returnTrackingNumber: e.target.value }))}
              />
            </div>
            
            <div>
              <Label className="mb-2 block text-slate-700">Courier Name</Label>
              <Input 
                value={formData.returnCourierName || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, returnCourierName: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-semibold text-slate-800">Return Items <span className="text-rose-500">*</span></h3>
            <Button type="button" size="sm" variant="outline" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>

          {!formData.items?.length ? (
             <div className="text-center text-slate-500 py-4 text-sm bg-slate-50 rounded-xl border border-slate-100">
               Please add at least one item to return.
             </div>
          ) : (
             <div className="space-y-4">
               {formData.items.map((item, index) => (
                 <div key={index} className="flex flex-col md:flex-row gap-4 items-start p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                   <div className="flex-1">
                     <Label className="mb-1 block text-xs font-medium text-slate-500">Sales Order Item</Label>
                     <AsyncSearchableSelect 
                       required
                       placeholder="Select Item from SO"
                       value={item.salesOrderItemId || ""}
                       onChange={(e) => updateItem(index, "salesOrderItemId", e.target.value)}
                       loadOptions={loadSalesOrderItems}
                       defaultOptions={true}
                     />
                   </div>
                   <div className="w-32">
                     <Label className="mb-1 block text-xs font-medium text-slate-500">Requested Qty</Label>
                     <Input 
                       required
                       type="number"
                       min="1"
                       value={item.requestedQuantity}
                       onChange={(e) => updateItem(index, "requestedQuantity", parseInt(e.target.value) || 1)}
                     />
                   </div>
                   {(formData.returnType === CustomerReturnType.PRODUCT_EXCHANGE || formData.returnType === CustomerReturnType.SIZE_EXCHANGE) && (
                      <div className="flex-1">
                        <Label className="mb-1 block text-xs font-medium text-slate-500">Replacement Variant</Label>
                        <AsyncSearchableSelect 
                          placeholder="Search Replacement Variant"
                          value={item.replacementProductVariantId || ""}
                          onChange={(e) => updateItem(index, "replacementProductVariantId", e.target.value)}
                          loadOptions={loadVariants}
                          defaultOptions={true}
                        />
                      </div>
                   )}
                   <Button type="button" variant="outline" size="icon" className="text-rose-500 mt-6" onClick={() => removeItem(index)}>
                     <Trash2 className="w-4 h-4" />
                   </Button>
                 </div>
               ))}
             </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Return"}
          </Button>
        </div>
      </form>
    </div>
  );
}
