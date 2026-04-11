export default function ActivityGraph({ data }) {
  // Build a map of date → cardsStudied for the last 90 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dataMap = {};
  (data || []).forEach((d) => {
    const key = new Date(d.date).toISOString().split('T')[0];
    dataMap[key] = d.cardsStudied;
  });

  const maxVal = Math.max(...Object.values(dataMap), 1);

  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const count = dataMap[key] || 0;
    let level = 0;
    if (count > 0) level = Math.ceil((count / maxVal) * 4);
    days.push({ key, count, level, date: d });
  }

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
        <span className="text-xs text-muted">90 dní zpět</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="text-xs text-muted">méně</span>
          {[0,1,2,3,4].map((l) => (
            <div key={l} className="activity-cell" data-level={l} style={{ width: 10, height: 10 }} />
          ))}
          <span className="text-xs text-muted">více</span>
        </div>
        <span className="text-xs text-muted">dnes</span>
      </div>
    </div>
  );
}
