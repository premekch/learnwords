import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getStats, getActivity } from '../api/stats';
import { getLanguagePairs } from '../api/languages';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { displayLanguage } from '../constants/languages';
import ActivityGraph from '../components/stats/ActivityGraph';

function StatCard({ value, label, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={accent ? { color: accent } : {}}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { activePairId } = useLanguageStore();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({ queryKey: ['stats'], queryFn: getStats });
  const { data: activity }         = useQuery({ queryKey: ['activity'], queryFn: getActivity });
  const { data: pairs = [] }       = useQuery({ queryKey: ['languages'], queryFn: getLanguagePairs });

  const activePair = pairs.find((p) => p.id === activePairId);

  if (isLoading) return <div className="page-loader"><div className="spinner" /></div>;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Dobré ráno';
    if (h < 18) return 'Dobré odpoledne';
    return 'Dobrý večer';
  };

  const displayName = user?.name || user?.email?.split('@')[0];

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1>{greeting()}, {displayName}! 👋</h1>
          {activePair && (
            <p style={{ marginTop: 4 }}>
              Aktivní jazyk:{' '}
              <strong>
                {displayLanguage(activePair.sourceLanguage)} → {displayLanguage(activePair.targetLanguage)}
              </strong>
            </p>
          )}
        </div>

        {/* No language pair */}
        {pairs.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px', marginBottom: 24 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌍</div>
            <h3 style={{ marginBottom: 8 }}>Začněte přidáním jazykového páru</h3>
            <p style={{ marginBottom: 20 }}>Klikněte na tlačítko „Vybrat jazyk" v horní liště</p>
            <button className="btn btn-primary" onClick={() => navigate('/words')}>
              Přejít na slovíčka
            </button>
          </div>
        )}

        {/* Stats grid */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
            <StatCard value={stats.totalWords} label="Celkem slov" />
            <StatCard value={stats.learnedWords} label="Naučeno" accent="var(--color-success)" />
            <StatCard value={stats.todayCardsStudied} label="Dnes procvičeno" accent="var(--color-primary)" />
            <StatCard value={`${stats.streak}🔥`} label="Série dní" accent="var(--yellow-600)" />
          </div>
        )}

        {/* Quick start */}
        {activePair && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Rychlé učení</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/study')}>
                🎯 Spustit procvičování
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/words')}>
                + Přidat slova
              </button>
            </div>
          </div>
        )}

        {/* Activity – last 30 days */}
        {activity && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 4 }}>Aktivita – posledních 30 dní</h3>
            <p style={{ marginBottom: 14, fontSize: '0.8125rem' }}>
              {activity.filter((d) => {
                const daysAgo = (Date.now() - new Date(d.date).getTime()) / 86400000;
                return daysAgo <= 30 && d.cardsStudied > 0;
              }).length} aktivních dní
            </p>
            {activity.length > 0 ? (
              <ActivityGraph data={activity} days={30} />
            ) : (
              <p className="text-sm text-muted">Zatím žádná aktivita.</p>
            )}
          </div>
        )}

        {/* Activity – last 90 days */}
        {activity && (
          <div className="card">
            <h3 style={{ marginBottom: 4 }}>Aktivita – posledních 90 dní</h3>
            {stats && (
              <p style={{ marginBottom: 14, fontSize: '0.8125rem' }}>
                Celkem procvičeno: <strong>{stats.totalStudied}</strong> karet · Přesnost: <strong>{stats.accuracy}%</strong>
              </p>
            )}
            {activity.length > 0 ? (
              <ActivityGraph data={activity} days={90} />
            ) : (
              <p className="text-sm text-muted">Zatím žádná aktivita.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
