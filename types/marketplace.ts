export type MarketplaceType =
  | 'SHOPEE'
  | 'TOKOPEDIA'
  | 'TIKTOK_SHOP'
  | 'LAZADA'
  | 'BLIBLI'
  | 'OTHER';

export type MarketplaceAccountStatus = 'ACTIVE' | 'INACTIVE';

export type MarketplaceSettlementStatus =
  | 'DRAFT'
  | 'VALIDATING'
  | 'NEEDS_REVIEW'
  | 'READY'
  | 'POSTED'
  | 'VOID'
  | 'FAILED';

export type SettlementPostingStatus = 'UNPOSTED' | 'POSTED' | 'VOID';

export type MarketplaceSettlementLineStatus =
  | 'MATCHED'
  | 'PARTIALLY_MATCHED'
  | 'UNMATCHED'
  | 'IGNORED'
  | 'ERROR';

export type MarketplaceSettlementLineType =
  | 'ORDER_PROCEEDS'
  | 'PLATFORM_FEE'
  | 'ADMIN_FEE'
  | 'SERVICE_FEE'
  | 'COMMISSION'
  | 'SHIPPING_CHARGE'
  | 'SHIPPING_SUBSIDY'
  | 'SHIPPING_ADJUSTMENT'
  | 'VOUCHER'
  | 'DISCOUNT'
  | 'TAX'
  | 'REFUND'
  | 'PENALTY'
  | 'OTHER_INCOME'
  | 'OTHER_DEDUCTION'
  | 'MANUAL_ADJUSTMENT';

export type MarketplaceAdjustmentDirection = 'INCREASE' | 'DECREASE';

export type MarketplaceCustomerLinkStatus =
  | 'LINKED'
  | 'UNLINKED'
  | 'MERGED_REDIRECT'
  | 'CUSTOMER_INACTIVE'
  | 'CUSTOMER_BLOCKED'
  | 'NOT_APPLICABLE';

export type MarketplaceSettlementWarningCode =
  | 'ORDER_CUSTOMER_UNLINKED'
  | 'CUSTOMER_MERGED_REDIRECT'
  | 'CUSTOMER_INACTIVE'
  | 'CUSTOMER_BLOCKED'
  | 'ORDER_CHANNEL_MISMATCH'
  | 'ORDER_NOT_FOUND'
  | 'DUPLICATE_SETTLEMENT'
  | 'DUPLICATE_LINE'
  | 'PARTIAL_MATCH'
  | 'RECONCILIATION_DIFFERENCE'
  | 'REFUND_UNMATCHED'
  | 'CUSTOMER_PII_RESTRICTED';

export interface MarketplaceAccount {
  id: string;
  code: string;
  name: string;
  marketplaceType: MarketplaceType;
  sellerAccountId?: string;
  businessUnitId: string;
  businessUnit?: { id: string; name: string };
  settlementAccountId?: string;
  settlementAccount?: { id: string; name: string };
  settlementClearingCategoryId?: string;
  settlementClearingCategory?: { id: string; name: string };
  defaultFeeCategoryId?: string;
  defaultRefundCategoryId?: string;
  defaultPenaltyCategoryId?: string;
  notes?: string;
  status: MarketplaceAccountStatus;
  updatedAt: string;
  createdAt: string;
}

export interface CreateMarketplaceAccountPayload {
  code: string;
  name: string;
  marketplaceType: MarketplaceType;
  sellerAccountId?: string;
  businessUnitId: string;
  settlementAccountId?: string;
  settlementClearingCategoryId?: string;
  defaultFeeCategoryId?: string;
  defaultRefundCategoryId?: string;
  defaultPenaltyCategoryId?: string;
  notes?: string;
}

export interface UpdateMarketplaceAccountPayload extends Partial<CreateMarketplaceAccountPayload> {}

export interface MarketplaceSettlement {
  id: string;
  settlementCode: string;
  marketplaceAccountId: string;
  marketplaceAccount?: MarketplaceAccount;
  externalSettlementId: string;
  settlementDate: string;
  payoutDate?: string;
  settlementPeriodStart?: string;
  settlementPeriodEnd?: string;
  settlementAccountId?: string;
  status: MarketplaceSettlementStatus;
  postingStatus: SettlementPostingStatus;
  notes?: string;
  summary: MarketplaceSettlementSummary;
  lines?: MarketplaceSettlementLine[];
  allocations?: MarketplaceSettlementAllocation[];
  auditLogs?: MarketplaceSettlementAuditLog[];
  transaction?: { id: string; transactionCode: string };
  updatedAt: string;
  createdAt: string;
}

export interface MarketplaceSettlementSummary {
  grossSettlementAmount: number;
  totalAdjustmentAmount: number;
  totalFeeAmount: number;
  totalRefundAmount: number;
  totalPenaltyAmount: number;
  netSettlementAmount: number;
  expectedSettlementAmount: number;
  reconciliationDifference: number;
}

export interface MarketplaceSettlementLine {
  id: string;
  settlementId: string;
  lineNumber: number;
  externalOrderId?: string;
  externalTransactionId?: string;
  lineType: MarketplaceSettlementLineType;
  direction: MarketplaceAdjustmentDirection;
  description?: string;
  rawCustomerName?: string;
  rawCustomerPhone?: string;
  rawCustomerAddress?: string;
  amount: number;
  netAmount: number;
  settlementAppliedAmount: number;
  status: MarketplaceSettlementLineStatus;
  customerLinkStatus: MarketplaceCustomerLinkStatus;
  warningCodes: MarketplaceSettlementWarningCode[];
  notes?: string;
}

export interface MarketplaceSettlementAllocation {
  id: string;
  settlementId: string;
  orderCodeSnapshot?: string;
  salesChannelSnapshot?: string;
  customerIdSnapshot?: string;
  customerNameSnapshot?: string;
  customerPhoneSnapshot?: string;
  customerAddressSnapshot?: string;
  customerStatusSnapshot?: string;
  grossAmount: number;
  feeAmount: number;
  refundAmount: number;
  taxAmount: number;
  penaltyAmount: number;
  netAmount: number;
}

export interface MarketplaceSettlementAuditLog {
  id: string;
  settlementId: string;
  action: string;
  description: string;
  actor: { id: string; name: string };
  createdAt: string;
}

export interface CreateMarketplaceSettlementPayload {
  marketplaceAccountId: string;
  businessUnitId: string;
  settlementDate: string;
  payoutDate?: string;
  settlementPeriodStart?: string;
  settlementPeriodEnd?: string;
  externalSettlementId: string;
  settlementAccountId?: string;
  notes?: string;
}

export interface UpdateMarketplaceSettlementPayload extends Partial<CreateMarketplaceSettlementPayload> {}

export interface AddSettlementLinesPayload {
  lines: {
    externalOrderId?: string;
    externalTransactionId?: string;
    lineType: MarketplaceSettlementLineType;
    direction: MarketplaceAdjustmentDirection;
    description?: string;
    rawCustomerName?: string;
    rawCustomerPhone?: string;
    rawCustomerAddress?: string;
    amount: number;
  }[];
}

export interface MarketplaceCustomerSummary {
  customerId?: string;
  customerName?: string;
  customerStatus?: string;
  totalOrderCount: number;
  grossAmount: number;
  netAmount: number;
}
