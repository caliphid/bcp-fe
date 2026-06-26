import { BusinessUnit } from './business-unit';
import { User } from './auth';
import { SalesOrder } from './sales-order';

export enum CustomerType {
  RETAIL = 'RETAIL',
  RESELLER = 'RESELLER',
  WHOLESALE = 'WHOLESALE',
  CORPORATE = 'CORPORATE',
  MARKETPLACE = 'MARKETPLACE',
  OTHER = 'OTHER',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  MERGED = 'MERGED',
}

export enum CustomerSource {
  SHOPEE = 'SHOPEE',
  TOKOPEDIA = 'TOKOPEDIA',
  TIKTOK_SHOP = 'TIKTOK_SHOP',
  LAZADA = 'LAZADA',
  WHATSAPP = 'WHATSAPP',
  RESELLER = 'RESELLER',
  OFFLINE = 'OFFLINE',
  IMPORT = 'IMPORT',
  MANUAL = 'MANUAL',
  OTHER = 'OTHER',
}

export enum CustomerAddressType {
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
  BOTH = 'BOTH',
}

export enum CustomerDuplicateStatus {
  POSSIBLE_DUPLICATE = 'POSSIBLE_DUPLICATE',
  CONFIRMED_DUPLICATE = 'CONFIRMED_DUPLICATE',
  NOT_DUPLICATE = 'NOT_DUPLICATE',
  MERGED = 'MERGED',
}

export enum CustomerAuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  ACTIVATED = 'ACTIVATED',
  DEACTIVATED = 'DEACTIVATED',
  BLOCKED = 'BLOCKED',
  UNBLOCKED = 'UNBLOCKED',
  ADDRESS_ADDED = 'ADDRESS_ADDED',
  ADDRESS_UPDATED = 'ADDRESS_UPDATED',
  ADDRESS_DEACTIVATED = 'ADDRESS_DEACTIVATED',
  DEFAULT_ADDRESS_CHANGED = 'DEFAULT_ADDRESS_CHANGED',
  DUPLICATE_FLAGGED = 'DUPLICATE_FLAGGED',
  MERGED = 'MERGED',
  SALES_ORDER_LINKED = 'SALES_ORDER_LINKED',
  RECEIVABLE_LINKED = 'RECEIVABLE_LINKED',
}

export interface CustomerAddress {
  id: string;
  label?: string;
  addressType: CustomerAddressType;
  recipientName: string;
  recipientPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  countryCode: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  isActive: boolean;
}

export interface CustomerAuditLog {
  id: string;
  action: CustomerAuditAction;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  actor?: User;
}

export interface CustomerSummary {
  firstOrderAt?: string;
  lastOrderAt?: string;
  totalOrderCount: number;
  principalAmount: string;
  amountCollected: string;
  remainingBalance: string;
}

export interface Customer {
  id: string;
  customerCode: string;
  customerType: CustomerType;
  status: CustomerStatus;
  source: CustomerSource;
  fullName: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  companyName?: string;
  taxNumber?: string;
  notes?: string;
  tags?: string[];
  businessUnitId?: string;
  businessUnit?: BusinessUnit;
  mergedIntoCustomerId?: string;
  
  summary?: CustomerSummary;
  addresses?: CustomerAddress[];
  auditLogs?: CustomerAuditLog[];
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerAddressRequest {
  label?: string;
  addressType?: CustomerAddressType;
  recipientName: string;
  recipientPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  village?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  countryCode?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export interface CreateCustomerRequest {
  fullName: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  companyName?: string;
  taxNumber?: string;
  businessUnitId?: string;
  customerType?: CustomerType;
  source?: CustomerSource;
  notes?: string;
  tags?: string[];
  addresses?: CreateCustomerAddressRequest[];
}

export type UpdateCustomerRequest = Partial<Omit<CreateCustomerRequest, 'addresses'>> & {
  status?: CustomerStatus;
};

export interface UpdateCustomerAddressRequest extends Partial<CreateCustomerAddressRequest> {
  isActive?: boolean;
}

export interface MergeCustomerRequest {
  targetCustomerId: string;
  reason: string;
}

export interface CustomerDuplicateCandidate {
  id: string;
  matchedBy: string[];
  status: CustomerDuplicateStatus;
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: User;
  customerA: Customer;
  customerB: Customer;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewDuplicateRequest {
  status: CustomerDuplicateStatus;
  reviewNotes?: string;
}

export interface BackfillSalesOrdersRequest {
  dryRun?: boolean;
  limit?: number;
}

export interface BackfillLinkedItem {
  salesOrderId: string;
  receivableId?: string;
  customerId: string;
  linkedSalesOrder: boolean;
  linkedReceivable: boolean;
  source: string;
}

export interface BackfillUnresolvedItem {
  salesOrderId: string;
  receivableId?: string;
  reason: string;
  resolution: string;
}

export interface BackfillSalesOrdersResponse {
  scanned: number;
  linked: BackfillLinkedItem[];
  unresolved: BackfillUnresolvedItem[];
  summary: {
    salesOrdersLinked: number;
    receivablesLinked: number;
    unresolved: number;
  };
  dryRun: boolean;
}
