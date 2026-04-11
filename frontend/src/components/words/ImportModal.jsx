import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importWords } from '../../api/words';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

export default function ImportModal({ languagePair, onClose }) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, f }) => importWords(id, f),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['words'] });
      qc.invalidateQueries({ queryKey: ['languages'] });
      toast.success(`Importováno ${data.imported} slovíček`);
      onClose();
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Chyba při importu'),
  });

  const handleFile = (f) => {
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.csv'))) {
      setFile(f);
    } else {
      toast.error('Povoleny jsou pouze soubory .xlsx a .csv');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    mutation.mutate({ id: languagePair.id, f: file });
  };

  return (
    <Modal title="Import slovíček" onClose={onClose}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 8 }}>
          Soubor musí mít <strong>header řádek</strong> a dvě sloupce:
        </p>
        <div style={{
          background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
          borderRadius: 'var(--radius)', padding: '10px 14px',
          fontFamily: 'monospace', fontSize: '0.8125rem',
        }}>
          <div style={{ color: 'var(--gray-500)' }}>{languagePair.sourceLanguage} | {languagePair.targetLanguage}</div>
          <div>hello | ahoj</div>
          <div>world | svět</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--gray-300)'}`,
            borderRadius: 'var(--radius)',
            padding: '28px 16px',
            textAlign: 'center',
            background: dragOver ? 'var(--blue-50)' : '#fff',
            cursor: 'pointer',
            transition: 'all var(--transition)',
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
          {file ? (
            <p style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{file.name}</p>
          ) : (
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
              Přetáhněte soubor nebo <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>vyberte ze zařízení</span>
            </p>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 4 }}>.xlsx nebo .csv</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.csv"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={!file || mutation.isPending}
          >
            {mutation.isPending ? 'Importuji...' : 'Importovat'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Zrušit
          </button>
        </div>
      </form>
    </Modal>
  );
}
