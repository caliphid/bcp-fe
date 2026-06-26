import { MarketplaceAccount } from "../../../types/marketplace";
import { useTranslation } from "../../../hooks/use-translation";
import dayjs from "dayjs";
import { CheckCircle2, Ban, Building2, Wallet, Tags, ScrollText, Calendar, Info, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Button } from "../../../components/ui/button";

interface MarketplaceAccountDetailProps {
  data: MarketplaceAccount;
}

export function MarketplaceAccountDetail({ data }: MarketplaceAccountDetailProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const { t } = useTranslation();

  const renderStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-sm font-semibold"><CheckCircle2 className="w-4 h-4"/> {t('common.status.active')}</span>;
      case 'INACTIVE':
        return <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-sm font-semibold"><Ban className="w-4 h-4"/> {t('common.status.inactive')}</span>;
      default:
        return <span className="text-sm font-semibold px-2.5 py-1 rounded-md bg-slate-100">{status}</span>;
    }
  };

  const InfoItem = ({ label, value, icon: Icon }: any) => (
    <div className="flex flex-col gap-1.5 p-4 bg-slate-50 rounded-xl border border-slate-100/50">
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        {label}
      </div>
      <div className="text-slate-900 font-medium">{value || '-'}</div>
    </div>
  );

  return (
    <>
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Account Details</h3>
          <p className="text-sm text-slate-500 mt-1">Detailed information about this marketplace account.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTutorial(true)} 
            className="bg-white hover:bg-slate-50 text-indigo-600 border-indigo-200"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Penjelasan Halaman
          </Button>
          {renderStatus(data.status)}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* General Info */}
        <section>
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-primary-500" />
            General Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem label="Name" value={data.name} />
            <InfoItem label="Code" value={data.code} />
            <InfoItem label="Marketplace Type" value={data.marketplaceType} />
            <InfoItem label="Seller Account ID" value={data.sellerAccountId} />
            <InfoItem label="Business Unit" value={(data as any).businessUnit?.name} icon={Building2} />
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Settlement Info */}
        <section>
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Settlement Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem 
              label="Settlement Account" 
              value={(data as any).settlementAccount?.name ? `${(data as any).settlementAccount.name}${(data as any).settlementAccount.bankName ? ` - ${(data as any).settlementAccount.bankName}` : ''}${(data as any).settlementAccount.accountNumber ? ` (${(data as any).settlementAccount.accountNumber})` : ''}` : '-'} 
            />
            <InfoItem label="Clearing Category" value={(data as any).settlementClearingCategory?.name} icon={Tags} />
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Categories */}
        <section>
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Tags className="w-4 h-4 text-amber-500" />
            Default Categories
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoItem label="Default Fee Category" value={(data as any).defaultFeeCategory?.name} />
            <InfoItem label="Default Refund Category" value={(data as any).defaultRefundCategory?.name} />
            <InfoItem label="Default Penalty Category" value={(data as any).defaultPenaltyCategory?.name} />
          </div>
        </section>

        <hr className="border-slate-100" />

        {/* Notes & Metadata */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-slate-500" />
                Notes
              </h4>
              <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-700 leading-relaxed border border-slate-100/50">
                {data.notes || <span className="text-slate-400 italic">No notes provided.</span>}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                System Data
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem label="Created At" value={dayjs(data.createdAt).format("DD MMM YYYY, HH:mm")} />
                <InfoItem label="Updated At" value={dayjs(data.updatedAt).format("DD MMM YYYY, HH:mm")} />
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
    
    <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Detail Marketplace Account" className="max-w-3xl">
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
        <p className="mb-2">Halaman ini menampilkan semua informasi dan konfigurasi akun Marketplace yang didaftarkan. Pengaturan akun ini sangat penting untuk proses otomatisasi penjurnalan settlement (rekonsiliasi).</p>
        
        <h4 className="font-bold text-slate-900 mb-3 text-base">Arti Konfigurasi Akun:</h4>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">Settlement Account</span>
            <p className="text-xs text-slate-600">Rekening bank utama tempat pihak marketplace mencairkan (transfer) dana hasil penjualan untuk akun ini.</p>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">Clearing Category</span>
            <p className="text-xs text-slate-600">Ketika pesanan selesai, dana awalnya masuk ke kategori ini (dianggap sebagai Piutang Marketplace). Saat dana cair, sistem akan memindahkan saldonya dari kategori ini ke Settlement Account.</p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">Default Fee, Refund, & Penalty Categories</span>
            <p className="text-xs text-slate-600">Kategori akun beban default untuk mencatat potongan biaya admin, ongkir, denda, atau pengembalian dana yang dibebankan pihak marketplace pada setiap settlement.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
          <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
