import { useState } from "react";
import { useTranslation } from "../../../hooks/use-translation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { SalesByChannelTable } from "./drilldowns/sales-by-channel-table";
import { SalesByMarketplaceTable } from "./drilldowns/sales-by-marketplace-table";
import { SalesByProductTable } from "./drilldowns/sales-by-product-table";
import { SalesByVariantTable } from "./drilldowns/sales-by-variant-table";
import { SalesByCategoryTable } from "./drilldowns/sales-by-category-table";
import { SalesByCustomerTable } from "./drilldowns/sales-by-customer-table";
import { UnlinkedOrdersTable } from "./drilldowns/unlinked-orders-table";
import { useOrderDashboardStore } from "../store/order-dashboard-store";
import { useQuery } from "@tanstack/react-query";
import { orderDashboardApi } from "../api";
import { Button } from "../../../components/ui/button";
import { RefreshCw } from "lucide-react";

export function OrderDrilldowns() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("channel");
  const { filters } = useOrderDashboardStore();

  // Drilldown states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const resetPagination = () => {
    setPage(1);
    setSortBy(undefined);
    setSortOrder("desc");
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    resetPagination();
  };

  // Common query params for drilldowns
  const queryParams = {
    ...filters,
    page,
    limit,
    sortBy,
    sortOrder,
  };

  const {
    data: channelData,
    isLoading: channelLoading,
    refetch: channelRefetch,
  } = useQuery({
    queryKey: ["order-dashboard-sales-by-channel", filters],
    queryFn: () => orderDashboardApi.getSalesByChannel(filters),
    enabled: activeTab === "channel",
  });

  const {
    data: marketplaceData,
    isLoading: marketplaceLoading,
    refetch: marketplaceRefetch,
  } = useQuery({
    queryKey: ["order-dashboard-sales-by-marketplace", filters],
    queryFn: () => orderDashboardApi.getSalesByMarketplace(filters),
    enabled: activeTab === "marketplace",
  });

  const {
    data: productData,
    isLoading: productLoading,
    refetch: productRefetch,
  } = useQuery({
    queryKey: ["order-dashboard-sales-by-product", queryParams],
    queryFn: () => orderDashboardApi.getSalesByProduct(queryParams),
    enabled: activeTab === "product",
  });

  const {
    data: variantData,
    isLoading: variantLoading,
    refetch: variantRefetch,
  } = useQuery({
    queryKey: ["order-dashboard-sales-by-variant", queryParams],
    queryFn: () => orderDashboardApi.getSalesByProductVariant(queryParams),
    enabled: activeTab === "variant",
  });

  const {
    data: categoryData,
    isLoading: categoryLoading,
    refetch: categoryRefetch,
  } = useQuery({
    queryKey: ["order-dashboard-sales-by-category", queryParams],
    queryFn: () => orderDashboardApi.getSalesByCategory(queryParams),
    enabled: activeTab === "category",
  });

  const {
    data: customerData,
    isLoading: customerLoading,
    refetch: customerRefetch,
  } = useQuery({
    queryKey: ["order-dashboard-sales-by-customer", queryParams],
    queryFn: () => orderDashboardApi.getSalesByCustomer(queryParams),
    enabled: activeTab === "customer",
  });

  const {
    data: unlinkedData,
    isLoading: unlinkedLoading,
    refetch: unlinkedRefetch,
  } = useQuery({
    queryKey: ["order-dashboard-unlinked-orders", queryParams],
    queryFn: () => orderDashboardApi.getUnlinkedOrders(queryParams),
    enabled: activeTab === "unlinked",
  });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Detailed Breakdowns</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (activeTab === "channel") channelRefetch();
            if (activeTab === "marketplace") marketplaceRefetch();
            if (activeTab === "product") productRefetch();
            if (activeTab === "variant") variantRefetch();
            if (activeTab === "category") categoryRefetch();
            if (activeTab === "customer") customerRefetch();
            if (activeTab === "unlinked") unlinkedRefetch();
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="channel">Channel</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="variant">Variant</TabsTrigger>
            <TabsTrigger value="category">Category</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger
              value="unlinked"
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800"
            >
              {t("orderDashboard.drilldowns.unlinkedOrders")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="channel">
            <SalesByChannelTable
              data={channelData?.data}
              loading={channelLoading}
              meta={channelData?.meta}
            />
          </TabsContent>

          <TabsContent value="marketplace">
            <SalesByMarketplaceTable
              data={marketplaceData?.data}
              loading={marketplaceLoading}
            />
          </TabsContent>

          <TabsContent value="product">
            <SalesByProductTable
              data={productData?.data}
              loading={productLoading}
              meta={productData?.meta}
              page={page}
              limit={limit}
              setPage={setPage}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
            />
          </TabsContent>

          <TabsContent value="variant">
            <SalesByVariantTable
              data={variantData?.data}
              loading={variantLoading}
              meta={variantData?.meta}
              page={page}
              limit={limit}
              setPage={setPage}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
            />
          </TabsContent>

          <TabsContent value="category">
            <SalesByCategoryTable
              data={categoryData?.data}
              loading={categoryLoading}
              meta={categoryData?.meta}
              page={page}
              limit={limit}
              setPage={setPage}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
            />
          </TabsContent>

          <TabsContent value="customer">
            <SalesByCustomerTable
              data={customerData?.data}
              loading={customerLoading}
              meta={customerData?.meta}
              page={page}
              limit={limit}
              setPage={setPage}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
            />
          </TabsContent>

          <TabsContent value="unlinked">
            <UnlinkedOrdersTable
              data={unlinkedData?.data}
              loading={unlinkedLoading}
              meta={unlinkedData?.meta}
              page={page}
              limit={limit}
              setPage={setPage}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSort={handleSort}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
