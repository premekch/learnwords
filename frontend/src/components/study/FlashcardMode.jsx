import { useState } from 'react';

const RATINGS = [
  { key: 'again', label: 'Znovu',  quality: 1, cls: 'rating-again' },
  { key: 'hard',  label: 'Těžko', quality: 3, cls: 'rating-hard'  },
  { key: 'good',  label: 'Dobře', quality: 4, cls: 'rating-good'  },
  { key: 'easy',  label: 'Lehce', quality: 5, cls: 'rating-easy'  },
];

export default function FlashcardMode({ card, onAnswer }) {
  const [flipped, setFlipped] = useState(false);

  const handleRate = (quality) => {
    setFlipped(false);
    onAnswer(quality);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div className="flashcard-scene" onClick={() => setFlipped((f) => !f)}>
        <div className={`flashcard-inner${flipped ? ' flipped' : ''}`}>
          <div className="flashcard-face flashcard-front">
            <div className="flashcard-word">{card.sourceWord}</div>
            <div className="flashcard-hint">klepnutím otočit ↓</div>
          </div>
          <div className="flashcard-face flashcard-back">
            <div className="flashcard-word" style={{ color: 'var(--gray-900)' }}>{card.targetWord}</div>
            <div className="flashcard-hint" style={{ color: 'var(--gray-400)' }}>Jak dobře jsi znal/a?</div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="rating-grid" style={{ width: '100%', maxWidth: 500 }}>
          {RATINGS.map(({ key, label, quality, cls }) => (
            <button key={key} className={`rating-btn ${cls}`} onClick={() => handleRate(quality)}>
              {label}
            </button>
          ))}
        </div>
      )}

      {!flipped && (
        <p className="text-sm text-muted text-center">Klepni na kartu pro zobrazení překladu</p>
      )}
    </div>
  );
}
