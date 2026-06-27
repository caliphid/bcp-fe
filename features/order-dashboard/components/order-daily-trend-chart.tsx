import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { useTranslation } from "../../../hooks/use-translation";
import { OrderDashboardDailyTrendResponse } from "../../../types/order-dashboard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface OrderDailyTrendChartProps {
  data: OrderDashboardDailyTrendResponse['data'] | undefined;
  loading: boolean;
}

export function OrderDailyTrendChart({ data, loading }: OrderDailyTrendChartProps) {
  const { t } = useTranslation();
  if (loading) {
    return <div className="h-[350px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (!data || data.rows.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Daily Trend</CardTitle></CardHeader>
        <CardContent className="h-[250px] flex items-center justify-center text-slate-500">
          No daily trend data available for this range.
        </CardContent>
      </Card>
    );
  }

  const { currency, timezone, rows } = data;

  const formatCurrency = (val: number) => {
    if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return `${val}`;
  };

  const chartData = rows.map(item => ({
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    GrossSales: item.grossSales,
    NetSalesProfit: item.netSalesProfit
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("orderDashboard.dailyTrend.title")}</CardTitle>
        <CardDescription>Movement per day (Timezone: {timezone})</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrency} tick={{fill: '#94a3b8', fontSize: 11}} />
              <Tooltip 
                cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                formatter={(value: any, name: string) => [
                  new Intl.NumberFormat('id-ID', { style: 'currency', currency: currency || 'IDR', maximumFractionDigits: 0 }).format(Number(value)),
                  name === "GrossSales" ? t("orderDashboard.dailyTrend.grossSales") : t("orderDashboard.dailyTrend.netSalesProfit")
                ]}
                labelFormatter={(label) => `${label}`}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }}/>
              <Area type="monotone" dataKey="GrossSales" name={t("orderDashboard.dailyTrend.grossSales")} stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGross)" />
              <Area type="monotone" dataKey="NetSalesProfit" name={t("orderDashboard.dailyTrend.netSalesProfit")} stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
