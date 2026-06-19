import React, { useState } from "react";
import { ReceivableDetail, ReceivableCollection, ReceivableWriteOff } from "@/types/receivable";
import { formatMoney, formatDate, mapReceivableStatusBadge, mapReceivableTypeLabel, mapCollectionMethodLabel } from "../../utils/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { ExternalLink, Receipt, AlertCircle, Trash2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

interface ReceivableDetailViewProps {
  receivable: ReceivableDetail;
  collections: ReceivableCollection[];
  writeOffs: ReceivableWriteOff[];
  onAddCollection: () => void;
  onAddWriteOff: () => void;
  onVoidCollection: (id: string) => void;
  onVoidWriteOff: (id: string) => void;
}

export function ReceivableDetailView({
  receivable,
  collections,
  writeOffs,
  onAddCollection,
  onAddWriteOff,
  onVoidCollection,
  onVoidWriteOff,
}: ReceivableDetailViewProps) {
  const { user } = useAuthStore();
  const isOwner = user?.role === "OWNER";
  const isReadonly = user?.role === "STAFF_INPUT";
  
  const canModify = !isReadonly && ["ACTIVE", "PARTIALLY_PAID", "OVERDUE"].includes(receivable.status);

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-500 mb-1">Principal Amount</div>
            <div className="text-2xl font-bold text-slate-900">{formatMoney(receivable.principalAmount)}</div>
            <div className="text-sm text-slate-500 mt-1">Status: {mapReceivableStatusBadge(receivable.status)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-500 mb-1">Collected</div>
            <div className="text-2xl font-bold text-emerald-600">{formatMoney(receivable.amountCollected)}</div>
            <div className="text-sm text-slate-500 mt-1">
              Progress: {receivable.progressPercentage.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-500 mb-1">Remaining Balance</div>
            <div className="text-2xl font-bold text-rose-600">{formatMoney(receivable.remainingBalance)}</div>
            {parseFloat(receivable.writtenOffAmount) > 0 && (
              <div className="text-sm text-rose-500 mt-1">Written Off: {formatMoney(receivable.writtenOffAmount)}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receivable Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-slate-500">Kode</div>
                <div className="font-medium">{receivable.receivableCode}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Tipe</div>
                <div className="font-medium">{mapReceivableTypeLabel(receivable.receivableType)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Judul</div>
                <div className="font-medium">{receivable.title}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Pihak</div>
                <div className="font-medium">{receivable.externalParty.name}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Unit Bisnis</div>
                <div className="font-medium">{receivable.businessUnit?.name || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Tgl Mulai</div>
                <div className="font-medium">{formatDate(receivable.receivableDate)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Jatuh Tempo</div>
                <div className="font-medium">{formatDate(receivable.dueDate)}</div>
              </div>
              {receivable.description && (
                <div>
                  <div className="text-xs text-slate-500">Deskripsi</div>
                  <div className="text-sm">{receivable.description}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {receivable.disbursementTransaction && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Linked Disbursement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500">Kode Transaksi</div>
                  <div className="font-medium text-indigo-600 flex items-center gap-1">
                    {receivable.disbursementTransaction.transactionCode}
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Akun</div>
                  <div className="font-medium">{receivable.disbursementAccount?.name || "-"}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Transactions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Collections</CardTitle>
              {canModify && (
                <Button size="sm" onClick={onAddCollection}>
                  <Receipt className="h-4 w-4 mr-2" /> Record Collection
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {collections.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">No collections recorded yet.</div>
              ) : (
                <div className="space-y-4">
                  {collections.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.collectionCode}</span>
                          <span className="text-xs text-slate-500">{formatDate(c.collectionDate)}</span>
                          {c.status === "VOID" && (
                            <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">VOIDED</span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {mapCollectionMethodLabel(c.method)} {c.account ? `via ${c.account.name}` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`font-bold ${c.status === "VOID" ? "text-slate-400 line-through" : "text-emerald-600"}`}>
                          {formatMoney(c.amount)}
                        </div>
                        {isOwner && c.status !== "VOID" && (
                          <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => onVoidCollection(c.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {(writeOffs.length > 0 || (isOwner && canModify)) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" /> Write-Offs
                </CardTitle>
                {isOwner && canModify && (
                  <Button size="sm" variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50" onClick={onAddWriteOff}>
                    Record Write-Off
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {writeOffs.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-sm">No write-offs recorded.</div>
                ) : (
                  <div className="space-y-4">
                    {writeOffs.map(w => (
                      <div key={w.id} className="flex items-center justify-between p-4 border border-rose-100 bg-rose-50/30 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-rose-900">{w.writeOffCode}</span>
                            <span className="text-xs text-rose-600">{formatDate(w.writeOffDate)}</span>
                            {w.status === "VOID" && (
                              <span className="text-xs font-semibold text-rose-500 bg-rose-100 px-2 py-0.5 rounded">VOIDED</span>
                            )}
                          </div>
                          <div className="text-sm text-rose-800 mt-1 line-clamp-2">{w.reason}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={`font-bold ${w.status === "VOID" ? "text-slate-400 line-through" : "text-rose-600"}`}>
                            {formatMoney(w.amount)}
                          </div>
                          {isOwner && w.status !== "VOID" && (
                            <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-700 hover:bg-rose-100" onClick={() => onVoidWriteOff(w.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
