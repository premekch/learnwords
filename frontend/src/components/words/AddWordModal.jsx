import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWord } from '../../api/words';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

export default function AddWordModal({ languagePair, onClose }) {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: createWord,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['words'] });
      qc.invalidateQueries({ queryKey: ['languages'] });
      toast.success('Slovíčko přidáno');
      setSource(''); setTarget('');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Chyba'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!source.trim() || !target.trim()) return;
    mutation.mutate({
      languagePairId: languagePair.id,
      sourceWord: source,
      targetWord: target,
    });
  };

  return (
    <Modal title="Přidat slovíčko" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">{languagePair.sourceLanguage}</label>
          <input
            className="form-input"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder={`Slovo v ${languagePair.sourceLanguage}`}
            autoFocus
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">{languagePair.targetLanguage}</label>
          <input
            className="form-input"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={`Překlad v ${languagePair.targetLanguage}`}
            required
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Ukládám...' : 'Přidat'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Zavřít
          </button>
        </div>
      </form>
    </Modal>
  );
}
