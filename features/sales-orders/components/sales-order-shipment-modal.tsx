import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Truck } from "lucide-react";
import { SalesOrder, CreateOrUpdateSalesOrderShipmentRequest } from "@/types/sales-order";

interface SalesOrderShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOrUpdateSalesOrderShipmentRequest) => Promise<void>;
  isLoading: boolean;
  order: SalesOrder | undefined;
}

export function SalesOrderShipmentModal({ isOpen, onClose, onSubmit, isLoading, order }: SalesOrderShipmentModalProps) {
  const [shipmentDate, setShipmentDate] = useState("");
  const [deliveredAt, setDeliveredAt] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deliveryProofUrl, setDeliveryProofUrl] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  useMemo(() => {
    if (isOpen && order) {
      const existing = order.shipment;
      setShipmentDate(existing?.shipmentDate ? new Date(existing.shipmentDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]);
      setDeliveredAt(existing?.deliveredAt ? new Date(existing.deliveredAt).toISOString().split("T")[0] : "");
      setCourierName(existing?.courierName || "");
      setTrackingNumber(existing?.trackingNumber || "");
      setDeliveryProofUrl(existing?.deliveryProofUrl || "");
      setRecipientName(existing?.recipientName || order.customerName || "");
      setRecipientPhone(existing?.recipientPhone || order.customerPhone || "");
      setDeliveryAddress(existing?.deliveryAddress || order.customerAddress || "");
      // notes is not in the shipment response yet, so we leave it blank
      setNotes("");
    }
  }, [isOpen, order]);

  if (!order) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipmentDate) return;

    const payload: CreateOrUpdateSalesOrderShipmentRequest = {
      shipmentDate: new Date(shipmentDate),
    };

    if (deliveredAt) payload.deliveredAt = new Date(deliveredAt);
    if (courierName) payload.courierName = courierName;
    if (trackingNumber) payload.trackingNumber = trackingNumber;
    if (deliveryProofUrl) payload.deliveryProofUrl = deliveryProofUrl;
    if (recipientName) payload.recipientName = recipientName;
    if (recipientPhone) payload.recipientPhone = recipientPhone;
    if (deliveryAddress) payload.deliveryAddress = deliveryAddress;
    if (notes) payload.notes = notes;

    await onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shipment Details" className="max-w-2xl">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Shipment Date <span className="text-red-500">*</span></Label>
            <Input type="date" required value={shipmentDate} onChange={(e) => setShipmentDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Delivered Date</Label>
            <Input type="date" value={deliveredAt} onChange={(e) => setDeliveredAt(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Courier Name</Label>
            <Input type="text" value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="e.g. JNE, Gojek" />
          </div>
          <div className="space-y-2">
            <Label>Tracking Number</Label>
            <Input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="AWB / Receipt Number" />
          </div>

          <div className="space-y-2">
            <Label>Recipient Name</Label>
            <Input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Recipient Phone</Label>
            <Input type="text" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Delivery Address</Label>
            <Textarea rows={2} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Delivery Proof URL</Label>
            <Input type="url" value={deliveryProofUrl} onChange={(e) => setDeliveryProofUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Courier notes or internal instructions..." />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !shipmentDate}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
            Save Shipment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
