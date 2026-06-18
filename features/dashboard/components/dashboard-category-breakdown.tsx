import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { useCategoryBreakdown } from "../hooks/use-dashboard-widgets";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useDashboardStore } from "../store/dashboard-store";

const COLORS_OUT = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4', '#6366f1', '#a855f7', '#ec4899'];
const COLORS_IN = ['#10b981', '#14b8a6', '#0ea5e9', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316'];

export function DashboardCategoryBreakdown() {
  const { data, loading } = useCategoryBreakdown();
  const { setFilter, filters } = useDashboardStore();

  if (loading) {
    return <div className="h-[400px] bg-slate-100 rounded-lg animate-pulse" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-slate-500">
          No categories found for this period
        </CardContent>
      </Card>
    );
  }

  // Split into IN and OUT
  const outData = data.filter(d => d.categoryType === "OUT");
  const inData = data.filter(d => d.categoryType === "IN");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // The pie chart shows the breakdown of Expenses by default, or Income if there's a filter, but let's just do Expenses for the pie since it's most common
  const chartData = outData.length > 0 ? outData : inData;
  const isOut = outData.length > 0;
  const colors = isOut ? COLORS_OUT : COLORS_IN;

  const pieData = chartData.map(d => ({
    name: d.categoryName,
    value: Number(d.totalAmount),
    percentage: d.percentage
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Category Breakdown</CardTitle>
        <CardDescription>Top {isOut ? "expenses" : "income"} by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col xl:flex-row gap-8 items-center justify-center pb-8 min-w-0">
        <div className="h-[250px] w-[250px] shrink-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 w-full max-w-sm space-y-4">
          {chartData.slice(0, 5).map((item, index) => (
            <div 
              key={item.categoryId} 
              className="flex flex-col gap-1 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors -mx-2"
              onClick={() => setFilter("categoryId", filters.categoryId === item.categoryId ? "" : item.categoryId)}
            >
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className={`font-medium ${filters.categoryId === item.categoryId ? "text-indigo-600" : "text-slate-700"}`}>
                    {item.categoryName}
                  </span>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(Number(item.totalAmount))}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div 
                  className="h-1.5 rounded-full" 
                  style={{ width: `${item.percentage}%`, backgroundColor: colors[index % colors.length] }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                <span>{item.transactionCount} trx</span>
                <span>{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
