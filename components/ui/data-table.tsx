import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Pagination } from "./pagination";
import { PaginationMeta } from "../../types/common";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  title?: string;
  description?: string;
  data: T[];
  columns: Column<T>[];
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  headerActions?: ReactNode;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  title,
  description,
  data,
  columns,
  meta,
  onPageChange,
  isLoading = false,
  emptyMessage = "No data found.",
  headerActions,
  onRowClick,
}: DataTableProps<T>) {
  return (
    <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {(title || headerActions) && (
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100/80 bg-slate-50/50 py-4">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/50 text-xs uppercase text-slate-400 font-semibold tracking-wider">
              <tr>
                {columns.map((col, index) => (
                  <th key={index} className={`px-6 py-4 ${col.className || ""}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center space-x-2 text-slate-400">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={`group hover:bg-slate-50/80 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className={`px-6 py-4 ${col.className || ""}`}>
                        {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? "") : null}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {meta && onPageChange && data.length > 0 && !isLoading && (
          <div className="px-6">
            <Pagination meta={meta} onPageChange={onPageChange} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
