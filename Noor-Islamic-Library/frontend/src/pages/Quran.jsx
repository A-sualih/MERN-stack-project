import React, { useEffect, useState } from 'react';
import { useHttpClient } from '../hooks/http-hook';
import { getFromCache, saveToCache } from '../util/indexeddb';

const Quran = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [surahs, setSurahs] = useState([]);
    const [selectedSurah, setSelectedSurah] = useState(null);

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

    const selectSurahHandler = async (sid) => {
        try {
            const responseData = await sendRequest(`http://localhost:5000/api/quran/${sid}`);
            setSelectedSurah(responseData.surah);
        } catch (err) { }
    };

    return (
        <div className="container">
            <h1 style={{ marginBottom: '30px', color: 'var(--primary-light)' }}>The Holy Qur'an</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>
                <div className="card glass" style={{ height: '70vh', overflowY: 'auto' }}>
                    <h3>Surahs</h3>
                    <ul style={{ listStyle: 'none', marginTop: '15px' }}>
                        {surahs.map(s => (
                            <li key={s.surahNumber}
                                onClick={() => selectSurahHandler(s.surahNumber)}
                                style={{
                                    padding: '10px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid var(--glass-border)',
                                    background: selectedSurah?.surahNumber === s.surahNumber ? 'var(--primary)' : 'transparent'
                                }}>
                                {s.surahNumber}. {s.surahName} ({s.surahNameArabic})
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card glass" style={{ height: '70vh', overflowY: 'auto' }}>
                    {selectedSurah ? (
                        <div>
                            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{selectedSurah.surahName}</h2>
                            {selectedSurah.ayahs.map(a => (
                                <div key={a.number} style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '1.5rem', textAlign: 'right', direction: 'rtl', marginBottom: '10px' }}>{a.text} ﴿{a.number}﴾</p>
                                    <p style={{ color: 'var(--text-muted)' }}>{a.translation}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-muted)' }}>Select a Surah to start reading.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Quran;
