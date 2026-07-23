"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import type { PublishStatus } from "./publish-status-badge";

export type UpdateStatusState = { error?: string } | undefined;

type PublishStatusButtonProps = {
  id: string;
  currentStatus: PublishStatus;
  action: (state: UpdateStatusState, formData: FormData) => Promise<UpdateStatusState>;
  testId?: string;
};

/**
 * Single-purpose publish/unpublish toggle, shared by services/products/
 * projects (see PublishStatusBadge). Not a select — there are only two
 * states and no scheduling, so a toggle is the honest control.
 */
export function PublishStatusButton({
  id,
  currentStatus,
  action,
  testId,
}: PublishStatusButtonProps) {
  const [state, formAction, isPending] = useActionState<UpdateStatusState, FormData>(
    action,
    undefined,
  );
  const nextStatus: PublishStatus = currentStatus === "published" ? "draft" : "published";
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
        data-testid={testId ?? `publish-status-toggle-${id}`}
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
