import React, { useEffect, useState, useCallback } from 'react';
import { useHttpClient } from '../hooks/http-hook';
import { getFromCache, saveToCache } from '../util/indexeddb';

const Tafsir = () => {
    const { isLoading, error, sendRequest } = useHttpClient();
    const [surahs, setSurahs] = useState([]);
    const [selectedSurah, setSelectedSurah] = useState(null);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [selectedTafsir, setSelectedTafsir] = useState('ibnKathir');
    const [tafsirLanguage, setTafsirLanguage] = useState('ar');
    const [showSurahIndex, setShowSurahIndex] = useState(false);

    // Tafsir sources configuration
    const tafsirSources = [
        { id: 'ibnKathir', name: 'Ibn Kathir', arabicName: 'ابن كثير', field: 'ibnKathirArabic', amharicField: 'ibnKathirAmharic', color: '#d4af37' },
        { id: 'tabari', name: 'Al-Tabari', arabicName: 'الطبري', field: 'tabari', amharicField: 'tabariAmharic', color: '#2ecc71' },
        { id: 'qurtubi', name: 'Al-Qurtubi', arabicName: 'القرطبي', field: 'qurtubi', amharicField: 'qurtubiAmharic', color: '#3498db' },
        { id: 'sadi', name: 'Al-Sa\'di', arabicName: 'السعدي', field: 'sadi', amharicField: 'sadiAmharic', color: '#9b59b6' },
        { id: 'baghawi', name: 'Al-Baghawi', arabicName: 'البغوي', field: 'baghawi', amharicField: 'baghawiAmharic', color: '#e74c3c' },
        { id: 'wasit', name: 'Al-Wasit', arabicName: 'الوسيط', field: 'wasit', amharicField: 'wasitAmharic', color: '#1abc9c' },
        { id: 'muyassar', name: 'Al-Muyassar', arabicName: 'الميسر', field: 'muyassar', amharicField: 'muyassarAmharic', color: '#f39c12' }
    ];

    // Fetch all surahs on mount
    useEffect(() => {
        const fetchSurahs = async () => {
            try {
                const cached = await getFromCache('allSurahs');
                if (cached) setSurahs(cached);

                const responseData = await sendRequest('http://localhost:5000/api/quran');
                setSurahs(responseData.surahs);
                saveToCache('allSurahs', responseData.surahs);
            } catch (err) { }
        };
        fetchSurahs();
    }, [sendRequest]);

    // Select surah handler
    const selectSurahHandler = useCallback(async (surahNumber) => {
        try {
            const cacheKey = `surah_${surahNumber}`;
            const cached = await getFromCache(cacheKey);
            if (cached) {
                setSelectedSurah(cached);
                setCurrentAyahIndex(0);
                setShowSurahIndex(false);
                return;
            }

            const responseData = await sendRequest(`http://localhost:5000/api/quran/${surahNumber}`);
            setSelectedSurah(responseData.surah);
            setCurrentAyahIndex(0);
            setShowSurahIndex(false);
            saveToCache(cacheKey, responseData.surah);
        } catch (err) { }
    }, [sendRequest]);

    // Get current Tafsir content
    const getCurrentTafsir = () => {
        if (!selectedSurah || !selectedSurah.ayahs[currentAyahIndex]) return '';
        const ayah = selectedSurah.ayahs[currentAyahIndex];
        const source = tafsirSources.find(t => t.id === selectedTafsir);
        if (!source || !ayah.tafsir) return '';

        const fieldToUse = tafsirLanguage === 'ar' ? source.field : source.amharicField;
        return ayah.tafsir[fieldToUse] || '';
    };

    // Render Tajwid text
    const renderTajwid = (text) => {
        if (!text) return '';
        let processed = text;
        processed = processed.replace(/<(b|span) class="(ghn|idg|idgh|idga|khf|mim)">/g, '<span class="tajwid-green">');
        processed = processed.replace(/<(b|span) class="(ikh|iql|shf|ham_w)">/g, '<span class="tajwid-blue">');
        processed = processed.replace(/<(b|span) class="(mdd|qal)">/g, '<span class="tajwid-red">');
        processed = processed.replace(/<\/(b|span)>/g, '</span>');
        return <span dangerouslySetInnerHTML={{ __html: processed }} />;
    };

    const currentAyah = selectedSurah?.ayahs[currentAyahIndex];
    const currentSource = tafsirSources.find(t => t.id === selectedTafsir);

    return (
        <div className="container">
            {/* Surah Index Modal */}
            <div className={`modal-overlay ${showSurahIndex ? 'active' : ''}`} onClick={() => setShowSurahIndex(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                    <div className="modal-header">
                        <h2 style={{ color: 'var(--primary-light)' }}>Select a Surah</h2>
                        <button className="close-btn" onClick={() => setShowSurahIndex(false)}>&times;</button>
                    </div>
                    <div className="surah-grid-modal">
                        {surahs.map(s => (
                            <div
                                key={s.surahNumber}
                                className="surah-card-small"
                                onClick={() => selectSurahHandler(s.surahNumber)}
                                style={{
                                    background: selectedSurah?.surahNumber === s.surahNumber
                                        ? 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))'
                                        : undefined
                                }}
                            >
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

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 style={{ color: 'var(--primary-light)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '2rem' }}>📚</span> Tafsir
                    </h1>
                    <button className="btn btn-outline" onClick={() => setShowSurahIndex(true)} style={{ padding: '8px 20px', borderRadius: '12px' }}>
                        📖 SELECT SURAH
                    </button>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setTafsirLanguage(prev => prev === 'ar' ? 'am' : 'ar')}
                    style={{ padding: '8px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
                >
                    {tafsirLanguage === 'ar' ? '🇸🇦 Arabic' : '🇪🇹 Amharic'}
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!selectedSurah ? (
                /* Welcome Screen */
                <div className="card glass" style={{ textAlign: 'center', padding: '80px 40px' }}>
                    <h2 style={{ color: 'var(--primary-light)', marginBottom: '20px', fontSize: '2rem' }}>
                        Explore Quranic Commentary
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 40px' }}>
                        Discover the wisdom of renowned scholars including Ibn Kathir, Al-Tabari, Al-Qurtubi, Al-Sa'di, Al-Baghawi, and more.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                        {tafsirSources.map(source => (
                            <div key={source.id} style={{
                                padding: '15px 25px',
                                background: `linear-gradient(135deg, ${source.color}20, ${source.color}40)`,
                                borderRadius: '12px',
                                border: `1px solid ${source.color}50`
                            }}>
                                <span style={{ fontFamily: 'Amiri', fontSize: '1.3rem', color: source.color }}>{source.arabicName}</span>
                                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', margin: '5px 0 0' }}>{source.name}</p>
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-primary" onClick={() => setShowSurahIndex(true)} style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
                        Start Reading Tafsir
                    </button>
                </div>
            ) : (
                /* Tafsir Reader */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                    {/* Surah Info Bar */}
                    <div className="glass" style={{ padding: '15px 25px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{
                                width: '50px', height: '50px',
                                background: 'linear-gradient(135deg, var(--primary-light), var(--secondary-light))',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '1.2rem'
                            }}>
                                {selectedSurah.surahNumber}
                            </span>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--text-light)' }}>{selectedSurah.surahName}</h3>
                                <span style={{ fontFamily: 'Amiri', fontSize: '1.3rem', color: 'var(--primary-light)' }}>{selectedSurah.surahNameArabic}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Ayah</span>
                            <select
                                value={currentAyahIndex}
                                onChange={(e) => setCurrentAyahIndex(parseInt(e.target.value))}
                                style={{
                                    padding: '8px 15px',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'var(--text-light)',
                                    fontSize: '1rem'
                                }}
                            >
                                {selectedSurah.ayahs.map((a, idx) => (
                                    <option key={a.number} value={idx} style={{ background: '#1a1a2e' }}>
                                        {a.number}
                                    </option>
                                ))}
                            </select>
                            <span style={{ color: 'var(--text-muted)' }}>/ {selectedSurah.ayahs.length}</span>
                        </div>
                    </div>

                    {/* Arabic Ayah Display */}
                    <div className="card glass" style={{ padding: '30px', textAlign: 'center' }}>
                        <p style={{
                            fontSize: '2.2rem',
                            textAlign: 'right',
                            direction: 'rtl',
                            fontFamily: 'Amiri',
                            lineHeight: '2',
                            color: '#1a1a1a',
                            background: 'linear-gradient(135deg, #fdf6e3, #fff8dc)',
                            padding: '25px',
                            borderRadius: '15px',
                            border: '1px solid #d4af37',
                            marginBottom: '0'
                        }}>
                            {currentAyah && renderTajwid(currentAyah.tajwidText || currentAyah.text)}
                            <span style={{ color: '#d4af37', fontSize: '1.2rem', marginRight: '10px' }}>﴿{currentAyah?.number}﴾</span>
                        </p>
                    </div>

                    {/* Scholar Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        paddingBottom: '10px'
                    }}>
                        {tafsirSources.map(source => (
                            <button
                                key={source.id}
                                onClick={() => setSelectedTafsir(source.id)}
                                style={{
                                    padding: '12px 20px',
                                    borderRadius: '10px',
                                    border: selectedTafsir === source.id ? 'none' : `1px solid ${source.color}50`,
                                    background: selectedTafsir === source.id
                                        ? `linear-gradient(135deg, ${source.color}, ${source.color}cc)`
                                        : 'rgba(255,255,255,0.03)',
                                    color: selectedTafsir === source.id ? '#fff' : 'var(--text-light)',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: selectedTafsir === source.id ? '600' : '400',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.3s ease',
                                    boxShadow: selectedTafsir === source.id ? `0 4px 15px ${source.color}40` : 'none'
                                }}
                            >
                                <span style={{ fontFamily: 'Amiri', marginRight: '8px' }}>{source.arabicName}</span>
                                {source.name}
                            </button>
                        ))}
                    </div>

                    {/* Tafsir Content */}
                    <div className="card glass" style={{ padding: '30px', minHeight: '300px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            paddingBottom: '15px',
                            borderBottom: `2px solid ${currentSource?.color || 'var(--primary-light)'}30`
                        }}>
                            <h3 style={{ margin: 0, color: currentSource?.color || 'var(--primary-light)' }}>
                                {currentSource?.name}
                            </h3>
                            <span style={{ fontFamily: 'Amiri', fontSize: '1.5rem', color: currentSource?.color || 'var(--primary-light)' }}>
                                {currentSource?.arabicName}
                            </span>
                        </div>

                        {isLoading ? (
                            <div className="loading-spinner" style={{ margin: '50px auto' }}>
                                <div className="spinner"></div>
                            </div>
                        ) : getCurrentTafsir() ? (
                            <div
                                style={{
                                    color: 'var(--text-light)',
                                    lineHeight: tafsirLanguage === 'ar' ? '2.2' : '1.9',
                                    fontSize: tafsirLanguage === 'ar' ? '1.4rem' : '1.1rem',
                                    textAlign: tafsirLanguage === 'ar' ? 'right' : 'left',
                                    direction: tafsirLanguage === 'ar' ? 'rtl' : 'ltr',
                                    fontFamily: tafsirLanguage === 'ar' ? 'Amiri' : 'inherit'
                                }}
                                dangerouslySetInnerHTML={{ __html: getCurrentTafsir() }}
                            />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontStyle: 'italic' }}>
                                    {tafsirLanguage === 'am'
                                        ? 'Amharic translation not available for this Tafsir yet.'
                                        : 'Tafsir not available for this Ayah. Try selecting a different scholar.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-outline"
                            disabled={currentAyahIndex === 0 && selectedSurah.surahNumber === 1}
                            onClick={() => {
                                if (currentAyahIndex > 0) {
                                    setCurrentAyahIndex(prev => prev - 1);
                                } else if (selectedSurah.surahNumber > 1) {
                                    selectSurahHandler(selectedSurah.surahNumber - 1);
                                }
                            }}
                            style={{ flex: 1, minWidth: '150px' }}
                        >
                            ← Previous Ayah
                        </button>

                        <button
                            className="btn btn-outline"
                            onClick={() => setShowSurahIndex(true)}
                            style={{ padding: '12px 25px' }}
                        >
                            📖 Change Surah
                        </button>

                        <button
                            className="btn btn-outline"
                            disabled={currentAyahIndex >= selectedSurah.ayahs.length - 1 && selectedSurah.surahNumber === 114}
                            onClick={() => {
                                if (currentAyahIndex < selectedSurah.ayahs.length - 1) {
                                    setCurrentAyahIndex(prev => prev + 1);
                                } else if (selectedSurah.surahNumber < 114) {
                                    selectSurahHandler(selectedSurah.surahNumber + 1);
                                }
                            }}
                            style={{ flex: 1, minWidth: '150px' }}
                        >
                            Next Ayah →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tafsir;
