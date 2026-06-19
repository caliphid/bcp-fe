import { ReactNode } from "react";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  backHref?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, description, children, backHref }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {backHref && (
            <Link href={backHref} className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        </div>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
}
