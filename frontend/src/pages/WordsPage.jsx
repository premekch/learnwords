import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLanguagePairs } from '../api/languages';
import { getWords } from '../api/words';
import { useLanguageStore } from '../store/languageStore';
import WordList from '../components/words/WordList';
import AddWordModal from '../components/words/AddWordModal';
import ImportModal from '../components/words/ImportModal';
import LanguageSelector from '../components/LanguageSelector';

export default function WordsPage() {
  const { activePairId } = useLanguageStore();
  const [showAdd, setShowAdd]       = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);

  const { data: pairs = [] } = useQuery({ queryKey: ['languages'], queryFn: getLanguagePairs });
  const activePair = pairs.find((p) => p.id === activePairId);

  const { data, isLoading } = useQuery({
    queryKey: ['words', activePairId, search, page],
    queryFn: () => getWords({ languagePairId: activePairId, search, page, limit: 50 }),
    enabled: !!activePairId,
  });

  const totalPages = data ? Math.ceil(data.total / 50) : 1;

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <h1>Slovíčka</h1>
          {activePair && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(true)}>
                📥 Import
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
                + Přidat
              </button>
            </div>
          )}
        </div>

        {/* No language pair */}
        {pairs.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🌍</div>
            <h3 style={{ marginBottom: 8 }}>Nejprve přidejte jazykový pár</h3>
            <p style={{ marginBottom: 20 }}>Klikněte na „Vybrat jazyk" v horní liště a přidejte první jazykový pár.</p>
            <LanguageSelector pairs={pairs} />
          </div>
        )}

        {pairs.length > 0 && !activePair && (
          <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <p>Vyberte jazykový pár pomocí tlačítka v horní liště.</p>
          </div>
        )}

        {activePair && (
          <>
            {/* Stats row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              <span className="badge badge-blue">
                {activePair.sourceLanguage} → {activePair.targetLanguage}
              </span>
              {data && (
                <span className="text-sm text-muted">{data.total} slovíček</span>
              )}
            </div>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
              <input
                className="form-input"
                type="search"
                placeholder="Hledat slovíčko..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>

            {/* Word list */}
            <div className="card" style={{ padding: '0 20px' }}>
              {isLoading ? (
                <div style={{ padding: '32px', textAlign: 'center' }}>
                  <div className="spinner" />
                </div>
              ) : (
                <WordList words={data?.words || []} languagePair={activePair} />
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  ‹ Předchozí
                </button>
                <span className="text-sm text-muted" style={{ lineHeight: '34px' }}>
                  {page} / {totalPages}
                </span>
                <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  Další ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showAdd && activePair && (
        <AddWordModal languagePair={activePair} onClose={() => setShowAdd(false)} />
      )}
      {showImport && activePair && (
        <ImportModal languagePair={activePair} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
