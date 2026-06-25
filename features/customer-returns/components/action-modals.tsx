import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { customerReturnsApi } from "../api";
import { ReturnedItemCondition } from "../types";
import toast from "react-hot-toast";
import { extractErrorMessage } from "../../../lib/error";

// --- REJECT MODAL ---
export function RejectReturnModal({ isOpen, onClose, returnId, onSuccess }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await customerReturnsApi.rejectReturn(returnId, reason, notes);
      toast.success("Return rejected");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Return">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-1 block">Reason <span className="text-rose-500">*</span></Label>
          <Input required value={reason} onChange={e => setReason(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1 block">Notes</Label>
          <Input value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="destructive" disabled={isSubmitting}>{isSubmitting ? "Rejecting..." : "Reject"}</Button>
        </div>
      </form>
    </Modal>
  );
}

// --- RECEIVE MODAL ---
export function ReceiveReturnModal({ isOpen, onClose, returnId, items, onSuccess }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [receivedItems, setReceivedItems] = useState<any[]>(items?.map((i: any) => ({
    customerReturnItemId: i.id,
    requestedQuantity: i.requestedQuantity,
    receivedQuantity: i.requestedQuantity, // Default to requested
  })) || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await customerReturnsApi.receiveReturn(returnId, {
        receivedDate,
        notes,
        items: receivedItems.map(i => ({
          customerReturnItemId: i.customerReturnItemId,
          receivedQuantity: i.receivedQuantity,
        })),
      });
      toast.success("Items received");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateItemQty = (id: string, qty: number) => {
    setReceivedItems(prev => prev.map(i => i.customerReturnItemId === id ? { ...i, receivedQuantity: qty } : i));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Return Items">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="mb-1 block">Received Date</Label>
          <Input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} />
        </div>
        <div className="space-y-3">
           <Label>Items to Receive</Label>
           {receivedItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex-1 text-sm font-medium">Item ID: {item.customerReturnItemId.slice(0,8)}...</div>
                <div className="text-sm text-slate-500">Req: {item.requestedQuantity}</div>
                <Input 
                   type="number" min="0" className="w-24" 
                   value={item.receivedQuantity} 
                   onChange={e => updateItemQty(item.customerReturnItemId, parseInt(e.target.value) || 0)} 
                />
              </div>
           ))}
        </div>
        <div>
          <Label className="mb-1 block">Notes</Label>
          <Input value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Receiving..." : "Receive Items"}</Button>
        </div>
      </form>
    </Modal>
  );
}

// --- INSPECT MODAL ---
export function InspectReturnModal({ isOpen, onClose, returnId, items, onSuccess }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inspectedItems, setInspectedItems] = useState<any[]>(items?.map((i: any) => ({
    customerReturnItemId: i.id,
    receivedQuantity: i.receivedQuantity,
    acceptedQuantity: i.receivedQuantity,
    rejectedQuantity: 0,
    condition: ReturnedItemCondition.RESTOCKABLE,
    notes: ""
  })) || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await customerReturnsApi.inspectReturn(returnId, {
        items: inspectedItems.map(i => ({
          customerReturnItemId: i.customerReturnItemId,
          acceptedQuantity: i.acceptedQuantity,
          rejectedQuantity: i.rejectedQuantity,
          condition: i.condition,
          notes: i.notes || undefined,
        })),
      });
      toast.success(`Items inspected. Eligible refund: ${res.data?.eligibleRefund || "0.00"}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateItem = (id: string, field: string, val: any) => {
    setInspectedItems(prev => prev.map(i => i.customerReturnItemId === id ? { ...i, [field]: val } : i));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inspect Return Items" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
           {inspectedItems.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex justify-between items-center text-sm font-medium border-b border-slate-200 pb-2">
                  <span>Item ID: {item.customerReturnItemId.slice(0,8)}...</span>
                  <span className="text-slate-500">Rcv Qty: {item.receivedQuantity}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label className="mb-1 text-xs">Condition</Label>
                    <select className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm" value={item.condition} onChange={e => updateItem(item.customerReturnItemId, 'condition', e.target.value)}>
                      {Object.values(ReturnedItemCondition).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="w-20">
                    <Label className="mb-1 text-xs">Acc Qty</Label>
                    <Input type="number" min="0" value={item.acceptedQuantity} onChange={e => updateItem(item.customerReturnItemId, 'acceptedQuantity', parseInt(e.target.value)||0)} />
                  </div>
                  <div className="w-20">
                    <Label className="mb-1 text-xs">Rej Qty</Label>
                    <Input type="number" min="0" value={item.rejectedQuantity} onChange={e => updateItem(item.customerReturnItemId, 'rejectedQuantity', parseInt(e.target.value)||0)} />
                  </div>
                </div>
              </div>
           ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Inspecting..." : "Complete Inspection"}</Button>
        </div>
      </form>
    </Modal>
  );
}
