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
    const [language, setLanguage] = useState('am'); // 'en' or 'am'
    const [selectedAyahForTafsir, setSelectedAyahForTafsir] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    const [selectedTafsir, setSelectedTafsir] = useState('muyassar'); // Default Tafsir
    const [tafsirLanguage, setTafsirLanguage] = useState('ar'); // 'ar' or 'am' for Tafsir

    useEffect(() => {
        setImageLoading(true);
    }, [currentPage]);

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
    const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'am' : 'en');

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

    const handleAyahClick = (a) => {
        setSelectedAyahForTafsir(a);
    };

    // Tafsir data structure
    const tafsirSources = [
        { id: 'muyassar', name: 'Al-Muyassar', arabicName: 'الميسر', field: 'muyassar', amharicField: 'muyassarAmharic' },
        { id: 'ibnKathir', name: 'Ibn Kathir', arabicName: 'ابن كثير', field: 'ibnKathirArabic', amharicField: 'ibnKathirAmharic' },
        { id: 'tabari', name: 'Al-Tabari', arabicName: 'الطبري', field: 'tabari', amharicField: 'tabariAmharic' },
        { id: 'qurtubi', name: 'Al-Qurtubi', arabicName: 'القرطبي', field: 'qurtubi', amharicField: 'qurtubiAmharic' },
        { id: 'sadi', name: 'Al-Sa\'di', arabicName: 'السعدي', field: 'sadi', amharicField: 'sadiAmharic' },
        { id: 'baghawi', name: 'Al-Baghawi', arabicName: 'البغوي', field: 'baghawi', amharicField: 'baghawiAmharic' },
        { id: 'wasit', name: 'Al-Wasit', arabicName: 'الوسيط', field: 'wasit', amharicField: 'wasitAmharic' }
    ];

    const getCurrentTafsir = () => {
        const source = tafsirSources.find(t => t.id === selectedTafsir);
        if (!source || !selectedAyahForTafsir?.tafsir) return '';

        const fieldToUse = tafsirLanguage === 'ar' ? source.field : source.amharicField;
        return selectedAyahForTafsir.tafsir[fieldToUse] || '';
    };

    return (
        <div className="container">
            {/* Tafsir Modal */}
            <div className={`modal-overlay ${selectedAyahForTafsir ? 'active' : ''}`} onClick={() => setSelectedAyahForTafsir(null)}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
                    <div className="modal-header">
                        <h2 style={{ color: 'var(--primary-light)' }}>
                            Ayah {selectedAyahForTafsir?.number} - Tafsir
                        </h2>
                        <button className="close-btn" onClick={() => setSelectedAyahForTafsir(null)}>&times;</button>
                    </div>
                    <div style={{ overflowY: 'auto', padding: '20px' }}>
                        {/* Arabic Text */}
                        <p style={{
                            fontSize: '2rem',
                            textAlign: 'right',
                            direction: 'rtl',
                            fontFamily: 'Amiri',
                            marginBottom: '20px',
                            color: '#1a1a1a',
                            background: '#fdf6e3',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid #d4af37'
                        }}>
                            {selectedAyahForTafsir && renderTajwid(selectedAyahForTafsir.tajwidText || selectedAyahForTafsir.text)}
                        </p>

                        {/* Translation */}
                        <div style={{ marginBottom: '30px' }}>
                            <h4 style={{ color: 'var(--secondary-light)', marginBottom: '10px' }}>
                                Translation ({language === 'en' ? 'English' : 'Amharic'})
                            </h4>
                            <p style={{ color: 'var(--text-light)', lineHeight: '1.8', fontSize: '1.1rem' }}>
                                {language === 'en' ? selectedAyahForTafsir?.translation : selectedAyahForTafsir?.amharicTranslation}
                            </p>
                        </div>

                        {/* Tafsir Section */}
                        <div style={{ marginTop: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                                <h3 style={{ color: 'var(--primary-light)', margin: 0 }}>Tafsir (Commentary)</h3>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setTafsirLanguage(prev => prev === 'ar' ? 'am' : 'ar')}
                                    style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                                >
                                    {tafsirLanguage === 'ar' ? '🇸🇦 Arabic' : '🇪🇹 Amharic'}
                                </button>
                            </div>

                            {/* Tafsir Tabs */}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginBottom: '20px',
                                overflowX: 'auto',
                                paddingBottom: '10px',
                                borderBottom: '2px solid rgba(255,255,255,0.1)'
                            }}>
                                {tafsirSources.map(source => (
                                    <button
                                        key={source.id}
                                        onClick={() => setSelectedTafsir(source.id)}
                                        style={{
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: selectedTafsir === source.id
                                                ? 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))'
                                                : 'rgba(255,255,255,0.05)',
                                            color: selectedTafsir === source.id ? '#fff' : 'var(--text-light)',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: selectedTafsir === source.id ? '600' : '400',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.3s ease',
                                            boxShadow: selectedTafsir === source.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                                        }}
                                    >
                                        {source.name}
                                    </button>
                                ))}
                            </div>

                            {/* Tafsir Content */}
                            <div style={{
                                padding: '25px',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '15px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                minHeight: '200px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '15px'
                                }}>
                                    <h4 style={{ color: 'var(--secondary-light)', margin: 0 }}>
                                        {tafsirSources.find(t => t.id === selectedTafsir)?.name}
                                    </h4>
                                    <span style={{ fontFamily: 'Amiri', fontSize: '1.3rem', color: 'var(--primary-light)' }}>
                                        {tafsirSources.find(t => t.id === selectedTafsir)?.arabicName}
                                    </span>
                                </div>

                                {getCurrentTafsir() ? (
                                    <div
                                        style={{
                                            color: 'var(--text-light)',
                                            lineHeight: tafsirLanguage === 'ar' ? '2.2' : '1.8',
                                            fontSize: tafsirLanguage === 'ar' ? '1.4rem' : '1.1rem',
                                            textAlign: tafsirLanguage === 'ar' ? 'right' : 'left',
                                            direction: tafsirLanguage === 'ar' ? 'rtl' : 'ltr',
                                            fontFamily: tafsirLanguage === 'ar' ? 'Amiri' : 'inherit',
                                            padding: '10px'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: getCurrentTafsir() }}
                                    />
                                ) : (
                                    <p style={{
                                        color: 'var(--text-muted)',
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        padding: '40px 20px'
                                    }}>
                                        {tafsirLanguage === 'am'
                                            ? 'Amharic translation not available for this Tafsir yet.'
                                            : 'Tafsir not available for this ayah.'}
                                    </p>
                                )}
                            </div>

                            {/* English Ibn Kathir (Abridged) - if available */}
                            {selectedAyahForTafsir?.tafsir?.ibnKathir && selectedTafsir === 'ibnKathir' && (
                                <div style={{ marginTop: '20px', opacity: 0.7 }}>
                                    <h4 style={{ color: 'var(--secondary-light)', marginBottom: '10px', fontSize: '0.9rem' }}>
                                        English Translation (Abridged)
                                    </h4>
                                    <div
                                        style={{
                                            color: 'var(--text-muted)',
                                            lineHeight: '1.6',
                                            fontSize: '0.95rem',
                                            padding: '15px',
                                            background: 'rgba(255,255,255,0.01)',
                                            borderRadius: '10px'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: selectedAyahForTafsir.tafsir.ibnKathir }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 style={{ color: 'var(--primary-light)', margin: 0 }}>The Holy Qur'an</h1>
                    <button className="btn btn-outline" onClick={toggleIndex} style={{ padding: '8px 20px', borderRadius: '12px' }}>
                        📖 SURAH INDEX
                    </button>
                    <button className="btn btn-primary" onClick={toggleLanguage} style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '0.8rem' }}>
                        {language === 'en' ? 'ENGLISH ⇄ AMHARIC' : 'AMHARIC ⇄ ENGLISH'}
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
                    <div className="mushaf-container-view" style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        {(isLoading || imageLoading) && (
                            <div className="loading-spinner" style={{ position: 'absolute', zIndex: 10 }}>
                                <div className="spinner"></div>
                            </div>
                        )}

                        <div style={{
                            position: 'relative',
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            // Add paper-like background for the page itself
                            background: '#fffbf2',
                            borderRadius: '15px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            overflow: 'hidden',
                            padding: '10px'
                        }}>
                            <img
                                src={`https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${String(currentPage).padStart(3, '0')}.png`}
                                alt={`Page ${currentPage}`}
                                style={{
                                    maxHeight: '100%',
                                    maxWidth: '100%',
                                    objectFit: 'contain',
                                    opacity: imageLoading ? 0 : 1,
                                    transition: 'opacity 0.3s ease',
                                    // Multiply blends the text nicely with the cream background
                                    filter: 'multiply contrast(1.1)'
                                }}
                                onLoad={() => setImageLoading(false)}
                                onError={(e) => {
                                    setImageLoading(false);
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML += '<div style="color:red; text-align:center; padding: 20px;">Failed to load image.<br/>Check internet connection.</div>';
                                }}
                            />

                            {/* Hidden preloader for next page */}
                            <img
                                src={`https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/${String(currentPage + 1).padStart(3, '0')}.png`}
                                style={{ display: 'none' }}
                                alt="preload"
                            />
                        </div>

                        <div className="mushaf-controls" style={{ marginTop: '15px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                            <button
                                className="btn btn-outline"
                                disabled={currentPage === 604}
                                onClick={() => {
                                    setCurrentPage(prev => Math.min(prev + 1, 604));
                                }}
                                style={{ flex: '1 1 auto', minWidth: '120px' }}
                            >
                                ← Next Page
                            </button>

                            <div className="page-indicator" style={{ color: 'var(--text-light)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                Page {currentPage} / 604
                            </div>

                            <button
                                className="btn btn-outline"
                                disabled={currentPage === 1}
                                onClick={() => {
                                    setCurrentPage(prev => Math.max(prev - 1, 1));
                                }}
                                style={{ flex: '1 1 auto', minWidth: '120px' }}
                            >
                                Previous Page →
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
                                        <p style={{ color: 'var(--text-light)', fontSize: '1.2rem', marginBottom: '10px' }}>
                                            {language === 'en' ? a.translation : a.amharicTranslation}
                                        </p>
                                        <button className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '5px 10px' }} onClick={() => handleAyahClick(a)}>
                                            VIEW TAFSIR
                                        </button>
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
