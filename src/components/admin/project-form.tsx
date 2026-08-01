"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectFormState } from "@/lib/admin/project-actions";

type ProjectFormDefaults = {
  title: string;
  location: string;
  summary: string;
  description: string;
  completionDate: string | null;
  coverImage: string | null;
  sortOrder: number;
};

type ProjectFormProps = {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  projectId?: string;
  defaultValues?: ProjectFormDefaults;
  submitLabel: string;
};

/** Shared by the create and edit pages — same shape as ServiceForm/ProductForm. */
export function ProjectForm({ action, projectId, defaultValues, submitLabel }: ProjectFormProps) {
  const [state, formAction, isPending] = useActionState<ProjectFormState, FormData>(
    action,
    undefined,
  );
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5" noValidate>
      {projectId && <input type="hidden" name="id" value={projectId} />}

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
        <Label htmlFor="location">
          Location <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="location"
          name="location"
          defaultValue={defaultValues?.location}
          required
          aria-required="true"
          aria-invalid={Boolean(fieldErrors.location)}
          aria-describedby={fieldErrors.location ? "location-error" : undefined}
        />
        {fieldErrors.location && (
          <p id="location-error" role="alert" className="text-destructive text-sm">
            {fieldErrors.location[0]}
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="completionDate">Completion date</Label>
        <Input
          id="completionDate"
          name="completionDate"
          type="date"
          defaultValue={defaultValues?.completionDate ?? ""}
          aria-invalid={Boolean(fieldErrors.completionDate)}
          aria-describedby={fieldErrors.completionDate ? "completionDate-error" : undefined}
        />
        {fieldErrors.completionDate && (
          <p id="completionDate-error" role="alert" className="text-destructive text-sm">
            {fieldErrors.completionDate[0]}
          </p>
        )}
      </div>

      <div className="border-border bg-muted/40 rounded-lg border p-4 text-sm">
        <input type="hidden" name="coverImage" value={defaultValues?.coverImage ?? ""} />
        <p className="text-foreground font-medium">Project photography is held for verification</p>
        <p className="text-muted-foreground mt-1 leading-relaxed">
          Existing references are preserved, but project photography stays off the public site until
          authenticity and usage rights are confirmed in the media workflow.
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
        data-testid="project-form-submit"
        disabled={isPending}
        aria-busy={isPending}
        className="self-start"
      >
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
