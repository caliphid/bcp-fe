import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { useDailyTrend } from "../hooks/use-dashboard-widgets";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function DashboardDailyTrend() {
  const { data, loading, error } = useDailyTrend();

  if (loading) {
    return <div className="h-[300px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (error) {
    return (
      <Card className="border-red-100 bg-red-50/50">
        <CardContent className="p-6 text-red-600 text-sm">{error}</CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Daily Cashflow Trend</CardTitle></CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center text-slate-500">
          No data available
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(0)}M`;
    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}K`;
    return `Rp ${val}`;
  };

  const chartData = data.map(item => ({
    name: new Date(item.date).getDate().toString(),
    Net: Number(item.netCashflow)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Net Cashflow</CardTitle>
        <CardDescription>Movement of net cashflow per day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrency} tick={{fill: '#94a3b8', fontSize: 11}} />
              <Tooltip 
                cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                formatter={(value) => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value)), 'Net Cashflow']}
                labelFormatter={(label) => `Day ${label}`}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="Net" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
