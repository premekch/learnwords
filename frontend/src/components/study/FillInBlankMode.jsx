import { useState, useRef, useEffect } from 'react';

export default function FillInBlankMode({ card, onAnswer }) {
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(''); setChecked(false); setCorrect(false);
    inputRef.current?.focus();
  }, [card.wordId, card.direction]);

  const check = () => {
    if (!value.trim()) return;
    const isCorrect = value.trim().toLowerCase() === card.targetWord.trim().toLowerCase();
    setCorrect(isCorrect);
    setChecked(true);
  };

  const next = () => {
    onAnswer(correct ? 4 : 1);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      if (!checked) check();
      else next();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 500, margin: '0 auto', width: '100%' }}>
      {/* Question */}
      <div style={{
        background: 'var(--color-primary)', borderRadius: 'var(--radius-lg)',
        padding: '32px 24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,.7)', marginBottom: 8 }}>
          Přeložte do {card.targetWord ? '?' : '...'}
        </div>
        <div style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)', fontWeight: 700, color: '#fff' }}>
          {card.sourceWord}
        </div>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          ref={inputRef}
          className={`form-input${checked ? (correct ? ' correct-input' : ' error') : ''}`}
          style={{
            fontSize: '1.0625rem', padding: '12px 16px',
            ...(checked && correct ? { borderColor: 'var(--color-success)', background: '#d1fae5' } : {}),
          }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={checked}
          placeholder="Napište překlad..."
        />

        {checked && !correct && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 'var(--radius)', padding: '10px 14px',
          }}>
            <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>Správně: </span>
            <span style={{ fontWeight: 600 }}>{card.targetWord}</span>
          </div>
        )}

        {checked && correct && (
          <div style={{
            background: '#d1fae5', border: '1px solid #6ee7b7',
            borderRadius: 'var(--radius)', padding: '10px 14px',
            color: '#065f46', fontWeight: 600, textAlign: 'center',
          }}>
            ✓ Správně!
          </div>
        )}
      </div>

      {!checked ? (
        <button className="btn btn-primary btn-lg btn-full" onClick={check} disabled={!value.trim()}>
          Zkontrolovat
        </button>
      ) : (
        <button className="btn btn-primary btn-lg btn-full" onClick={next}>
          Další →
        </button>
      )}
    </div>
  );
}
