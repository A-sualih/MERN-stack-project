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
    const [showIndex, setShowIndex] = useState(false);

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
            setShowIndex(false); // Close index on selection
        } catch (err) { }
    };

    const toggleIndex = () => setShowIndex(prev => !prev);

    const renderTajwid = (text) => {
        if (!text) return '';

        let processed = text;
        // Robust mapping for all common tags (b or span) to our simplified colors
        // Green: Ghunnah, Idgham
        processed = processed.replace(/<(b|span) class="(ghn|idg|idgh|idga|khf|mim)">/g, '<span class="tajwid-green">');
        // Blue: Ikhfa, Iqlab, Hamza-Wasl
        processed = processed.replace(/<(b|span) class="(ikh|iql|shf|ham_w)">/g, '<span class="tajwid-blue">');
        // Red: Madd, Qalqalah
        processed = processed.replace(/<(b|span) class="(mdd|qal)">/g, '<span class="tajwid-red">');

        // Close tags
        processed = processed.replace(/<\/(b|span)>/g, '</span>');

        // Handle bracketed tags just in case
        processed = processed.replace(/\[ghn\]/g, '<span class="tajwid-green">').replace(/\[\/ghn\]/g, '</span>');
        processed = processed.replace(/\[mdd\]/g, '<span class="tajwid-red">').replace(/\[\/mdd\]/g, '</span>');
        processed = processed.replace(/\[ikh\]/g, '<span class="tajwid-blue">').replace(/\[\/ikh\]/g, '</span>');

        return <span dangerouslySetInnerHTML={{ __html: processed }} />;
    };

    return (
        <div className="container">
            {/* Surah Index Modal */}
            <div className={`modal-overlay ${showIndex ? 'active' : ''}`} onClick={toggleIndex}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 style={{ color: 'var(--primary-light)' }}>Surah Index</h2>
                        <button className="close-btn" onClick={toggleIndex}>&times;</button>
                    </div>
                    <div className="surah-grid-modal">
                        {surahs.map(s => (
                            <div key={s.surahNumber} className="surah-card-small" onClick={() => selectSurahHandler(s.surahNumber)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="num">{s.surahNumber}</span>
                                    <span style={{ fontWeight: '600' }}>{s.surahName}</span>
                                </div>
                                <span style={{ fontSize: '1.1rem', opacity: 0.7 }}>{s.surahNameArabic}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 style={{ color: 'var(--primary-light)', margin: 0 }}>The Holy Qur'an</h1>
                    <button className="btn btn-outline" onClick={toggleIndex} style={{ padding: '8px 20px', borderRadius: '12px' }}>
                        📖 SURAH INDEX
                    </button>
                </div>
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

            <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
                {viewMode === 'page' ? (
                    <div className="mushaf-container">
                        <div className="mushaf-page">
                            {pageAyahs.reduce((acc, a, index) => {
                                const prev = pageAyahs[index - 1];
                                const showHeader = !prev || prev.surahNumber !== a.surahNumber;

                                if (showHeader) {
                                    acc.push(
                                        <div key={`header-${a.surahNumber}`} className="surah-header-mushaf">
                                            {a.surahNameArabic}
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
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                                ← Previous
                            </button>
                            <div className="page-indicator">Page {currentPage} / 604</div>
                            <button
                                className="btn btn-outline"
                                disabled={currentPage === 604}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="card glass no-scroll" style={{ height: '80vh', overflowY: 'auto', padding: '40px' }}>
                        {selectedSurah ? (
                            <div>
                                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary-light)' }}>
                                    {selectedSurah.surahName} <br />
                                    <span style={{ fontSize: '3rem', fontFamily: 'Amiri', marginTop: '10px', display: 'block' }}>{selectedSurah.surahNameArabic}</span>
                                </h2>
                                {selectedSurah.ayahs.map(a => (
                                    <div key={a.number} style={{ marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <p style={{ fontSize: '2.2rem', textAlign: 'right', direction: 'rtl', marginBottom: '20px', lineHeight: '2', fontFamily: 'Amiri' }}>
                                            {renderTajwid(a.tajwidText || a.text)} <span style={{ color: 'var(--secondary-light)', fontSize: '1.2rem', marginRight: '10px' }}>﴿{a.number}﴾</span>
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontStyle: 'italic' }}>{a.translation}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', marginTop: '150px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.5rem', marginBottom: '30px' }}>
                                    Select a Surah from the Index to start reading.
                                </p>
                                <button className="btn btn-primary" onClick={toggleIndex}>OPEN SURAH INDEX</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quran;
