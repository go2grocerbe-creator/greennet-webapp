"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { setServiceStatusAction, type UpdateStatusState } from "@/lib/admin/service-actions";
import type { ServiceStatus } from "@/lib/admin/services";

type ServiceStatusButtonProps = {
  id: string;
  currentStatus: ServiceStatus;
};

/** Single-purpose publish/unpublish toggle — only draft/published exist, no scheduling. */
export function ServiceStatusButton({ id, currentStatus }: ServiceStatusButtonProps) {
  const [state, formAction, isPending] = useActionState<UpdateStatusState, FormData>(
    setServiceStatusAction,
    undefined,
  );
  const nextStatus: ServiceStatus = currentStatus === "published" ? "draft" : "published";
  const label = currentStatus === "published" ? "Unpublish" : "Publish";

  return (
    <form action={formAction} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={nextStatus} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={isPending}
        aria-busy={isPending}
        data-testid={`service-status-toggle-${id}`}
      >
        {isPending ? "Updating…" : label}
      </Button>
      {state?.error && (
        <p role="alert" className="text-destructive text-xs">
          {state.error}
        </p>
      )}
    </form>
  );
}
