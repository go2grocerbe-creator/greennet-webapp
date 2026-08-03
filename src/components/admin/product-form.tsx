"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductFormState } from "@/lib/admin/product-actions";

type ProductFormDefaults = {
  title: string;
  summary: string;
  description: string;
  image: string | null;
  sortOrder: number;
};

type ProductFormProps = {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  productId?: string;
  defaultValues?: ProductFormDefaults;
  submitLabel: string;
};

/** Shared by the create and edit pages — same shape as ServiceForm. */
export function ProductForm({ action, productId, defaultValues, submitLabel }: ProductFormProps) {
  const [state, formAction, isPending] = useActionState<ProductFormState, FormData>(
    action,
    undefined,
  );
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5" noValidate>
      {productId && <input type="hidden" name="id" value={productId} />}

      {state?.error && (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm"
        >
          {state.error}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">
          Title <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaultValues?.title}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.title)}
          aria-describedby={fieldErrors.title ? "title-error" : undefined}
        />
        {fieldErrors.title && (
          <p id="title-error" role="alert" className="text-destructive text-sm">
            {fieldErrors.title[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="summary">
          Short description <span aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={defaultValues?.summary}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.summary)}
          aria-describedby={fieldErrors.summary ? "summary-error" : undefined}
        />
        {fieldErrors.summary && (
          <p id="summary-error" role="alert" className="text-destructive text-sm">
            {fieldErrors.summary[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">
          Full description <span aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={defaultValues?.description}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.description)}
          aria-describedby={fieldErrors.description ? "description-error" : undefined}
        />
        {fieldErrors.description && (
          <p id="description-error" role="alert" className="text-destructive text-sm">
            {fieldErrors.description[0]}
          </p>
        )}
      </div>

      <div className="border-border bg-muted/40 rounded-lg border p-4 text-sm">
        <input type="hidden" name="image" value={defaultValues?.image ?? ""} />
        <p className="text-foreground font-medium">Product media is held for rights review</p>
        <p className="text-muted-foreground mt-1 leading-relaxed">
          Existing image references are preserved, but public product media stays hidden until the
          Supabase media record and usage rights are confirmed.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sortOrder">Display order</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={defaultValues?.sortOrder ?? ""}
          aria-invalid={Boolean(fieldErrors.sortOrder)}
          aria-describedby={fieldErrors.sortOrder ? "sortOrder-error" : undefined}
        />
        {fieldErrors.sortOrder && (
          <p id="sortOrder-error" role="alert" className="text-destructive text-sm">
            {fieldErrors.sortOrder[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        data-testid="product-form-submit"
        disabled={isPending}
        aria-busy={isPending}
        className="self-start"
      >
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
