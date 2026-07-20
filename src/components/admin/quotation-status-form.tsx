"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateQuotationStatusAction, type UpdateStatusState } from "@/lib/admin/actions";
import { QUOTATION_STATUSES, type QuotationStatus } from "@/lib/admin/quotations";

import { statusLabel } from "./status-badge";

type QuotationStatusFormProps = {
  id: string;
  currentStatus: QuotationStatus;
};

export function QuotationStatusForm({ id, currentStatus }: QuotationStatusFormProps) {
  const [state, formAction, isPending] = useActionState<UpdateStatusState, FormData>(
    updateQuotationStatusAction,
    undefined,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="border-input focus-visible:ring-ring h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:ring-2"
        >
          {QUOTATION_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        data-testid="update-status-submit"
      >
        {isPending ? "Updating…" : "Update status"}
      </Button>
      {state?.error && (
        <p role="alert" className="text-destructive w-full text-sm">
          {state.error}
        </p>
      )}
    </form>
  );
}
