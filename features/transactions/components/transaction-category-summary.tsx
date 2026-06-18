import { CategorySummary } from "../../../types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

interface Props {
  data: CategorySummary[];
  isLoading: boolean;
}

export function TransactionCategorySummary({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-64 animate-pulse bg-slate-100 rounded-md m-6" />
      </Card>
    );
  }

  const formatCurrency = (val: string) => {
    const num = Number(val);
    return isNaN(num) ? "Rp 0" : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const inCategories = data.filter(c => c.categoryType === 'IN');
  const outCategories = data.filter(c => c.categoryType === 'OUT');

  const renderList = (categories: CategorySummary[], title: string, colorClass: string) => (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-3">{title}</h4>
      {categories.length === 0 ? (
        <p className="text-sm text-slate-400 italic">No data available.</p>
      ) : (
        <div className="space-y-3">
          {categories.slice(0, 5).map(c => (
            <div key={c.categoryId} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800">{c.categoryName}</p>
                <p className="text-xs text-slate-500">{c.transactionCount} transactions</p>
              </div>
              <span className={`text-sm font-bold ${colorClass}`}>
                {formatCurrency(c.totalAmount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {renderList(inCategories, "Highest Income", "text-emerald-600")}
          {renderList(outCategories, "Highest Expenses", "text-red-600")}
        </div>
      </CardContent>
    </Card>
  );
}
