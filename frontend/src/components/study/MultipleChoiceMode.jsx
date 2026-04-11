import { useState, useMemo } from 'react';

export default function MultipleChoiceMode({ card, allCards, onAnswer }) {
  const [selected, setSelected] = useState(null);

  // Generate 3 distractors from other cards in the session
  const options = useMemo(() => {
    const others = allCards
      .filter((c) => c.wordId !== card.wordId || c.direction !== card.direction)
      .map((c) => c.targetWord);

    const unique = [...new Set(others)];
    const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, 3);

    // If we don't have 3 distractors, that's fine – just show what we have
    const opts = [card.targetWord, ...shuffled];
    return opts.sort(() => Math.random() - 0.5);
  }, [card.wordId, card.direction]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
  };

  const isCorrect = selected === card.targetWord;

  const next = () => {
    onAnswer(isCorrect ? 4 : 1);
    setSelected(null);
  };

  const getClass = (opt) => {
    if (selected === null) return 'choice-btn';
    if (opt === card.targetWord) return 'choice-btn correct';
    if (opt === selected) return 'choice-btn wrong';
    return 'choice-btn';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 500, margin: '0 auto', width: '100%' }}>
      {/* Question */}
      <div style={{
        background: 'var(--color-primary)', borderRadius: 'var(--radius-lg)',
        padding: '32px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,.7)', marginBottom: 8 }}>
          Vyberte správný překlad
        </div>
        <div style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)', fontWeight: 700, color: '#fff' }}>
          {card.sourceWord}
        </div>
      </div>

      {/* Options */}
      <div className="choice-grid">
        {options.map((opt) => (
          <button
            key={opt}
            className={getClass(opt)}
            onClick={() => handleSelect(opt)}
            disabled={selected !== null}
          >
            {opt}
          </button>
        ))}
      </div>

      {selected !== null && (
        <button className="btn btn-primary btn-lg btn-full" onClick={next}>
          Další →
        </button>
      )}
    </div>
  );
}
