import { Warehouse } from './warehouse';
import { Product, ProductVariant } from './product';
import { User } from './auth';

export interface InventoryStock {
  stockId: string;
  warehouseId: string;
  warehouse?: Warehouse;
  productId: string;
  product?: Product;
  productVariantId: string;
  variant?: ProductVariant;
  sku: string;
  color: string;
  size: string;
  onHand: number;
  reserved: number;
  available: number;
  minimumStock: number;
  isLowStock: boolean;
}

export enum InventoryMovementType {
  OPENING_STOCK = "OPENING_STOCK",
  SALE_RESERVATION = "SALE_RESERVATION",
  SALE_RESERVATION_RELEASE = "SALE_RESERVATION_RELEASE",
  SALE_FULFILLMENT = "SALE_FULFILLMENT",
  SALE_RETURN = "SALE_RETURN",
  STOCK_ADJUSTMENT_IN = "STOCK_ADJUSTMENT_IN",
  STOCK_ADJUSTMENT_OUT = "STOCK_ADJUSTMENT_OUT",
  DAMAGED = "DAMAGED",
  VENDOR_RECEIPT = "VENDOR_RECEIPT",
  VENDOR_RECEIPT_REVERSAL = "VENDOR_RECEIPT_REVERSAL",
  CUSTOMER_RETURN_RESTOCK = "CUSTOMER_RETURN_RESTOCK",
  CUSTOMER_RETURN_DAMAGED = "CUSTOMER_RETURN_DAMAGED",
  CUSTOMER_RETURN_REVERSAL = "CUSTOMER_RETURN_REVERSAL",
  EXCHANGE_RESERVATION = "EXCHANGE_RESERVATION",
  EXCHANGE_RESERVATION_RELEASE = "EXCHANGE_RESERVATION_RELEASE",
  EXCHANGE_FULFILLMENT = "EXCHANGE_FULFILLMENT"
}

export interface InventoryMovement {
  id: string;
  warehouseId: string;
  warehouse?: Warehouse;
  productId: string;
  product?: Product;
  productVariantId: string;
  variant?: ProductVariant;
  productVariant?: ProductVariant;
  movementType: InventoryMovementType;
  movementDate: string | Date;
  quantity: number;
  reason?: string;
  notes?: string;
  referenceId?: string;
  referenceCode?: string;
  createdBy?: User;
  createdAt: string;
}

export interface OpeningStockItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface OpeningStockRequest {
  warehouseId: string;
  movementDate: string | Date;
  notes?: string;
  items: OpeningStockItemRequest[];
}

export interface StockAdjustmentItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface StockAdjustmentRequest {
  warehouseId: string;
  movementDate: string | Date;
  type: 'STOCK_ADJUSTMENT_IN' | 'STOCK_ADJUSTMENT_OUT' | 'DAMAGED';
  reason: string;
  items: StockAdjustmentItemRequest[];
}
