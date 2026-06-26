import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { categoriesApi } from "../../features/categories/api";
import { extractErrorMessage } from "../../lib/error";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Category } from "../../types/category";
import { CategoryType } from "../../types/enums";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Modal } from "../ui/modal";
import { HelpCircle } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  type: z.nativeEnum(CategoryType),
  parentId: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CategoryFormProps {
  initialData?: Category;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function CategoryForm({ initialData, categories, onSuccess, onCancel }: CategoryFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      type: initialData?.type || CategoryType.OUT,
      parentId: initialData?.parentId || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload = {
        ...data,
        parentId: data.parentId || null,
        description: data.description || undefined,
      };

      if (initialData) {
        await categoriesApi.updateCategory(initialData.id, payload);
      } else {
        await categoriesApi.createCategory(payload);
      }
      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  // Filter out self and descendants to prevent circular hierarchy
  const validParents = categories.filter((c) => c.id !== initialData?.id);

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-500">Form Pengisian Kategori</span>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowTutorial(true)} className="text-indigo-600 hover:text-indigo-700 h-8 px-2">
          <HelpCircle className="w-4 h-4 mr-1.5" /> Panduan COA
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" placeholder="e.g. Utilities" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Transaction Type</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <SearchableSelect
              id="type"
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              {...field}
              onChange={(e: any) => field.onChange(e?.target?.value ?? e)}
            >
              {Object.values(CategoryType).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </SearchableSelect>
          )}
        />
        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Parent Category (Optional)</Label>
        <Controller
          control={control}
          name="parentId"
          render={({ field }) => (
            <SearchableSelect
              id="parentId"
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              {...field}
              onChange={(e: any) => field.onChange(e?.target?.value ?? e)}
            >
              <option value="">-- No Parent (Root Category) --</option>
              {validParents.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SearchableSelect>
          )}
        />
        {errors.parentId && <p className="text-sm text-red-500">{errors.parentId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="Optional notes" {...register("description")} />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>

    <Modal isOpen={showTutorial} onClose={() => setShowTutorial(false)} title="Tutorial: Kategori Produk & Chart of Accounts (COA)" className="max-w-2xl">
      <div className="space-y-6 text-slate-700 text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
        <p className="mb-2">Kategori di sistem ini tidak hanya berfungsi untuk mengelompokkan barang di katalog, tetapi juga bertindak sebagai <strong>Akun Akuntansi (Chart of Accounts)</strong> saat menjurnal transaksi otomatis.</p>
        
        <h4 className="font-bold text-slate-900 mb-3 text-base">Tipe Kategori (Transaction Type):</h4>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">IN (Pemasukan / Pendapatan)</span>
            <p className="text-xs text-slate-600">Gunakan tipe ini untuk kategori Penjualan Barang, Pendapatan Jasa, atau Diskon yang didapat. Saldo akun ini normalnya bertambah saat Anda melakukan penjualan.</p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">OUT (Pengeluaran / Beban / HPP)</span>
            <p className="text-xs text-slate-600">Gunakan tipe ini untuk Harga Pokok Penjualan (HPP), Biaya Operasional, Ongkos Kirim yang ditanggung, atau Biaya Admin Marketplace. Jangan sampai terbalik dengan IN, karena akan merusak Laba/Rugi Anda.</p>
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-4">
          <span className="font-semibold text-amber-800 block mb-1">Parent Category (Kategori Induk)</span>
          <p className="text-xs text-amber-700">Berfungsi membuat sub-kategori. Misalnya Parent: `Beban Operasional` ➔ Sub: `Beban Listrik`. Hal ini berguna agar laporan keuangan Anda bisa digrup (dikonsolidasi) dengan rapi.</p>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 mt-4">
          <Button type="button" onClick={() => setShowTutorial(false)}>Mengerti</Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
