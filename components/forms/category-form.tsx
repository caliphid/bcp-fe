import { useState } from "react";
import { useForm } from "react-hook-form";
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

  const {
    register,
    handleSubmit,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <select
          id="type"
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          {...register("type")}
        >
          {Object.values(CategoryType).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Parent Category (Optional)</Label>
        <select
          id="parentId"
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          {...register("parentId")}
        >
          <option value="">-- No Parent (Root Category) --</option>
          {validParents.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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
  );
}
