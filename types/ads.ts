import { BusinessUnit } from "./business-unit";
import { User } from "./auth";
import { Transaction } from "./transaction";

// --- Enums & Basic Types ---
export type AdPlatformStatus = "ACTIVE" | "INACTIVE";
export type AdCampaignStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "INACTIVE";
export type AdsReportStatus = "DRAFT" | "POSTED" | "VOID";

// --- Ad Platforms ---
export interface AdPlatformItem {
  id: string;
  name: string;
  description: string | null;
  status: AdPlatformStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdPlatformPayload {
  name: string;
  description?: string | null;
}

export interface UpdateAdPlatformPayload extends CreateAdPlatformPayload {}

// --- Ad Campaigns ---
export interface AdCampaignItem {
  id: string;
  campaignCode: string;
  businessUnit: BusinessUnit;
  platform: AdPlatformItem;
  name: string;
  externalCampaignId: string | null;
  startDate: string;
  endDate: string | null;
  budget: string | null;
  notes: string | null;
  status: AdCampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdCampaignPayload {
  businessUnitId: string;
  platformId: string;
  name: string;
  externalCampaignId?: string | null;
  startDate: string;
  endDate?: string | null;
  budget?: number | null;
  notes?: string | null;
}

export interface UpdateAdCampaignPayload extends Partial<CreateAdCampaignPayload> {}

export interface UpdateAdCampaignStatusPayload {
  status: AdCampaignStatus;
}

// --- Ads Reports ---
export interface AdsReportItemRow {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  orderCount: number;
  unitHpp: string;
  unitSellingPrice: string;
  notes: string | null;
}

export interface AdsReportItem {
  id: string;
  reportCode: string;
  reportDate: string;
  businessUnit: BusinessUnit;
  platform: AdPlatformItem;
  campaign: AdCampaignItem | null;
  totalQuantity: number;
  totalOrders: number;
  totalRevenue: string;
  totalHpp: string;
  adSpend: string;
  netProfit: string;
  roas: number;
  profitMargin: number;
  status: AdsReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdsReportDetail extends AdsReportItem {
  platformFee: string;
  taxAmount: string;
  otherCost: string;
  grossProfit: string;
  costPerOrder: string;
  breakEvenRoas: number;
  notes: string | null;
  revenueAccount?: { id: string; name: string } | null;
  expenseAccount?: { id: string; name: string } | null;
  linkedTransactions?: Transaction[];
  voidReason?: string | null;
  voidedAt?: string | null;
  voidedBy?: User | null;
  createdBy?: User | null;
  updatedBy?: User | null;
  items: AdsReportItemRow[];
}

// --- Payloads for Ads Reports ---
export interface CreateAdsReportItemPayload {
  productId: string;
  quantity: number;
  orderCount: number;
  unitHpp: number;
  unitSellingPrice: number;
  notes?: string | null;
}

export interface CreateAdsReportPayload {
  reportDate: string;
  businessUnitId: string;
  platformId: string;
  campaignId?: string | null;
  revenueAccountId?: string | null;
  expenseAccountId?: string | null;
  totalOrders?: number;
  adSpend?: number;
  platformFee?: number;
  taxAmount?: number;
  otherCost?: number;
  notes?: string | null;
  items: CreateAdsReportItemPayload[];
}

export interface UpdateAdsReportPayload extends Partial<Omit<CreateAdsReportPayload, "items">> {}

export interface PostAdsReportPayload {
  revenueAccountId: string;
  expenseAccountId: string;
  revenueCategoryId?: string | null;
  adSpendCategoryId?: string | null;
  platformFeeCategoryId?: string | null;
  taxCategoryId?: string | null;
  otherCostCategoryId?: string | null;
}

export interface VoidAdsReportPayload {
  voidReason: string;
}

// --- Analytics Data ---
export interface AdsSummaryData {
  totalReports: number;
  totalQuantity: number;
  totalOrders: number;
  totalRevenue: string;
  totalHpp: string;
  totalAdSpend: string;
  totalPlatformFee: string;
  totalTax: string;
  totalOtherCost: string;
  grossProfit: string;
  netProfit: string;
  roas: number;
  profitMargin: number;
  costPerOrder: string;
  profitableReportCount: number;
  lossReportCount: number;
}

export interface AdsProductPerformanceItem {
  productId: string;
  productName: string;
  quantity: number;
  orders: number;
  revenue: string;
  hpp: string;
  allocatedAdSpend: string;
  estimatedNetProfit: string;
  estimatedMargin: number;
}

export interface AdsPlatformPerformanceItem {
  platformId: string;
  platformName: string;
  reportsCount: number;
  totalRevenue: string;
  totalAdSpend: string;
  netProfit: string;
  roas: number;
}

export interface AdsCampaignPerformanceItem {
  campaignId: string | null;
  campaignName: string;
  reportsCount: number;
  totalRevenue: string;
  totalAdSpend: string;
  netProfit: string;
  roas: number;
}

export interface AdsMonthlyPerformanceItem {
  month: number;
  year: number;
  totalRevenue: string;
  totalAdSpend: string;
  netProfit: string;
  roas: number;
}

export interface AdsDailyPerformanceItem {
  date: string;
  totalRevenue: string;
  totalAdSpend: string;
  netProfit: string;
  roas: number;
}
