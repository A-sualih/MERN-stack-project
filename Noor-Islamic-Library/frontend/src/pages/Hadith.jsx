import React, { useEffect, useState } from 'react';
import { useHttpClient } from '../hooks/http-hook';
import { getFromCache, saveToCache } from '../util/indexeddb';

const Hadith = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [collections, setCollections] = useState([]);
    const [hadiths, setHadiths] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const cachedCollections = await getFromCache('hadithCollections');
                if (cachedCollections) {
                    setCollections(cachedCollections);
                }

                const responseData = await sendRequest('http://localhost:5000/api/hadith/collections');
                setCollections(responseData.collections);
                saveToCache('hadithCollections', responseData.collections);
            } catch (err) { }
        };
        fetchCollections();
    }, [sendRequest]);

    const fetchHadiths = async (col) => {
        try {
            const responseData = await sendRequest(`http://localhost:5000/api/hadith/${col}`);
            setHadiths(responseData.hadiths);
        } catch (err) { }
    };

    const searchHandler = async (e) => {
        e.preventDefault();
        try {
            const responseData = await sendRequest(`http://localhost:5000/api/hadith/search?q=${searchTerm}`);
            setHadiths(responseData.result);
        } catch (err) { }
    };

    return (
        <div className="container">
            <h1 style={{ marginBottom: '30px', color: 'var(--primary-light)' }}>Hadith Collections</h1>

            <form onSubmit={searchHandler} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
                <input
                    className="form-control"
                    placeholder="Search Hadith by keyword..."
                    style={{ marginBottom: 0 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-primary">SEARCH</button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
                <div className="card glass">
                    <h3>Collections</h3>
                    <ul style={{ listStyle: 'none', marginTop: '15px' }}>
                        {collections.map(c => (
                            <li key={c}
                                onClick={() => fetchHadiths(c)}
                                style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--glass-border)' }}>
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card glass" style={{ height: '70vh', overflowY: 'auto' }}>
                    {hadiths.length > 0 ? (
                        hadiths.map(h => (
                            <div key={h._id} style={{ marginBottom: '25px', padding: '20px', borderBottom: '1px solid var(--glass-border)' }}>
                                <small style={{ color: 'var(--secondary-light)' }}>{h.collection} - Hadith #{h.hadithNumber}</small>
                                <p style={{ fontWeight: '600', margin: '10px 0' }}>{h.narrator}</p>
                                <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{h.text}</p>
                                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{h.translation}</p>
                                {h.amharicTranslation && (
                                    <p style={{ color: 'var(--primary-light)', marginTop: '8px', fontWeight: '500' }}>{h.amharicTranslation}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-muted)' }}>Select a collection or search to see hadiths.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Hadith;
