import { AccountSummary } from "../../../types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Wallet, Building2 } from "lucide-react";

interface Props {
  data: AccountSummary[];
  isLoading: boolean;
}

export function TransactionAccountSummary({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Balances</CardTitle>
        </CardHeader>
        <CardContent className="h-64 animate-pulse bg-slate-100 rounded-md m-6" />
      </Card>
    );
  }

  const formatCurrency = (val: string) => {
    const num = Number(val);
    return isNaN(num) ? "Rp 0" : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Account Balances</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No account data.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((acc) => {
              const isActive = acc.status === 'ACTIVE';
              return (
                <div key={acc.accountId} className={`p-4 rounded-xl border border-slate-100 ${isActive ? 'bg-slate-50' : 'bg-slate-50 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                        <Wallet className={`h-4 w-4 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{acc.accountName}</p>
                        <p className="text-xs text-slate-500">{acc.accountType}</p>
                      </div>
                    </div>
                    {acc.businessUnit && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-100">
                        <Building2 className="h-3 w-3" />
                        {acc.businessUnit.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1">Current Balance</p>
                      <p className={`text-lg font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                        {formatCurrency(acc.currentBalance)}
                      </p>
                    </div>
                    {!isActive && (
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
