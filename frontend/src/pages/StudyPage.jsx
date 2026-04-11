import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getLanguagePairs } from '../api/languages';
import { getStudyCards, submitReview } from '../api/study';
import { useLanguageStore } from '../store/languageStore';
import FlashcardMode from '../components/study/FlashcardMode';
import FillInBlankMode from '../components/study/FillInBlankMode';
import MultipleChoiceMode from '../components/study/MultipleChoiceMode';
import SessionSummary from '../components/study/SessionSummary';
import toast from 'react-hot-toast';

const MODES = [
  { key: 'flashcard',  icon: '🃏', label: 'Flashcards' },
  { key: 'fillin',     icon: '✏️',  label: 'Doplňování' },
  { key: 'choice',     icon: '☑️',  label: 'Výběr' },
];

function StudySetup({ pairs, activePairId, setActivePairId, mode, setMode, onStart }) {
  const activePair = pairs.find((p) => p.id === activePairId);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24 }}>Procvičování</h1>

      {/* Language pair select */}
      <div className="form-group" style={{ marginBottom: 20 }}>
        <label className="form-label">Jazykový pár</label>
        <select
          className="form-input"
          value={activePairId || ''}
          onChange={(e) => setActivePairId(e.target.value)}
        >
          {pairs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sourceLanguage} → {p.targetLanguage} ({p._count?.words ?? 0} slov)
            </option>
          ))}
        </select>
      </div>

      {/* Mode selector */}
      <div className="form-group" style={{ marginBottom: 24 }}>
        <label className="form-label">Režim učení</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {MODES.map(({ key, icon, label }) => (
            <button
              key={key}
              className={`mode-btn${mode === key ? ' selected' : ''}`}
              onClick={() => setMode(key)}
            >
              <span className="mode-icon">{icon}</span>
              <span className="mode-label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {activePair && activePair._count?.words === 0 && (
        <div style={{
          background: 'var(--yellow-100)', border: '1px solid var(--yellow-300)',
          borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16,
          color: 'var(--yellow-600)', fontSize: '0.875rem',
        }}>
          Tento jazykový pár nemá žádná slovíčka. Přidejte je na stránce Slovíčka.
        </div>
      )}

      <button
        className="btn btn-primary btn-lg btn-full"
        onClick={onStart}
        disabled={!activePairId || !activePair || (activePair._count?.words === 0)}
      >
        🎯 Spustit procvičování
      </button>
    </div>
  );
}

export default function StudyPage() {
  const { activePairId, setActivePairId } = useLanguageStore();
  const [mode, setMode]           = useState('flashcard');
  const [phase, setPhase]         = useState('setup'); // setup | studying | summary
  const [cards, setCards]         = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [correct, setCorrect]     = useState(0);
  const [total, setTotal]         = useState(0);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: pairs = [], isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguagePairs,
  });

  const { mutate: fetchCards, isPending: loadingCards } = useMutation({
    mutationFn: ({ pairId }) => getStudyCards(pairId, 20),
    onSuccess: (data) => {
      if (data.cards.length === 0) {
        toast('Žádné karty k procvičení! Přijďte zítra 🎉', { icon: '😴' });
        return;
      }
      setCards(data.cards);
      setCardIndex(0);
      setCorrect(0);
      setTotal(0);
      setPhase('studying');
    },
    onError: () => toast.error('Nepodařilo se načíst karty'),
  });

  const { mutate: sendReview } = useMutation({
    mutationFn: submitReview,
    onError: () => toast.error('Nepodařilo se uložit odpověď'),
  });

  const handleStart = () => {
    if (!activePairId) return;
    fetchCards({ pairId: activePairId });
  };

  const handleAnswer = useCallback((quality) => {
    const card = cards[cardIndex];
    sendReview({ wordId: card.wordId, direction: card.direction, quality });

    const isCorrect = quality >= 3;
    setCorrect((c) => c + (isCorrect ? 1 : 0));
    setTotal((t) => t + 1);

    if (cardIndex + 1 >= cards.length) {
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['activity'] });
      setPhase('summary');
    } else {
      setCardIndex((i) => i + 1);
    }
  }, [cards, cardIndex, sendReview, qc]);

  const handleRestart = () => {
    fetchCards({ pairId: activePairId });
  };

  if (isLoading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        {phase === 'setup' && (
          <>
            {pairs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🌍</div>
                <h3>Nejprve přidejte jazykový pár</h3>
                <p>Přejděte na stránku Slovíčka a přidejte jazykový pár.</p>
                <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => navigate('/words')}>
                  Přidat slovíčka
                </button>
              </div>
            ) : (
              <StudySetup
                pairs={pairs}
                activePairId={activePairId}
                setActivePairId={setActivePairId}
                mode={mode}
                setMode={setMode}
                onStart={handleStart}
              />
            )}
          </>
        )}

        {phase === 'studying' && cards.length > 0 && (
          <div>
            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span className="text-sm text-muted">
                  {cardIndex + 1} / {cards.length}
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPhase('setup')}
                >
                  ✕ Ukončit
                </button>
              </div>
              <div className="progress-bar-wrap">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${((cardIndex) / cards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Badge new/review */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {cards[cardIndex].isNew
                ? <span className="badge badge-yellow">Nové</span>
                : <span className="badge badge-blue">Opakování</span>
              }
            </div>

            {mode === 'flashcard' && (
              <FlashcardMode
                key={`${cards[cardIndex].wordId}-${cards[cardIndex].direction}`}
                card={cards[cardIndex]}
                onAnswer={handleAnswer}
              />
            )}
            {mode === 'fillin' && (
              <FillInBlankMode
                key={`${cards[cardIndex].wordId}-${cards[cardIndex].direction}`}
                card={cards[cardIndex]}
                onAnswer={handleAnswer}
              />
            )}
            {mode === 'choice' && (
              <MultipleChoiceMode
                key={`${cards[cardIndex].wordId}-${cards[cardIndex].direction}`}
                card={cards[cardIndex]}
                allCards={cards}
                onAnswer={handleAnswer}
              />
            )}
          </div>
        )}

        {loadingCards && (
          <div className="page-loader"><div className="spinner" /></div>
        )}

        {phase === 'summary' && (
          <SessionSummary
            correct={correct}
            total={total}
            onRestart={handleRestart}
            onDone={() => navigate('/dashboard')}
          />
        )}
      </div>
    </div>
  );
}
