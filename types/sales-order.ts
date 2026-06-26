import { BusinessUnit } from "./business-unit";
import { Product } from "./product";
import { User } from "./auth";

export enum SalesOrderStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  FULFILLED = "FULFILLED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  UNPAID = "UNPAID",
  PARTIAL = "PARTIAL",
  PAID = "PAID",
  REFUNDED = "REFUNDED",
}

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  productVariantId: string;
  product?: Product; // Legacy or alternative relation
  productVariant?: import('./product').ProductVariant;
  quantity: number;
  unitPrice: string;
  discountAmount: string;
  lineTotal: string;
  unitCostSnapshot?: string | null;
  totalCostSnapshot?: string | null;
  notes?: string;
}

export interface SalesOrderReceivable {
  id: string;
  receivableCode: string;
  externalParty?: { id: string; name: string };
  receivableDate: string;
  dueDate?: string;
  principalAmount: string;
  amountCollected: string;
  remainingBalance: string;
  status: string;
}

export interface SalesOrderShipment {
  id: string;
  shipmentCode: string;
  status: 'PROCESSING' | 'PACKING' | 'SHIPPED' | 'DELIVERED';
  shipmentDate: string;
  deliveredAt?: string;
  courierName?: string;
  trackingNumber?: string;
  deliveryProofUrl?: string;
  recipientName?: string;
  recipientPhone?: string;
  deliveryAddress?: string;
}

export interface SalesOrder {
  id: string;
  orderCode: string;
  orderDate: string | Date;
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  warehouseId?: string;
  customerId?: string;
  customer?: import('./customer').Customer;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  salesChannel: string;
  orderType: string;
  notes?: string;
  status: SalesOrderStatus;
  paymentStatus: PaymentStatus;
  
  items: SalesOrderItem[];
  payments?: SalesOrderPayment[];
  refunds?: SalesOrderRefund[];
  
  subtotal: string;
  discountAmount: string;
  shippingAmount: string;
  taxAmount: string;
  platformFeeRate?: string;
  platformFeeAmount?: string;
  grandTotal: string;

  invoicedAt?: string;
  invoicedBy?: User;
  receivable?: SalesOrderReceivable;
  shipment?: SalesOrderShipment;
  
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  updatedBy?: User;
}

export interface CreateSalesOrderRequest {
  orderDate: string | Date;
  businessUnitId?: string;
  warehouseId?: string;
  customerName: string;
  customerId?: string;
  customerPhone?: string;
  customerAddress?: string;
  salesChannel: string;
  orderType: string;
  notes?: string;
  discountAmount?: string | number;
  shippingAmount?: string | number;
  taxAmount?: string | number;
  platformFeeRate?: string | number;
  items?: CreateSalesOrderItemRequest[];
}

export type UpdateSalesOrderRequest = Partial<CreateSalesOrderRequest>;

export interface CreateSalesOrderItemRequest {
  productVariantId: string;
  quantity: number;
  discountAmount?: string | number;
  notes?: string;
}

export type UpdateSalesOrderItemRequest = Partial<CreateSalesOrderItemRequest>;

export interface CancelSalesOrderRequest {
  reason?: string;
}

export interface SalesOrderPayment {
  id: string;
  paymentCode: string;
  paymentDate: string | Date;
  salesOrderId: string;
  accountId: string;
  account?: { id: string; name: string };
  amount: string;
  notes?: string;
  status: 'POSTED' | 'VOID';
  voidReason?: string;
  transactionId?: string;
  transaction?: { id: string; transactionCode: string; status: string };
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  voidedBy?: User;
}

export interface CreateSalesOrderPaymentRequest {
  paymentDate: string | Date;
  accountId: string;
  amount: string;
  method: string;
  categoryId?: string;
  notes?: string;
}

export interface SalesOrderRefundItem {
  salesOrderItemId: string;
  quantity: number;
}

export interface SalesOrderRefund {
  id: string;
  refundCode: string;
  refundDate: string | Date;
  salesOrderId: string;
  accountId: string;
  account?: { id: string; name: string };
  amount: string;
  method: string;
  categoryId?: string;
  returnToStock: boolean;
  notes?: string;
  status: 'POSTED' | 'VOID';
  voidReason?: string;
  transactionId?: string;
  transaction?: { id: string; transactionCode: string; status: string };
  items?: { salesOrderItemId: string; quantity: number }[];
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  voidedBy?: User;
}

export interface CreateSalesOrderRefundRequest {
  refundDate: string | Date;
  accountId: string;
  amount: string;
  method: string;
  categoryId?: string;
  returnToStock?: boolean;
  items?: SalesOrderRefundItem[];
  notes?: string;
}

export interface CreateSalesOrderInvoiceRequest {
  externalPartyId: string;
  invoiceDate: string | Date;
  dueDate?: string | Date;
  notes?: string;
  attachmentUrl?: string;
}

export interface CreateOrUpdateSalesOrderShipmentRequest {
  shipmentDate: string | Date;
  deliveredAt?: string | Date;
  recipientName?: string;
  recipientPhone?: string;
  deliveryAddress?: string;
  courierName?: string;
  trackingNumber?: string;
  deliveryProofUrl?: string;
  notes?: string;
}
