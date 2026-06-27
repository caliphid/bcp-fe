export interface OrderDashboardOverviewResponse {
  data: {
    period: { dateFrom: string; dateTo: string };
    timezone: string;
    currency: string;
    snapshotReady: boolean;
    bookedSalesBasis: string;
    completedSalesBasis: string;
    feeResolutionMode: string;
    attentionRequired: {
      missingCostSnapshots: number;
      unsettledMarketplaceOrders: number;
      failedDeliveryReturns: number;
      reconciliationMismatch: boolean;
    };
    summary: {
      bookedSales: number;
      completedSales: number;
      cogs: number;
      grossProfit: number;
      netSalesProfit: number;
      totalOrders: number;
      completedOrders: number;
      returnRate: string;
      cancellationRate: string;
      fulfillmentRate: string;
      settlementCoverageRate: string;
    };
    orderStatusPipeline: {
      status: string;
      count: number;
    }[];
    fulfillmentPerformance: {
      avgFulfillmentTimeHours: number;
      onTimeRate: string;
    };
    shippingPerformance: {
      avgShippingTimeHours: number;
      deliveredRate: string;
    };
    customerMix: {
      newCustomers: number;
      returningCustomers: number;
    };
    returns: {
      totalReturnAmount: number;
      returnCount: number;
    };
    reconciliation: {
      grossSalesDifference: number;
      cogsDifference: number;
      channelGrossSalesDifference: number;
      channelCogsDifference: number;
      channelAdsCostDifference: number;
      refundDifference: number;
    };
  };
}

export interface MonthlyReportRow {
  month: string;
  orderCount: number;
  completedOrderCount: number;
  cancelledOrderCount: number;
  subtotal: number;
  discountAmount: number;
  grossSales: number;
  shippingAmount: number;
  taxAmount: number;
  salesOrderRefundAmount: number;
  customerRefundAmount: number;
  totalRefundAmount: number;
  netSales: number;
  estimatedMarketplaceFee: number;
  actualMarketplaceFee: number;
  effectiveMarketplaceFee: number;
  feeVariance: number;
  actualMarketplacePayout: number;
  cogs: number;
  grossProfit: number;
  adsCost: number;
  netSalesProfit: number;
}

export interface OrderDashboardMonthlyReportResponse {
  data: {
    timezone: string;
    currency: string;
    rows: MonthlyReportRow[];
  };
}

export interface DailyTrendRow {
  date: string;
  orderCount: number;
  completedOrderCount: number;
  grossSales: number;
  netSales: number;
  grossProfit: number;
  netSalesProfit: number;
  adsCost: number;
  unitsSold: number;
}

export interface OrderDashboardDailyTrendResponse {
  data: {
    timezone: string;
    currency: string;
    rows: DailyTrendRow[];
  };
}

export interface OrderDashboardStatusPipelineResponse {
  data: {
    orderStatus: Record<string, number>;
    paymentStatus: Record<string, number>;
    shipmentStatus: Record<string, number>;
    settlementStatus: Record<string, number>;
  };
}

export interface OrderDashboardReconciliationResponse {
  data: {
    grossSalesDifference: number;
    cogsDifference: number;
    channelGrossSalesDifference: number;
    channelCogsDifference: number;
    channelAdsCostDifference: number;
    refundDifference: number;
  };
}

export interface SalesByChannelRow {
  channel: string;
  orderCount: number;
  grossSales: number;
  estimatedMarketplaceFee: number;
  actualMarketplaceFee: number;
  effectiveMarketplaceFee: number;
  cogs: number;
  adsCost: number;
  grossProfit: number;
  netSalesProfit: number;
}

export interface OrderDashboardSalesByChannelResponse {
  data: SalesByChannelRow[];
  meta: {
    adsAllocationMethod: string;
  };
}

export interface SalesByMarketplaceRow {
  marketplaceType: string;
  marketplaceName: string;
  orderCount: number;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
}

export interface OrderDashboardSalesByMarketplaceResponse {
  data: SalesByMarketplaceRow[];
}

export interface SalesByProductRow {
  productId: string;
  productName: string;
  articleName: string;
  quantity: number;
  grossSales: number;
  cogs: number;
  grossProfit: number;
}

export interface OrderDashboardSalesByProductResponse {
  data: SalesByProductRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface SalesByProductVariantRow {
  productVariantId: string;
  sku: string;
  productName: string;
  variantName: string;
  quantity: number;
  grossSales: number;
  cogs: number;
  grossProfit: number;
}

export interface OrderDashboardSalesByProductVariantResponse {
  data: SalesByProductVariantRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface SalesByCategoryRow {
  categoryId: string | null;
  categoryName: string;
  quantity: number;
  grossSales: number;
  cogs: number;
  grossProfit: number;
}

export interface OrderDashboardSalesByCategoryResponse {
  data: SalesByCategoryRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface SalesByCustomerRow {
  customerId: string;
  customerCode: string;
  customerName: string;
  linked: boolean;
  orderCount: number;
  grossSales: number;
  paidAmount: number;
}

export interface OrderDashboardSalesByCustomerResponse {
  data: SalesByCustomerRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface UnlinkedOrderRow {
  id: string;
  orderCode: string;
  orderDate: string;
  customerName: string;
  salesChannel: string;
  status: string;
  paymentStatus: string;
  settlementStatus: string;
  grandTotal: number;
}

export interface OrderDashboardUnlinkedOrdersResponse {
  data: UnlinkedOrderRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
