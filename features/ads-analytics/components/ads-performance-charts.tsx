import React, { useState } from "react";
import { createPortal } from "react-dom";
import { AdsDailyPerformanceItem, AdsMonthlyPerformanceItem } from "../../../types/ads";
import { formatCurrency, formatDate } from "../../debts/utils/formatters";

export function AdsDailyTrendChart({ data, loading }: { data: AdsDailyPerformanceItem[], loading: boolean }) {
  if (loading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-64 flex items-center justify-center">
        <p className="text-slate-500">Tidak ada data tren harian.</p>
      </div>
    );
  }

  // Find max revenue to scale bars
  const maxRevenue = Math.max(...data.map(d => parseFloat(d.totalRevenue ?? (d as any).revenue) || 0));

  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; item: any } | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-bold text-slate-800 mb-6">Daily Trend (Revenue & ROAS)</h3>
      <div className="flex h-48 items-end gap-2 overflow-x-auto pb-2">
        {data.slice(-30).map((item, i) => {
          const revStr = item.totalRevenue ?? (item as any).revenue;
          const rev = parseFloat(revStr) || 0;
          const profitStr = item.netProfit ?? (item as any).profit;
          const heightPct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
          const dateStr = item.date || (item as any).reportDate || "";
          return (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[40px] group relative h-full">
              <div className="flex-1 w-full flex items-end justify-center">
                <div 
                  className="w-full bg-indigo-100 rounded-t-md hover:bg-indigo-200 transition-colors relative cursor-pointer"
                  style={{ height: `${Math.max(5, heightPct)}%` }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ show: true, x: rect.left + rect.width / 2, y: rect.top, item });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-t-md opacity-50 pointer-events-none"
                    style={{ height: `${Math.min(100, (parseFloat(profitStr) / rev) * 100 || 0)}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-slate-500 truncate w-full text-center">
                {dateStr ? dateStr.split("-")[2] : ""}
              </span>
            </div>
          );
        })}
      </div>
      
      {tooltip?.show && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 10 }}
        >
          <p className="font-bold mb-1">
            {tooltip.item.date || (tooltip.item as any).reportDate 
              ? formatDate(tooltip.item.date || (tooltip.item as any).reportDate) 
              : "-"}
          </p>
          <p>Rev: {formatCurrency(tooltip.item.totalRevenue ?? (tooltip.item as any).revenue)}</p>
          <p>Profit: {formatCurrency(tooltip.item.netProfit ?? (tooltip.item as any).profit)}</p>
          <p>ROAS: {(tooltip.item.roas || 0).toFixed(2)}x</p>
        </div>,
        document.body
      )}
    </div>
  );
}

export function AdsMonthlyTrendChart({ data, loading }: { data: AdsMonthlyPerformanceItem[], loading: boolean }) {
  if (loading) {
    return <div className="h-64 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-64 flex items-center justify-center">
        <p className="text-slate-500">Tidak ada data bulanan.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => parseFloat(d.totalRevenue ?? (d as any).revenue) || 0));

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; item: any } | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <h3 className="font-bold text-slate-800 mb-6">Monthly Performance</h3>
      <div className="flex h-48 items-end gap-4 overflow-x-auto pb-2 justify-between">
        {data.map((item, i) => {
          const revStr = item.totalRevenue ?? (item as any).revenue;
          const rev = parseFloat(revStr) || 0;
          const profitStr = item.netProfit ?? (item as any).profit;
          const heightPct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
          const monthNum = item.month || (item as any).reportMonth || 1;
          const yearNum = item.year || (item as any).reportYear || new Date().getFullYear();
          return (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-[40px] group relative h-full">
              <div className="flex-1 w-full flex items-end justify-center">
                <div 
                  className="w-full bg-slate-100 rounded-t-md hover:bg-slate-200 transition-colors relative max-w-[60px] cursor-pointer"
                  style={{ height: `${Math.max(5, heightPct)}%` }}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ show: true, x: rect.left + rect.width / 2, y: rect.top, item });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-t-md opacity-40 pointer-events-none"
                    style={{ height: `${Math.min(100, (parseFloat(profitStr) / rev) * 100 || 0)}%` }}
                  />
                </div>
              </div>
              <span className="text-xs font-medium text-slate-600 truncate w-full text-center">
                {monthNames[monthNum - 1]}
              </span>

            </div>
          );
        })}
      </div>

      {tooltip?.show && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y - 10 }}
        >
          <p className="font-bold mb-1">
            {monthNames[(tooltip.item.month || (tooltip.item as any).reportMonth || 1) - 1]} {tooltip.item.year || (tooltip.item as any).reportYear || new Date().getFullYear()}
          </p>
          <p>Rev: {formatCurrency(tooltip.item.totalRevenue ?? (tooltip.item as any).revenue)}</p>
          <p>Profit: {formatCurrency(tooltip.item.netProfit ?? (tooltip.item as any).profit)}</p>
          <p>ROAS: {(tooltip.item.roas || 0).toFixed(2)}x</p>
        </div>,
        document.body
      )}
    </div>
  );
}
