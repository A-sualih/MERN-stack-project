import React, { useEffect, useState } from 'react';
import { useHttpClient } from '../hooks/http-hook';
import { useParams } from 'react-router-dom';
import './Library.css';

const Library = () => {
    const { category } = useParams();
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const responseData = await sendRequest(`http://localhost:5000/api/library/category/${category}`);
                setItems(responseData.items);
            } catch (err) { }
        };
        fetchItems();
    }, [sendRequest, category]);

    const getIcon = () => {
        switch (category) {
            case 'Duas': return '📿';
            case 'Seerah': return '📜';
            case 'Fiqh': return '⚖️';
            case 'Tafsir': return '📖';
            default: return '📚';
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="container library-page-container" data-category={category}>
            <header className="library-header">
                <h1>
                    <span>{getIcon()}</span>
                    <span style={{ textTransform: 'capitalize' }}>{category}</span>
                </h1>
                <p>Explore authentic {category.toLowerCase()} from reliable sources.</p>
            </header>

            {isLoading && <div className="loading-spinner">Loading highly authentic content...</div>}
            {error && <p className="error-message">{error}</p>}

            <div className={category === 'Seerah' ? "full-width-list" : "library-grid"}>
                {items.length > 0 ? (
                    items.map(item => (
                        <div key={item._id} className={`card glass library-card ${category === 'Seerah' ? 'seerah-detail-card' : ''} ${category === 'Fiqh' ? 'fiqh-card' : ''}`}>
                            <div className="library-card-header">
                                <h3 className="library-card-title">{item.title}</h3>
                                {(item.arabicText || item.translation) && (
                                    <button
                                        onClick={() => copyToClipboard(`${item.arabicText || ''}\n\n${item.translation || ''}\n\n${item.explanation || ''}`)}
                                        className="btn btn-outline copy-btn"
                                        title="Copy to clipboard"
                                    >
                                        COPY TEXT
                                    </button>
                                )}
                            </div>

                            {item.subTopic && (
                                <div className={`subtopic-badge ${category === 'Fiqh' ? 'fiqh-badge' : ''}`}>
                                    {item.subTopic}
                                </div>
                            )}

                            {item.arabicText && (
                                <div className="decorative-arabic-container">
                                    <p className="arabic-text-main">
                                        {item.arabicText}
                                    </p>
                                </div>
                            )}

                            {item.translation && (
                                <div className="translation-box">
                                    <p className="translation-text">
                                        {item.translation}
                                    </p>
                                </div>
                            )}

                            {item.explanation && (
                                <div className={`explanation-box ${category === 'Seerah' ? 'history-mode' : (category === 'Fiqh' ? 'law-mode' : 'benefit-mode')}`}>
                                    <strong className="explanation-label">
                                        {category === 'Seerah' ? 'ታሪካዊ ዝርዝር (Detailed History):' : (category === 'Fiqh' ? '⚖️ Ruling / Principle:' : '📌 Benefit / Explanation:')}
                                    </strong>
                                    <p className="explanation-text">{item.explanation}</p>
                                </div>
                            )}

                            {item.reference && (
                                <p className="source-label">
                                    Source: {item.reference}
                                </p>
                            )}
                        </div>
                    ))
                ) : (
                    !isLoading && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No content available for this section yet.</p>
                )}
            </div>
        </div>
    );
};

export default Library;
