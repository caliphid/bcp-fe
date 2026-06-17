import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { crewApi } from "../../features/crew/api";
import { extractErrorMessage } from "../../lib/error";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Crew } from "../../types/crew";

const schema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  joinedAt: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CrewFormProps {
  initialData?: Crew;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CrewForm({ initialData, onSuccess, onCancel }: CrewFormProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      position: initialData?.position || "",
      address: initialData?.address || "",
      joinedAt: initialData?.joinedAt ? initialData.joinedAt.split("T")[0] : "", // assume YYYY-MM-DD
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const payload = {
        ...data,
        phone: data.phone || undefined,
        position: data.position || undefined,
        address: data.address || undefined,
        joinedAt: data.joinedAt || undefined,
        notes: data.notes || undefined,
      };

      if (initialData) {
        await crewApi.updateCrew(initialData.id, payload);
      } else {
        await crewApi.createCrew(payload);
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
        <Label htmlFor="name">Crew Name</Label>
        <Input id="name" placeholder="e.g. Ahmad" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Position / Job Title</Label>
          <Input id="position" placeholder="e.g. Operator Sablon" {...register("position")} />
          {errors.position && <p className="text-sm text-red-500">{errors.position.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" placeholder="e.g. 08123456789" {...register("phone")} />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="joinedAt">Joined Date</Label>
        <Input id="joinedAt" type="date" {...register("joinedAt")} />
        {errors.joinedAt && <p className="text-sm text-red-500">{errors.joinedAt.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="e.g. Bandung" {...register("address")} />
        {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" placeholder="Optional notes" {...register("notes")} />
        {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialData ? "Update Crew" : "Create Crew"}
        </Button>
      </div>
    </form>
  );
}
