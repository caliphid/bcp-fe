export enum StockOpnameSessionStatus {
  COUNTING = 'COUNTING',
  REVIEW_PENDING = 'REVIEW_PENDING',
  APPROVED = 'APPROVED',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
  VOIDED = 'VOIDED'
}

export enum StockOpnameCountMode {
  BLIND = 'BLIND',
  NON_BLIND = 'NON_BLIND'
}

export enum StockOpnameScopeType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL'
}

export enum StockOpnameItemStatus {
  PENDING = 'PENDING',
  COUNTED = 'COUNTED',
  RECOUNT_REQUIRED = 'RECOUNT_REQUIRED',
  POSTED = 'POSTED',
  VOIDED = 'VOIDED'
}

export enum StockOpnameAuditAction {
  CREATED = 'CREATED',
  COUNT_SUBMITTED = 'COUNT_SUBMITTED',
  RECOUNT_REQUESTED = 'RECOUNT_REQUESTED',
  REVIEWED = 'REVIEWED',
  APPROVED = 'APPROVED',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
  VOIDED = 'VOIDED',
  STALE_DETECTED = 'STALE_DETECTED'
}

export interface StockOpnameSession {
  id: string;
  sessionCode: string;
  name: string;
  description?: string;
  warehouseId: string;
  warehouse?: any; // To be populated with Warehouse interface
  sessionDate: string;
  status: StockOpnameSessionStatus;
  countMode: StockOpnameCountMode;
  scopeType: StockOpnameScopeType;
  
  isSnapshotStale: boolean;
  freezeInventory: boolean;
  allowMultipleCounts: boolean;
  
  totalItems: number;
  countedItems: number;
  varianceItems: number;
  
  reviewerId?: string;
  reviewer?: any;
  approverId?: string;
  approver?: any;
  
  createdAt: string;
  updatedAt: string;
  
  assignedCounters?: any[];
  items?: StockOpnameItem[];
}

export interface StockOpnameItem {
  id: string;
  stockOpnameSessionId: string;
  
  productId?: string;
  productVariantId?: string;
  product?: any;
  productVariant?: any;
  sku?: string;
  
  snapshotOnHand: number;
  snapshotReserved: number;
  snapshotAvailable: number;
  
  finalCountQuantity?: number;
  finalDamagedQuantity?: number;
  finalPhysicalQuantity?: number;
  
  varianceQuantity: number;
  variancePercentage: number;
  
  status: StockOpnameItemStatus;
  
  countEntryCount: number;
  reservedOnlyWarning: boolean;
  
  lastCountedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockOpnameAuditLog {
  id: string;
  stockOpnameSessionId: string;
  action: StockOpnameAuditAction;
  actorId: string;
  actor?: any;
  notes?: string;
  metadata?: any;
  createdAt: string;
}

export interface CreateStockOpnameRequest {
  warehouseId: string;
  sessionDate: string;
  name: string;
  description?: string;
  countMode: StockOpnameCountMode;
  scopeType: StockOpnameScopeType;
  freezeInventory?: boolean;
  allowMultipleCounts?: boolean;
  
  productIds?: string[];
  productVariantIds?: string[];
  categoryIds?: string[];
  counterIds?: string[];
}

export interface StockOpnameCountInput {
  snapshotItemId: string;
  countedQuantity: number;
  damagedQuantity: number;
  notes?: string;
}

export interface SubmitCountsRequest {
  items: StockOpnameCountInput[];
}

export interface RecountRequest {
  snapshotItemIds: string[];
  reason?: string;
}

export interface ReviewApproveRequest {
  notes?: string;
}

export interface CancelVoidRequest {
  reason: string;
}
