export default function MarketingLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        role="status"
        aria-label="Loading"
        className="border-border border-t-brand-primary h-8 w-8 animate-spin rounded-full border-2"
      />
    </div>
  );
}
