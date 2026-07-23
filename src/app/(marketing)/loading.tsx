export default function MarketingLoading() {
  return (
    <div className="solar-loading" role="status" aria-label="Loading page">
      <div className="solar-loading__horizon" aria-hidden="true">
        <i />
      </div>
      <p>
        <span>First light</span>Loading the next scene…
      </p>
    </div>
  );
}
