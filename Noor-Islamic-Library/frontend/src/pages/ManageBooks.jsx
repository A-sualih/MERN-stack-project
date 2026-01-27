import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { useHttpClient } from '../hooks/http-hook';
import './AdminDashboard.css';

const ManageBooks = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBookId, setCurrentBookId] = useState(null);
    const [form, setForm] = useState({
        title: '',
        author: '',
        description: '',
        category: '',
        language: 'Amharic',
        pdf: null,
        epub: null,
        image: null
    });

    useEffect(() => {
        fetchData();
    }, [sendRequest, auth.token]);

    const fetchData = async () => {
        try {
            const booksData = await sendRequest('http://localhost:5000/api/books');
            setBooks(booksData.books);
            const catsData = await sendRequest('http://localhost:5000/api/categories');
            setCategories(catsData.categories);
            if (catsData.categories.length > 0) {
                setForm(prev => ({ ...prev, category: catsData.categories[0].name }));
            }
        } catch (err) { }
    };

    const handleFileChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.files[0] });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('author', form.author);
        formData.append('description', form.description);
        formData.append('category', form.category);
        formData.append('language', form.language);
        if (form.pdf) formData.append('pdf', form.pdf);
        if (form.epub) formData.append('epub', form.epub);
        if (form.image) formData.append('image', form.image);

        try {
            if (isEditing) {
                await sendRequest(
                    `http://localhost:5000/api/books/${currentBookId}`,
                    'PATCH',
                    formData,
                    { Authorization: 'Bearer ' + auth.token }
                );
            } else {
                await sendRequest(
                    'http://localhost:5000/api/books',
                    'POST',
                    formData,
                    { Authorization: 'Bearer ' + auth.token }
                );
            }
            setShowAddModal(false);
            fetchData();
            resetForm();
        } catch (err) { }
    };

    const resetForm = () => {
        setForm({ title: '', author: '', description: '', category: categories[0]?.name || '', language: 'Amharic', pdf: null, epub: null, image: null });
        setIsEditing(false);
        setCurrentBookId(null);
    };

    const deleteHandler = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        try {
            await sendRequest(`http://localhost:5000/api/books/${id}`, 'DELETE', null, {
                Authorization: 'Bearer ' + auth.token
            });
            setBooks(prev => prev.filter(b => b.id !== id));
        } catch (err) { }
    };

    const editHandler = (book) => {
        setForm({
            title: book.title,
            author: book.author,
            description: book.description || '',
            category: book.category,
            language: book.language || 'Amharic',
            pdf: null,
            epub: null,
            image: null
        });
        setCurrentBookId(book.id);
        setIsEditing(true);
        setShowAddModal(true);
    };

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    <button onClick={() => window.location.href = '/admin'}>📊 Overview</button>
                    <button className="active">📚 Books</button>
                    <button onClick={() => window.location.href = '/admin/categories'}>📁 Categories</button>
                </nav>
            </aside>

            <main className="admin-main-content">
                <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Islamic Books Management</h1>
                    <button className="btn-save" onClick={() => { resetForm(); setShowAddModal(true); }}>+ Add New Book</button>
                </header>

                {error && <div className="error-message">{error}</div>}
                {isLoading && <div className="loading-spinner">Re-indexing digital asset repository...</div>}

                <div className="users-section">
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Category</th>
                                    <th>Language</th>
                                    <th>Stats</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map(book => (
                                    <tr key={book.id}>
                                        <td>{book.title}</td>
                                        <td>{book.author}</td>
                                        <td>{book.category}</td>
                                        <td>{book.language}</td>
                                        <td>👁️ {book.views || 0} | 📥 {book.downloads || 0}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit" onClick={() => editHandler(book)}>Edit</button>
                                                <button className="btn-delete" onClick={() => deleteHandler(book.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {showAddModal && (
                <div className="modal-overlay active" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
                        </div>
                        <form onSubmit={submitHandler} className="edit-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label>Title</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Author</label>
                                <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} required />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', minHeight: '80px' }}
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Language</label>
                                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                                    <option value="Amharic">Amharic</option>
                                    <option value="Arabic">Arabic</option>
                                    <option value="English">English</option>
                                    <option value="Oromo">Oromo</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>PDF File {isEditing && '(Optional)'}</label>
                                <input type="file" name="pdf" onChange={handleFileChange} accept=".pdf" required={!isEditing} />
                            </div>
                            <div className="form-group">
                                <label>EPUB File (Optional)</label>
                                <input type="file" name="epub" onChange={handleFileChange} accept=".epub" />
                            </div>
                            <div className="form-group">
                                <label>Cover Image</label>
                                <input type="file" name="image" onChange={handleFileChange} accept="image/*" />
                            </div>
                            <div className="form-actions" style={{ gridColumn: 'span 2' }}>
                                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">{isEditing ? 'Update Book' : 'Upload Book'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBooks;
