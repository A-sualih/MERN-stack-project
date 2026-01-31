import React, { useEffect, useState, useCallback } from 'react';
import { useHttpClient } from '../hooks/http-hook';
import { getFromCache, saveToCache } from '../util/indexeddb';
import { API_BASE_URL } from '../config';
import './Tafsir.css';

const Tafsir = () => {
    const { isLoading, error, sendRequest } = useHttpClient();
    const [surahs, setSurahs] = useState([]);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [viewMode, setViewMode] = useState('surah'); // 'surah' or 'page'
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTafsir, setSelectedTafsir] = useState('muyassar');
    const [tafsirLanguage, setTafsirLanguage] = useState('ar');
    const [showSurahIndex, setShowSurahIndex] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const tafsirSources = [
        { id: 'muyassar', name: 'Al-Muyassar', arabicName: 'الميسر', field: 'muyassar', amharicField: 'muyassarAmharic', color: '#f39c12' },
        { id: 'ibnKathir', name: 'Ibn Kathir', arabicName: 'ابن كثير', field: 'ibnKathirArabic', amharicField: 'ibnKathirAmharic', color: '#d4af37' },
        { id: 'sadi', name: 'Al-Sa\'di', arabicName: 'السعدي', field: 'sadi', amharicField: 'sadiAmharic', color: '#9b59b6' },
        { id: 'tabari', name: 'Al-Tabari', arabicName: 'الطبري', field: 'tabari', amharicField: 'tabariAmharic', color: '#2ecc71' },
        { id: 'qurtubi', name: 'Al-Qurtubi', arabicName: 'القرطبي', field: 'qurtubi', amharicField: 'qurtubiAmharic', color: '#3498db' },
        { id: 'baghawi', name: 'Al-Baghawi', arabicName: 'البغوي', field: 'baghawi', amharicField: 'baghawiAmharic', color: '#16a085' },
        { id: 'wasit', name: 'Tantawi (Wasit)', arabicName: 'الوسيط', field: 'wasit', amharicField: 'wasitAmharic', color: '#e67e22' }
    ];

    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const cached = await getFromCache('allSurahs');
                if (cached) setSurahs(cached);
                const responseData = await sendRequest(`${API_BASE_URL}/api/quran`);
                setSurahs(responseData.surahs);
                saveToCache('allSurahs', responseData.surahs);
            } catch (err) { }
        };
        fetchSurahs();
    }, [sendRequest]);

    const selectSurahHandler = useCallback(async (surahNumber) => {
        try {
            const responseData = await sendRequest(`${API_BASE_URL}/api/quran/${surahNumber}`);
            setSelectedSurah(responseData.surah);
            setViewMode('surah');
            setShowSurahIndex(false);
        } catch (err) { }
    }, [sendRequest]);

    const renderTajwid = (text) => {
        if (!text) return '';
        let processed = text;
        processed = processed.replace(/<(b|span) class="(ghn|idg|idgh|idga|khf|mim)">/g, '<span class="tajwid-green">');
        processed = processed.replace(/<(b|span) class="(ikh|iql|shf|ham_w)">/g, '<span class="tajwid-blue">');
        processed = processed.replace(/<(b|span) class="(mdd|qal)">/g, '<span class="tajwid-red">');
        processed = processed.replace(/<\/(b|span)>/g, '</span>');
        return <span dangerouslySetInnerHTML={{ __html: processed }} />;
    };

    return (
        <div className="container tafsir-study-room">
            {/* Surah Index Modal */}
            <div className={`modal-overlay ${showSurahIndex ? 'active' : ''}`} onClick={() => setShowSurahIndex(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2 style={{ color: 'var(--secondary-light)' }}>📜 Scholarly Index</h2>
                        <button className="close-btn" onClick={() => setShowSurahIndex(false)}>&times;</button>
                    </div>
                    <div className="surah-grid-modal">
                        {surahs.map(s => (
                            <div key={s.surahNumber} className="surah-card-small" onClick={() => selectSurahHandler(s.surahNumber)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="num" style={{ background: 'var(--secondary)' }}>{s.surahNumber}</span>
                                    <span>{s.surahName}</span>
                                </div>
                                <span style={{ fontFamily: 'Amiri' }}>{s.surahNameArabic}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ color: 'var(--secondary-light)', margin: 0, fontSize: '2.2rem' }}>🏛️ Tafsir Study</h1>
                    <button className="btn btn-outline" onClick={() => setShowSurahIndex(true)} style={{ marginTop: '10px', borderColor: 'var(--secondary)' }}>
                        📖 SELECT SURAH
                    </button>
                </div>

                <div className="glass" style={{ padding: '5px', borderRadius: '12px', border: '1px solid var(--secondary)' }}>
                    <button className={`btn ${viewMode === 'page' ? 'btn-primary' : ''}`} onClick={() => setViewMode('page')} style={{ background: viewMode === 'page' ? 'var(--secondary)' : 'transparent' }}>
                        MUSHAF
                    </button>
                    <button className={`btn ${viewMode === 'surah' ? 'btn-primary' : ''}`} onClick={() => setViewMode('surah')} style={{ background: viewMode === 'surah' ? 'var(--secondary)' : 'transparent', marginLeft: '5px' }}>
                        LIST VIEW
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        value={selectedTafsir}
                        onChange={(e) => setSelectedTafsir(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--secondary)' }}
                    >
                        {tafsirSources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <button className="btn btn-primary" style={{ background: 'var(--secondary)' }} onClick={() => setTafsirLanguage(p => p === 'ar' ? 'am' : 'ar')}>
                        {tafsirLanguage === 'ar' ? 'العربية' : 'Amharic'}
                    </button>
                </div>
            </div>

            {viewMode === 'page' ? (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="mushaf-container-view" style={{ background: '#fffbf2', borderRadius: '15px', padding: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
                        <img
                            src={`https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${String(currentPage).padStart(3, '0')}.png`}
                            alt="page"
                            style={{ width: '100%', height: 'auto', borderRadius: '10px' }}
                        />
                        <div className="mushaf-controls" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                            <button className="btn btn-outline" onClick={() => setCurrentPage(p => Math.min(p + 1, 604))}>← Next</button>
                            <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>Page {currentPage}</span>
                            <button className="btn btn-outline" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}>Prev →</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="tafsir-list-container">
                    {selectedSurah ? (
                        <div className="full-width-list">
                            <h2 style={{ textAlign: 'center', color: 'var(--secondary-light)', marginBottom: '40px' }}>
                                {selectedSurah.surahNameArabic} <br />
                                <small style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{selectedSurah.surahName}</small>
                            </h2>
                            {selectedSurah.ayahs.map(ayah => (
                                <div key={ayah.number} className="card glass library-card" style={{ borderLeftColor: 'var(--secondary)', marginBottom: '30px' }}>
                                    <div className="decorative-arabic-container" style={{ padding: '20px' }}>
                                        <p className="arabic-text-main" style={{ fontSize: '2rem' }}>
                                            {renderTajwid(ayah.tajwidText || ayah.text)}
                                            <span style={{ color: 'var(--secondary)', fontSize: '1.2rem', marginLeft: '10px' }}>﴾{ayah.number}﴿</span>
                                        </p>
                                    </div>
                                    <div className="explanation-box history-mode" style={{ background: 'rgba(180, 83, 9, 0.05)' }}>
                                        <strong className="explanation-label" style={{ color: 'var(--secondary-light)' }}>
                                            Tafsir {tafsirSources.find(s => s.id === selectedTafsir).name}:
                                        </strong>
                                        <div
                                            className="explanation-text"
                                            style={{
                                                fontSize: tafsirLanguage === 'ar' ? '1.3rem' : '1.05rem',
                                                direction: tafsirLanguage === 'ar' ? 'rtl' : 'ltr',
                                                textAlign: tafsirLanguage === 'ar' ? 'right' : 'left',
                                                fontFamily: tafsirLanguage === 'ar' ? 'Amiri' : 'inherit'
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: ayah.tafsir?.[tafsirLanguage === 'ar' ?
                                                    tafsirSources.find(s => s.id === selectedTafsir).field :
                                                    tafsirSources.find(s => s.id === selectedTafsir).amharicField] || 'Commentary not available.'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card glass" style={{ textAlign: 'center', padding: '100px' }}>
                            <h3>Select a Surah to begin studying Tafsir.</h3>
                            <button className="btn btn-primary" style={{ background: 'var(--secondary)', marginTop: '20px' }} onClick={() => setShowSurahIndex(true)}>OPEN INDEX</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Tafsir;
