import { useQuery } from '@tanstack/react-query';
import { getStats, getActivity } from '../api/stats';
import ActivityGraph from '../components/stats/ActivityGraph';

function StatCard({ icon, value, label, accent }) {
  return (
    <div className="stat-card">
      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{icon}</div>
      <div className="stat-value" style={accent ? { color: accent } : {}}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function StatsPage() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['stats'], queryFn: getStats });
  const { data: activity }         = useQuery({ queryKey: ['activity'], queryFn: getActivity });

  if (isLoading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: 24 }}>Statistiky</h1>

        {/* Main stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          <StatCard icon="📚" value={stats?.totalWords ?? 0}         label="Celkem slovíček" />
          <StatCard icon="✅" value={stats?.learnedWords ?? 0}       label="Naučeno (>21 dní)" accent="var(--color-success)" />
          <StatCard icon="🔥" value={stats?.streak ?? 0}             label="Série dní"         accent="var(--yellow-600)" />
          <StatCard icon="🎯" value={`${stats?.accuracy ?? 0}%`}     label="Přesnost"          accent="var(--color-primary)" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          <StatCard icon="📅" value={stats?.todayCardsStudied ?? 0}  label="Dnes procvičeno" accent="var(--color-primary)" />
          <StatCard icon="📊" value={stats?.totalStudied ?? 0}       label="Celkem procvičeno" />
        </div>

        {/* Progress towards learned */}
        {stats && stats.totalWords > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 12 }}>Pokrok</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="text-sm text-muted">Naučená slovíčka</span>
              <span className="text-sm" style={{ fontWeight: 600 }}>
                {stats.learnedWords} / {stats.totalWords}
              </span>
            </div>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.round((stats.learnedWords / stats.totalWords) * 100)}%` }}
              />
            </div>
            <div style={{ marginTop: 6, textAlign: 'right' }}>
              <span className="text-xs text-muted">
                {Math.round((stats.learnedWords / stats.totalWords) * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Activity graph */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Aktivita za 90 dní</h3>
          <ActivityGraph data={activity || []} />

          {(!activity || activity.length === 0) && (
            <div className="empty-state" style={{ padding: '24px 0 8px' }}>
              <p>Zatím žádná aktivita. Začněte se učit!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
