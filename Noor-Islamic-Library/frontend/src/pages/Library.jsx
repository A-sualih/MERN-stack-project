import React, { useEffect, useState } from 'react';
import { useHttpClient } from '../hooks/http-hook';
import { useParams } from 'react-router-dom';

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

    return (
        <div className="container">
            <h1 style={{ marginBottom: '30px', color: 'var(--primary-light)', textTransform: 'capitalize' }}>{category}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className="grid">
                {items.length > 0 ? (
                    items.map(item => (
                        <div key={item._id} className="card glass">
                            <h3>{item.title}</h3>
                            {item.subTopic && <small style={{ color: 'var(--secondary-light)' }}>{item.subTopic}</small>}
                            {item.arabicText && <p style={{ fontSize: '1.2rem', margin: '15px 0', direction: 'rtl', textAlign: 'right' }}>{item.arabicText}</p>}
                            {item.translation && <p style={{ fontStyle: 'italic', marginBottom: '10px' }}>{item.translation}</p>}
                            {item.explanation && <p style={{ color: 'var(--text-muted)' }}>{item.explanation}</p>}
                        </div>
                    ))
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>No content available for this section yet.</p>
                )}
            </div>
        </div>
    );
};

export default Library;
