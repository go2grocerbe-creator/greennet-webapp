"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ServiceFormState } from "@/lib/admin/service-actions";

type ServiceFormDefaults = {
  title: string;
  summary: string;
  body: string;
  icon: string | null;
  sortOrder: number;
};

type ServiceFormProps = {
  action: (state: ServiceFormState, formData: FormData) => Promise<ServiceFormState>;
  serviceId?: string;
  defaultValues?: ServiceFormDefaults;
  submitLabel: string;
};

/** Shared by the create and edit pages — same fields, different bound server action. */
export function ServiceForm({ action, serviceId, defaultValues, submitLabel }: ServiceFormProps) {
  const [state, formAction, isPending] = useActionState<ServiceFormState, FormData>(
    action,
    undefined,
  );
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5" noValidate>
      {serviceId && <input type="hidden" name="id" value={serviceId} />}

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
        <Label htmlFor="body">
          Full description <span aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="body"
          name="body"
          rows={6}
          defaultValue={defaultValues?.body}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.body)}
          aria-describedby={fieldErrors.body ? "body-error" : undefined}
        />
        {fieldErrors.body && (
          <p id="body-error" role="alert" className="text-destructive text-sm">
            {fieldErrors.body[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="icon">Icon</Label>
        <Input
          id="icon"
          name="icon"
          defaultValue={defaultValues?.icon ?? ""}
          aria-invalid={Boolean(fieldErrors.icon)}
          aria-describedby={fieldErrors.icon ? "icon-error" : undefined}
        />
        {fieldErrors.icon && (
          <p id="icon-error" role="alert" className="text-destructive text-sm">
            {fieldErrors.icon[0]}
          </p>
        )}
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
        data-testid="service-form-submit"
        disabled={isPending}
        aria-busy={isPending}
        className="self-start"
      >
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
