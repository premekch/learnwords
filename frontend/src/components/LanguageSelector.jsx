import { useState, useRef, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useLanguageStore } from '../store/languageStore';
import { createLanguagePair, deleteLanguagePair } from '../api/languages';
import toast from 'react-hot-toast';

export default function LanguageSelector({ pairs }) {
  const { activePairId, setActivePairId } = useLanguageStore();
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const ref = useRef(null);
  const qc = useQueryClient();

  // Auto-select first pair if none selected
  useEffect(() => {
    if (pairs.length > 0 && !activePairId) {
      setActivePairId(pairs[0].id);
    }
    if (activePairId && !pairs.find((p) => p.id === activePairId)) {
      setActivePairId(pairs[0]?.id || null);
    }
  }, [pairs, activePairId, setActivePairId]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activePair = pairs.find((p) => p.id === activePairId);

  const createMutation = useMutation({
    mutationFn: createLanguagePair,
    onSuccess: (pair) => {
      qc.invalidateQueries({ queryKey: ['languages'] });
      setActivePairId(pair.id);
      setShowAdd(false);
      setSource(''); setTarget('');
      toast.success('Jazykový pár vytvořen');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Chyba'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLanguagePair,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['languages'] }); toast.success('Pár smazán'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Chyba'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!source.trim() || !target.trim()) return;
    createMutation.mutate({ sourceLanguage: source, targetLanguage: target });
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="lang-selector" onClick={() => setOpen((o) => !o)}>
        <span>🌐</span>
        <span>{activePair ? `${activePair.sourceLanguage} → ${activePair.targetLanguage}` : 'Vybrat jazyk'}</span>
        <span style={{ marginLeft: 'auto' }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: '#fff', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
          minWidth: 240, zIndex: 200, overflow: 'hidden',
        }}>
          {pairs.map((pair) => (
            <div
              key={pair.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', cursor: 'pointer',
                background: pair.id === activePairId ? 'var(--blue-50)' : '#fff',
                borderBottom: '1px solid var(--gray-100)',
              }}
              onClick={() => { setActivePairId(pair.id); setOpen(false); }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-900)' }}>
                  {pair.sourceLanguage} → {pair.targetLanguage}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                  {pair._count?.words ?? 0} slov
                </div>
              </div>
              <button
                className="btn btn-danger btn-icon btn-sm"
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(pair.id); }}
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                title="Smazat pár"
              >✕</button>
            </div>
          ))}

          {showAdd ? (
            <form onSubmit={handleCreate} style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                className="form-input"
                placeholder="Zdrojový jazyk (např. Čeština)"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                autoFocus
                style={{ padding: '8px 12px' }}
              />
              <input
                className="form-input"
                placeholder="Cílový jazyk (např. Angličtina)"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                style={{ padding: '8px 12px' }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? '...' : 'Přidat'}
                </button>
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => setShowAdd(false)}>Zrušit</button>
              </div>
            </form>
          ) : (
            <button
              style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem', textAlign: 'left' }}
              onClick={() => setShowAdd(true)}
            >
              + Přidat jazykový pár
            </button>
          )}
        </div>
      )}
    </div>
  );
}
