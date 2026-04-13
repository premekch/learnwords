export default function ActivityGraph({ data, days: numDays = 90 }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dataMap = {};
  (data || []).forEach((d) => {
    const key = new Date(d.date).toISOString().split('T')[0];
    dataMap[key] = d.cardsStudied;
  });

  // Compute max only over the visible window so colours scale properly
  const windowKeys = [];
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    windowKeys.push(d.toISOString().split('T')[0]);
  }
  const windowValues = windowKeys.map((k) => dataMap[k] || 0);
  const maxVal = Math.max(...windowValues, 1);

  const days = windowKeys.map((key, idx) => {
    const count = windowValues[idx];
    const date  = new Date(key);
    const level = count > 0 ? Math.ceil((count / maxVal) * 4) : 0;
    return { key, count, level, date };
  });

  return (
    <div>
      <div className="activity-grid">
        {days.map(({ key, count, level, date }) => (
          <div
            key={key}
            className="activity-cell"
            data-level={level}
            title={`${date.toLocaleDateString('cs-CZ')}: ${count} karet`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span className="text-xs text-muted">{numDays} dní zpět</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="text-xs text-muted">méně</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div key={l} className="activity-cell" data-level={l} style={{ width: 10, height: 10 }} />
          ))}
          <span className="text-xs text-muted">více</span>
        </div>
        <span className="text-xs text-muted">dnes</span>
      </div>
    </div>
  );
}
