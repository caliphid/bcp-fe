import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { productCategoriesApi } from "../api";
import { ProductCategory, CreateProductCategoryRequest } from "../../../types/product-category";
import { extractErrorMessage } from "../../../lib/error";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Alert, AlertDescription } from "../../../components/ui/alert";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  initialData?: ProductCategory;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductCategoryForm({ initialData, onSuccess, onCancel }: Props) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload: CreateProductCategoryRequest = {
        name: data.name,
        description: data.description || undefined,
      };

      if (initialData) {
        await productCategoriesApi.updateProductCategory(initialData.id, payload);
      } else {
        await productCategoriesApi.createProductCategory(payload);
      }

      onSuccess();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Category Name <span className="text-rose-500">*</span></Label>
        <Input placeholder="e.g. Shirts, Electronics" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea rows={3} placeholder="Optional description..." {...register("description")} />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create"}
        </Button>
      </div>
    </form>
  );
}
