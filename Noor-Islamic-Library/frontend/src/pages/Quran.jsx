import React, { useEffect, useState, useCallback } from 'react';
import { useHttpClient } from '../hooks/http-hook';
import { getFromCache, saveToCache } from '../util/indexeddb';

const Quran = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [surahs, setSurahs] = useState([]);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [viewMode, setViewMode] = useState('page'); // 'surah' or 'page'
    const [currentPage, setCurrentPage] = useState(1);
    const [pageAyahs, setPageAyahs] = useState([]);

    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const cachedSurahs = await getFromCache('allSurahs');
                if (cachedSurahs) {
                    setSurahs(cachedSurahs);
                }

                const responseData = await sendRequest('http://localhost:5000/api/quran');
                setSurahs(responseData.surahs);
                saveToCache('allSurahs', responseData.surahs);
            } catch (err) { }
        };
        fetchSurahs();
    }, [sendRequest]);

    const fetchPageAyahs = useCallback(async (page) => {
        try {
            const cached = await getFromCache(`quranPage_${page}`);
            if (cached) {
                setPageAyahs(cached);
            }
            const responseData = await sendRequest(`http://localhost:5000/api/quran/page/${page}`);
            setPageAyahs(responseData.ayahs);
            saveToCache(`quranPage_${page}`, responseData.ayahs);
        } catch (err) { }
    }, [sendRequest]);

    useEffect(() => {
        if (viewMode === 'page') {
            fetchPageAyahs(currentPage);
        }
    }, [viewMode, currentPage, fetchPageAyahs]);

    const selectSurahHandler = async (sid) => {
        try {
            const responseData = await sendRequest(`http://localhost:5000/api/quran/${sid}`);
            setSelectedSurah(responseData.surah);
            setViewMode('surah');
        } catch (err) { }
    };

    const renderTajwid = (text) => {
        // The API might return text with tajwid tags like [g], [i], etc.
        // Or it might be HTML. We'll sanitize and map to our CSS classes.
        if (!text) return '';

        let processed = text;
        // Example mapping for common Tajwid API tags
        processed = processed.replace(/<b class="ghn">/g, '<span class="tajwid-ghn">');
        processed = processed.replace(/<b class="ikh">/g, '<span class="tajwid-ikh">');
        processed = processed.replace(/<b class="iql">/g, '<span class="tajwid-iql">');
        processed = processed.replace(/<b class="idg">/g, '<span class="tajwid-idg">');
        processed = processed.replace(/<b class="qal">/g, '<span class="tajwid-qal">');
        processed = processed.replace(/<b class="mdd">/g, '<span class="tajwid-mdd">');
        processed = processed.replace(/<\/b>/g, '</span>');

        return <span dangerouslySetInnerHTML={{ __html: processed }} />;
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: 'var(--primary-light)' }}>The Holy Qur'an</h1>
                <div className="glass" style={{ padding: '5px', borderRadius: '12px' }}>
                    <button
                        className={`btn ${viewMode === 'page' ? 'btn-primary' : ''}`}
                        onClick={() => setViewMode('page')}
                        style={{ padding: '5px 15px', fontSize: '0.8rem' }}
                    >
                        MUSHAF VIEW
                    </button>
                    <button
                        className={`btn ${viewMode === 'surah' ? 'btn-primary' : ''}`}
                        onClick={() => setViewMode('surah')}
                        style={{ padding: '5px 15px', fontSize: '0.8rem', marginLeft: '5px' }}
                    >
                        SURAH VIEW
                    </button>
                </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
                <div className="card glass" style={{ height: '75vh', overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: '15px' }}>Surahs</h3>
                    <ul style={{ listStyle: 'none' }}>
                        {surahs.map(s => (
                            <li key={s.surahNumber}
                                onClick={() => selectSurahHandler(s.surahNumber)}
                                style={{
                                    padding: '12px',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    marginBottom: '5px',
                                    transition: '0.2s',
                                    background: selectedSurah?.surahNumber === s.surahNumber && viewMode === 'surah' ? 'var(--primary)' : 'transparent',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                <span style={{ fontWeight: '700', marginRight: '10px', color: 'var(--secondary-light)' }}>{s.surahNumber}</span>
                                {s.surahName}
                            </li>
                        ))}
                    </ul>
                </div>

                {viewMode === 'page' ? (
                    <div className="mushaf-container">
                        <div className="mushaf-page">
                            {pageAyahs.reduce((acc, a, index) => {
                                const prev = pageAyahs[index - 1];
                                const showHeader = !prev || prev.surahNumber !== a.surahNumber;

                                if (showHeader) {
                                    acc.push(
                                        <div key={`header-${a.surahNumber}`} className="surah-header-mushaf">
                                            Surah {a.surahNameArabic}
                                        </div>
                                    );
                                    if (a.surahNumber !== 1 && a.surahNumber !== 9 && a.number === 1) {
                                        acc.push(
                                            <div key={`basmalah-${a.surahNumber}`} className="basmalah">
                                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                            </div>
                                        );
                                    }
                                }

                                acc.push(
                                    <span key={`${a.surahNumber}-${a.number}`} className="ayah-wrapper">
                                        {renderTajwid(a.tajwidText || a.text)}
                                        <span className="ayah-end">{a.number}</span>
                                    </span>
                                );
                                return acc;
                            }, [])}
                        </div>
                        <div className="mushaf-controls">
                            <button
                                className="btn btn-outline"
                                disabled={currentPage === 604}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                ← Previous Page
                            </button>
                            <div style={{ textAlign: 'center' }}>
                                <span className="page-indicator">Page {currentPage} / 604</span>
                            </div>
                            <button
                                className="btn btn-outline"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                Next Page →
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="card glass" style={{ height: '75vh', overflowY: 'auto' }}>
                        {selectedSurah ? (
                            <div>
                                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary-light)' }}>
                                    {selectedSurah.surahName} <br />
                                    <span style={{ fontSize: '2.5rem' }}>{selectedSurah.surahNameArabic}</span>
                                </h2>
                                {selectedSurah.ayahs.map(a => (
                                    <div key={a.number} style={{ marginBottom: '30px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <p style={{ fontSize: '1.8rem', textAlign: 'right', direction: 'rtl', marginBottom: '15px', lineHeight: '2' }}>
                                            {renderTajwid(a.tajwidText || a.text)} ({a.number})
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{a.translation}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ textAlign: 'center', marginTop: '150px', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                                Select a Surah from the list to start reading.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quran;
