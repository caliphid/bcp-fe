"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usersApi } from "../../features/users/api";
import { extractErrorMessage } from "../../lib/error";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { User } from "../../types/auth";
import { SearchableSelect } from "@/components/ui/searchable-select";

const schema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  role: z.enum(["OWNER", "ADMIN_FINANCE", "STAFF_INPUT"]),
});

type FormData = z.infer<typeof schema>;

interface UpdateUserFormProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UpdateUserForm({ user, onSuccess, onCancel }: UpdateUserFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      name: user.name,
      role: user.role as "OWNER" | "ADMIN_FINANCE" | "STAFF_INPUT",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await usersApi.updateUser(user.id, data);
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Staff Name" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <SearchableSelect
          id="role"
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          {...register("role")}
        >
          <option value="STAFF_INPUT">Staff Input</option>
          <option value="ADMIN_FINANCE">Admin Finance</option>
          <option value="OWNER">Owner</option>
        </SearchableSelect>
        {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Update User"}
        </Button>
      </div>
    </form>
  );
}
