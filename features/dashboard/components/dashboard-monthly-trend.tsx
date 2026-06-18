import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { useMonthlyTrend } from "../hooks/use-dashboard-widgets";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function DashboardMonthlyTrend() {
  const { data, loading } = useMonthlyTrend();

  if (loading) {
    return <div className="h-[400px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Monthly Cashflow Trend</CardTitle></CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-slate-500">
          No data available for the selected period
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
    name: item.monthName.substring(0, 3),
    Income: Number(item.totalIn),
    Expense: Number(item.totalOut)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrency} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value))}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Legend wrapperStyle={{paddingTop: '20px'}} />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
