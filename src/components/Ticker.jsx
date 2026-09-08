const ITEMS = ["No accounts", "No trackers", "No investors", "No dark patterns", "No permission required", "On-device AI", "Made by hand"];

export function Ticker() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="track">
        {row.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}
