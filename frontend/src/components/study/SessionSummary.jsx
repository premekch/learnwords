export default function SessionSummary({ correct, total, onRestart, onDone }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';

  return (
    <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ fontSize: '4rem', marginBottom: 16 }}>{emoji}</div>
      <h2 style={{ marginBottom: 8 }}>Sezení dokončeno!</h2>

      <div style={{
        background: 'var(--blue-50)', border: '1px solid var(--blue-200)',
        borderRadius: 'var(--radius-lg)', padding: '24px',
        margin: '24px 0', display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--gray-600)' }}>Procvičeno karet</span>
          <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{total}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--gray-600)' }}>Správně</span>
          <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--color-success)' }}>{correct}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--gray-600)' }}>Úspěšnost</span>
          <span style={{
            fontWeight: 700, fontSize: '1.5rem',
            color: pct >= 80 ? 'var(--color-success)' : pct >= 50 ? 'var(--yellow-600)' : 'var(--color-error)',
          }}>{pct}%</span>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-wrap">
          <div
            className="progress-bar-fill"
            style={{
              width: `${pct}%`,
              background: pct >= 80 ? 'var(--color-success)' : pct >= 50 ? 'var(--yellow-500)' : 'var(--color-error)',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-lg btn-full" onClick={onRestart}>
          Procvičit znovu
        </button>
        <button className="btn btn-secondary btn-full" onClick={onDone}>
          Zpět na přehled
        </button>
      </div>
    </div>
  );
}
