import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWord, deleteWord } from '../../api/words';
import toast from 'react-hot-toast';

function EditRow({ word, languagePair, onCancel }) {
  const [source, setSource] = useState(word.sourceWord);
  const [target, setTarget] = useState(word.targetWord);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }) => updateWord(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['words'] }); onCancel(); toast.success('Uloženo'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Chyba'),
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <input className="form-input" value={source} onChange={(e) => setSource(e.target.value)} style={{ padding: '6px 10px' }} />
      <input className="form-input" value={target} onChange={(e) => setTarget(e.target.value)} style={{ padding: '6px 10px' }} />
      <div style={{ display: 'flex', gap: 4 }}>
        <button className="btn btn-primary btn-sm" onClick={() => mutation.mutate({ id: word.id, data: { sourceWord: source, targetWord: target } })} disabled={mutation.isPending}>✓</button>
        <button className="btn btn-secondary btn-sm" onClick={onCancel}>✕</button>
      </div>
    </div>
  );
}

export default function WordList({ words, languagePair }) {
  const [editId, setEditId] = useState(null);
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteWord,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['words'] }); qc.invalidateQueries({ queryKey: ['languages'] }); toast.success('Smazáno'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Chyba'),
  });

  const handleDelete = (id) => {
    if (confirm('Opravdu smazat toto slovíčko?')) deleteMutation.mutate(id);
  };

  if (!words.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <p>Žádná slovíčka. Přidejte první!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr auto',
        gap: 12, padding: '8px 0', borderBottom: '2px solid var(--gray-200)',
        fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)',
        textTransform: 'uppercase', letterSpacing: '.05em',
      }}>
        <span>{languagePair.sourceLanguage}</span>
        <span>{languagePair.targetLanguage}</span>
        <span></span>
      </div>

      {words.map((word) =>
        editId === word.id ? (
          <EditRow key={word.id} word={word} languagePair={languagePair} onCancel={() => setEditId(null)} />
        ) : (
          <div key={word.id} className="word-row">
            <span style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{word.sourceWord}</span>
            <span style={{ color: 'var(--gray-600)' }}>{word.targetWord}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-secondary btn-icon btn-sm" onClick={() => setEditId(word.id)} title="Upravit">✏️</button>
              <button className="btn btn-danger btn-icon btn-sm" onClick={() => handleDelete(word.id)} title="Smazat">🗑️</button>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
