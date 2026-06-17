import { MasterStatus } from "../../types/enums";

interface StatusBadgeProps {
  status: MasterStatus | string;
  onToggle?: () => void;
  canToggle?: boolean;
}

export function StatusBadge({ status, onToggle, canToggle = false }: StatusBadgeProps) {
  const isActive = status === MasterStatus.ACTIVE || status === "ACTIVE";

  return (
    <span 
      onClick={() => {
        if (canToggle && onToggle) onToggle();
      }}
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
        canToggle ? "cursor-pointer" : ""
      } ${
        isActive 
          ? 'bg-emerald-100 text-emerald-800' + (canToggle ? ' hover:bg-rose-100 hover:text-rose-800' : '')
          : 'bg-rose-100 text-rose-800' + (canToggle ? ' hover:bg-emerald-100 hover:text-emerald-800' : '')
      }`}
    >
      {isActive ? (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
      ) : (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-rose-500"></span>
      )}
      {status}
    </span>
  );
}
