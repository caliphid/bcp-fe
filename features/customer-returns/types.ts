import { Warehouse } from "../warehouses/types";
import { User } from "../auth/types";
import { ProductVariant } from "../products/types";
import { SalesOrder } from "../sales-orders/types";

// ENUMS
export enum CustomerReturnType {
  CUSTOMER_RETURN = "CUSTOMER_RETURN",
  SIZE_EXCHANGE = "SIZE_EXCHANGE",
  PRODUCT_EXCHANGE = "PRODUCT_EXCHANGE",
  REFUND_ONLY = "REFUND_ONLY",
  FAILED_DELIVERY = "FAILED_DELIVERY"
}

export enum CustomerReturnStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  ITEM_RECEIVED = "ITEM_RECEIVED",
  INSPECTED = "INSPECTED",
  REPLACEMENT_RESERVED = "REPLACEMENT_RESERVED",
  REPLACEMENT_SHIPPED = "REPLACEMENT_SHIPPED",
  REFUND_PENDING = "REFUND_PENDING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

export enum ReturnResolutionType {
  REFUND = "REFUND",
  REPLACEMENT = "REPLACEMENT",
  PARTIAL_REFUND = "PARTIAL_REFUND",
  NO_COMPENSATION = "NO_COMPENSATION"
}

export enum ReturnedItemCondition {
  RESTOCKABLE = "RESTOCKABLE",
  DAMAGED = "DAMAGED",
  LOST = "LOST",
  NOT_RECEIVED = "NOT_RECEIVED"
}

export enum RefundStatus {
  PENDING = "PENDING",
  POSTED = "POSTED",
  VOID = "VOID"
}

export enum ReturnShipmentStatus {
  PENDING = "PENDING",
  RECEIVED = "RECEIVED",
  LOST = "LOST",
  CANCELLED = "CANCELLED"
}

// ENTITIES
export interface CustomerReturn {
  id: string;
  returnCode: string;
  salesOrder?: SalesOrder;
  warehouse?: Warehouse;
  returnDate: string;
  returnType: CustomerReturnType;
  status: CustomerReturnStatus;
  returnShipmentStatus: ReturnShipmentStatus;
  resolutionType?: ReturnResolutionType;
  customerName?: string;
  customerPhone?: string;
  returnTrackingNumber?: string;
  returnCourierName?: string;
  reason: string;
  notes?: string;
  requestedRefundAmount?: string;
  approvedRefundAmount?: string;
  refundedAmount?: string;
  items?: CustomerReturnItem[];
  refunds?: CustomerRefund[];
}

export interface CustomerReturnItem {
  id: string;
  salesOrderItemId: string;
  originalProductVariant?: ProductVariant;
  replacementProductVariant?: ProductVariant;
  requestedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  restockedQuantity: number;
  damagedQuantity: number;
  replacementReservedQuantity: number;
  replacementShippedQuantity: number;
  condition?: ReturnedItemCondition;
  originalUnitPrice?: string;
  approvedRefundAmount?: string;
  priceDifferenceAmount?: string;
  originalUnitCostSnapshot?: string; // Hidden for STAFF_INPUT
}

export interface CustomerRefund {
  id: string;
  refundCode: string;
  customerReturnId: string;
  salesOrderId: string;
  refundDate: string;
  accountId?: string;
  amount?: string;
  paymentMethod?: string;
  transactionId?: string;
  status: RefundStatus;
  notes?: string;
}

// REQUEST DTOs
export interface CreateCustomerReturnRequest {
  salesOrderId: string;
  returnDate: string;
  returnType: CustomerReturnType;
  warehouseId?: string;
  reason: string;
  customerName?: string;
  customerPhone?: string;
  returnTrackingNumber?: string;
  returnCourierName?: string;
  notes?: string;
  items: {
    salesOrderItemId: string;
    requestedQuantity: number;
    replacementProductVariantId?: string;
    notes?: string;
  }[];
}

export interface UpdateCustomerReturnRequest {
  returnDate?: string;
  reason?: string;
  customerName?: string;
  customerPhone?: string;
  returnTrackingNumber?: string;
  returnCourierName?: string;
  notes?: string;
}

export interface ApproveReturnRequest {
  approvedRefundAmount?: number;
  resolutionType?: ReturnResolutionType;
  notes?: string;
}

export interface ReceiveReturnRequest {
  receivedDate?: string;
  notes?: string;
  items: {
    customerReturnItemId: string;
    receivedQuantity: number;
  }[];
}

export interface InspectReturnRequest {
  inspectedDate?: string;
  notes?: string;
  items: {
    customerReturnItemId: string;
    acceptedQuantity: number;
    rejectedQuantity: number;
    condition: ReturnedItemCondition;
    notes?: string;
  }[];
}

export interface ReserveExchangeRequest {
  notes?: string;
  items: {
    customerReturnItemId: string;
    quantity: number;
  }[];
}

export interface ShipExchangeRequest {
  shipmentDate?: string;
  trackingNumber?: string;
  courierName?: string;
  notes?: string;
  items: {
    customerReturnItemId: string;
    quantity: number;
  }[];
}

export interface CreateRefundRequest {
  refundDate: string;
  accountId: string;
  amount: number;
  paymentMethod: string; // CASH, BANK_TRANSFER, etc.
  categoryId?: string;
  notes?: string;
}

// REPORTS
export interface MonthlyReturnReport {
  month: string;
  count: number;
  refundedAmount: string;
}

export interface ByReasonReturnReport {
  reason: string;
  count: number;
}

export interface ByProductReturnReport {
  sku: string;
  productName: string;
  returnedQuantity: number;
}

export interface RefundsReport {
  count: number;
  totalRefunded: string;
  refunds: {
    id: string;
    refundCode: string;
    refundDate: string;
    amount: string;
  }[];
}

export interface FailedDeliveryReport {
  count: number;
  returns: {
    id: string;
    returnCode: string;
    returnDate: string;
    status: string;
  }[];
}
