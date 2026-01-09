import React, { useEffect, useState, useContext } from 'react';
import { useHttpClient } from '../hooks/http-hook';
import { AuthContext } from '../context/auth-context';

const Books = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [books, setBooks] = useState([]);
    const [showUpload, setShowUpload] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [file, setFile] = useState(null);

    const fetchBooks = async () => {
        try {
            const responseData = await sendRequest('http://localhost:5000/api/books');
            setBooks(responseData.books);
        } catch (err) { }
    };

    useEffect(() => {
        fetchBooks();
    }, [sendRequest]);

    const bookSubmitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('category', category);
        formData.append('pdf', file);

        try {
            await sendRequest(
                'http://localhost:5000/api/books',
                'POST',
                formData,
                { Authorization: 'Bearer ' + auth.token }
            );
            setShowUpload(false);
            fetchBooks();
        } catch (err) { }
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ color: 'var(--primary-light)' }}>Islamic Library Books</h1>
                {auth.role === 'admin' && (
                    <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
                        {showUpload ? 'CLOSE' : 'UPLOAD BOOK'}
                    </button>
                )}
            </div>

            {showUpload && (
                <div className="card glass" style={{ marginBottom: '40px' }}>
                    <h3>Upload New Islamic Book (PDF)</h3>
                    <form onSubmit={bookSubmitHandler} style={{ marginTop: '20px' }}>
                        <input className="form-control" placeholder="Book Title" value={title} onChange={e => setTitle(e.target.value)} required />
                        <input className="form-control" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} required />
                        <input className="form-control" placeholder="Category (e.g. Fiqh, Seerah)" value={category} onChange={e => setCategory(e.target.value)} required />
                        <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} required style={{ marginBottom: '20px' }} />
                        <button className="btn btn-primary" type="submit">SUBMIT PDF</button>
                    </form>
                </div>
            )}

            <div className="grid">
                {books.map(b => (
                    <div key={b._id} className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📕</div>
                            <h3 style={{ marginBottom: '5px' }}>{b.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>By {b.author}</p>
                            <span style={{
                                display: 'inline-block',
                                marginTop: '10px',
                                padding: '4px 8px',
                                background: 'var(--primary)',
                                fontSize: '0.7rem',
                                borderRadius: '4px'
                            }}>
                                {b.category}
                            </span>
                        </div>
                        <a
                            href={`http://localhost:5000/${b.pdfUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline"
                            style={{ marginTop: '20px', textAlign: 'center' }}
                        >
                            READ PDF
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Books;
