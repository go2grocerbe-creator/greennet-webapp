export default function QuotationsLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6">
      <div
        role="status"
        aria-label="Loading"
        className="border-border border-t-brand-primary h-8 w-8 animate-spin rounded-full border-2"
      />
    </div>
  );
}
