import { User } from "../../../types/auth";
import { ProductVariant } from "../../../types/product";
import { Warehouse } from "../../../types/warehouse";
import { BusinessUnit } from "../../../types/business-unit";
import { Account } from "../../../types/account";
import { Transaction as CashflowTransaction } from "../../../types/transaction";

// ENUMS
export enum VendorStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum PurchaseOrderStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED",
  FULLY_RECEIVED = "FULLY_RECEIVED",
  CANCELLED = "CANCELLED",
  CLOSED = "CLOSED",
}

export enum PurchaseOrderPaymentStatus {
  UNPAID = "UNPAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export enum GoodsReceiptStatus {
  DRAFT = "DRAFT",
  POSTED = "POSTED",
  VOID = "VOID",
}

export enum VendorPaymentStatus {
  POSTED = "POSTED",
  VOID = "VOID",
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  EWALLET = "EWALLET",
  OTHER = "OTHER",
}

// INTERFACES

export interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  status: VendorStatus;
  paymentTermDays: number;
  notes?: string | null;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productVariantId: string;
  productVariant?: ProductVariant;
  orderedQuantity: number;
  receivedQuantity: number;
  cancelledQuantity: number;
  unitCost?: string; // STAFF_INPUT returns null
  discountAmount?: string;
  lineTotal?: string; // STAFF_INPUT returns null
  outstandingQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  purchaseOrderCode: string;
  externalReference?: string | null;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  status: PurchaseOrderStatus;
  paymentStatus: PurchaseOrderPaymentStatus;
  vendorId: string;
  vendor?: Vendor;
  warehouseId: string;
  warehouse?: Warehouse;
  businessUnitId?: string | null;
  businessUnit?: BusinessUnit;
  notes?: string | null;
  
  // Amounts (null for STAFF_INPUT)
  subtotal?: string;
  discountAmount?: string;
  shippingAmount?: string;
  otherCostAmount?: string;
  taxAmount?: string;
  totalAmount?: string;
  totalReceivedAmount?: string;
  totalPaidAmount?: string;
  outstandingAmount?: string;

  items?: PurchaseOrderItem[];
}

export interface GoodsReceiptItem {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  purchaseOrderItem?: PurchaseOrderItem;
  productVariantId: string;
  productVariant?: ProductVariant;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitCost?: string;
  lineTotal?: string;
}

export interface GoodsReceipt {
  id: string;
  goodsReceiptCode: string;
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrder;
  vendorId: string;
  vendor?: Vendor;
  receiptDate: string;
  vendorDeliveryNumber?: string | null;
  status: GoodsReceiptStatus;
  totalQuantity: number;
  totalCost?: string; // null for STAFF_INPUT
  createDebt: boolean;
  debtId?: string | null;
  notes?: string | null;
  voidReason?: string | null;
  items?: GoodsReceiptItem[];
}

export interface VendorPayment {
  id: string;
  vendorPaymentCode: string;
  paymentDate: string;
  amount: string;
  principalAmount: string;
  interestAmount: string;
  feeAmount: string;
  paymentMethod: PaymentMethod;
  status: VendorPaymentStatus;
  notes?: string | null;
  voidReason?: string | null;
  voidedAt?: string | null;
  
  vendorId: string;
  vendor?: Vendor;
  purchaseOrderId: string;
  purchaseOrder?: PurchaseOrder;
  accountId: string;
  account?: Account;
  transactionId?: string | null;
  transaction?: CashflowTransaction;
}

// REQUEST/PAYLOAD TYPES

export interface CreateVendorRequest {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  paymentTermDays?: number;
  notes?: string;
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> {}

export interface PurchaseOrderItemRequest {
  productVariantId: string;
  orderedQuantity: number;
  unitCost: number;
  discountAmount?: number;
}

export interface CreatePurchaseOrderRequest {
  orderDate: string;
  vendorId: string;
  warehouseId: string;
  expectedDeliveryDate?: string;
  businessUnitId?: string;
  externalReference?: string;
  discountAmount?: number;
  shippingAmount?: number;
  otherCostAmount?: number;
  taxAmount?: number;
  vendorInvoiceNumber?: string;
  vendorInvoiceDate?: string;
  paymentDueDate?: string;
  notes?: string;
  items: PurchaseOrderItemRequest[];
}

export interface UpdatePurchaseOrderRequest extends Partial<CreatePurchaseOrderRequest> {}

export interface GoodsReceiptItemRequest {
  purchaseOrderItemId: string;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity?: number;
}

export interface CreateGoodsReceiptRequest {
  purchaseOrderId: string;
  receiptDate: string;
  vendorDeliveryNumber?: string;
  createDebt?: boolean;
  vendorInvoiceNumber?: string;
  paymentDueDate?: string;
  notes?: string;
  items: GoodsReceiptItemRequest[];
}

export interface UpdateGoodsReceiptRequest extends Partial<CreateGoodsReceiptRequest> {}

export interface CreateVendorPaymentRequest {
  paymentDate: string;
  accountId: string;
  amount: number;
  principalAmount: number;
  interestAmount?: number;
  feeAmount?: number;
  paymentMethod: string;
  categoryId?: string;
  notes?: string;
}

// REPORT TYPES

export interface MonthlyPurchaseReport {
  month: string;
  orderCount: number;
  totalAmount: string;
}

export interface VendorPurchaseReport {
  vendorId: string;
  vendorName: string;
  orderCount: number;
  totalAmount: string;
  outstandingAmount: string;
}

export interface ProductPurchaseReport {
  productVariantId: string;
  sku: string;
  orderedQuantity: number;
  totalCost: string;
}

export interface OutstandingReceiptReport {
  purchaseOrderId: string;
  purchaseOrderCode: string;
  vendorName: string;
  status: string;
  outstandingQuantity: number;
}

export interface OutstandingPaymentReport {
  purchaseOrderId: string;
  purchaseOrderCode: string;
  vendorName: string;
  paymentStatus: string;
  outstandingAmount: string;
}

export interface GoodsReceiptReport {
  goodsReceiptId: string;
  goodsReceiptCode: string;
  vendorName: string;
  receiptDate: string;
  status: string;
  totalQuantity: number;
  totalCost: string;
}
