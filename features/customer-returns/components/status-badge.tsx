import React from "react";
import { CustomerReturnStatus, CustomerReturnType, ReturnShipmentStatus, RefundStatus, ReturnedItemCondition, ReturnResolutionType } from "../types";
import { cn } from "../../../lib/utils";

export const ReturnStatusBadge = ({ status }: { status: string }) => {
  let bg = "bg-slate-100 text-slate-800";
  switch (status) {
    case CustomerReturnStatus.REQUESTED: bg = "bg-amber-100 text-amber-800"; break;
    case CustomerReturnStatus.APPROVED: bg = "bg-blue-100 text-blue-800"; break;
    case CustomerReturnStatus.ITEM_RECEIVED: bg = "bg-indigo-100 text-indigo-800"; break;
    case CustomerReturnStatus.INSPECTED: bg = "bg-purple-100 text-purple-800"; break;
    case CustomerReturnStatus.REPLACEMENT_RESERVED: bg = "bg-fuchsia-100 text-fuchsia-800"; break;
    case CustomerReturnStatus.REPLACEMENT_SHIPPED: bg = "bg-pink-100 text-pink-800"; break;
    case CustomerReturnStatus.REFUND_PENDING: bg = "bg-orange-100 text-orange-800"; break;
    case CustomerReturnStatus.COMPLETED: bg = "bg-emerald-100 text-emerald-800"; break;
    case CustomerReturnStatus.REJECTED: 
    case CustomerReturnStatus.CANCELLED: bg = "bg-rose-100 text-rose-800"; break;
  }
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", bg)}>{status.replace(/_/g, " ")}</span>;
};

export const ReturnTypeBadge = ({ type }: { type: string }) => {
  let bg = "bg-slate-100 text-slate-800";
  switch (type) {
    case CustomerReturnType.CUSTOMER_RETURN: bg = "bg-indigo-100 text-indigo-800"; break;
    case CustomerReturnType.SIZE_EXCHANGE: bg = "bg-blue-100 text-blue-800"; break;
    case CustomerReturnType.PRODUCT_EXCHANGE: bg = "bg-violet-100 text-violet-800"; break;
    case CustomerReturnType.REFUND_ONLY: bg = "bg-amber-100 text-amber-800"; break;
    case CustomerReturnType.FAILED_DELIVERY: bg = "bg-rose-100 text-rose-800"; break;
  }
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", bg)}>{type.replace(/_/g, " ")}</span>;
};

export const ShipmentStatusBadge = ({ status }: { status: string }) => {
  let bg = "bg-slate-100 text-slate-800";
  switch (status) {
    case ReturnShipmentStatus.PENDING: bg = "bg-amber-100 text-amber-800"; break;
    case ReturnShipmentStatus.RECEIVED: bg = "bg-emerald-100 text-emerald-800"; break;
    case ReturnShipmentStatus.LOST: 
    case ReturnShipmentStatus.CANCELLED: bg = "bg-rose-100 text-rose-800"; break;
  }
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", bg)}>{status.replace(/_/g, " ")}</span>;
};

export const RefundStatusBadge = ({ status }: { status: string }) => {
  let bg = "bg-slate-100 text-slate-800";
  switch (status) {
    case RefundStatus.PENDING: bg = "bg-amber-100 text-amber-800"; break;
    case RefundStatus.POSTED: bg = "bg-emerald-100 text-emerald-800"; break;
    case RefundStatus.VOID: bg = "bg-rose-100 text-rose-800"; break;
  }
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", bg)}>{status.replace(/_/g, " ")}</span>;
};

export const ItemConditionBadge = ({ condition }: { condition: string }) => {
  let bg = "bg-slate-100 text-slate-800";
  switch (condition) {
    case ReturnedItemCondition.RESTOCKABLE: bg = "bg-emerald-100 text-emerald-800"; break;
    case ReturnedItemCondition.DAMAGED: bg = "bg-rose-100 text-rose-800"; break;
    case ReturnedItemCondition.LOST: bg = "bg-gray-100 text-gray-800"; break;
    case ReturnedItemCondition.NOT_RECEIVED: bg = "bg-amber-100 text-amber-800"; break;
  }
  return <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap", bg)}>{condition.replace(/_/g, " ")}</span>;
};

export const ResolutionTypeBadge = ({ type }: { type: string }) => {
  let bg = "bg-slate-100 text-slate-800";
  switch (type) {
    case ReturnResolutionType.REFUND: bg = "bg-amber-100 text-amber-800"; break;
    case ReturnResolutionType.REPLACEMENT: bg = "bg-blue-100 text-blue-800"; break;
    case ReturnResolutionType.PARTIAL_REFUND: bg = "bg-orange-100 text-orange-800"; break;
    case ReturnResolutionType.NO_COMPENSATION: bg = "bg-slate-200 text-slate-700"; break;
  }
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", bg)}>{type.replace(/_/g, " ")}</span>;
};
