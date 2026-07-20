import { cn } from "@/lib/utils";

type NoticeProps = {
  className?: string;
};

const DEFAULT_UNAVAILABLE_MESSAGE =
  "Data is unavailable right now. This usually means Supabase isn't configured in this environment yet — see docs/architecture.md.";

/** Shown when Supabase isn't configured or a query failed — never a fake number/row. */
export function DataUnavailableNotice({
  className,
  message = DEFAULT_UNAVAILABLE_MESSAGE,
}: NoticeProps & { message?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "border-border bg-muted/30 text-muted-foreground rounded-lg border p-6 text-sm",
        className,
      )}
    >
      {message}
    </div>
  );
}

/** Shown when a query succeeded but returned zero rows — a genuine empty state. */
export function EmptyNotice({ message, className }: NoticeProps & { message: string }) {
  return (
    <div
      role="status"
      className={cn(
        "border-border text-muted-foreground rounded-lg border border-dashed p-6 text-sm",
        className,
      )}
    >
      {message}
    </div>
  );
}
