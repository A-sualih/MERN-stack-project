import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { useHttpClient } from '../hooks/http-hook';
import { API_BASE_URL } from '../config';
import './AdminDashboard.css';

const ManageCategories = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [form, setForm] = useState({
        name: '',
        description: '',
        icon: '📚',
        type: 'Book'
    });

    useEffect(() => {
        fetchCategories();
    }, [sendRequest]);

    const fetchCategories = async () => {
        try {
            const data = await sendRequest(`${API_BASE_URL}/api/categories`);
            setCategories(data.categories);
        } catch (err) { }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await sendRequest(
                    `${API_BASE_URL}/api/categories/${currentId}`,
                    'PATCH',
                    JSON.stringify(form),
                    {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + auth.token
                    }
                );
            } else {
                await sendRequest(
                    `${API_BASE_URL}/api/categories`,
                    'POST',
                    JSON.stringify(form),
                    {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + auth.token
                    }
                );
            }
            setShowModal(false);
            fetchCategories();
            resetForm();
        } catch (err) { }
    };

    const resetForm = () => {
        setForm({ name: '', description: '', icon: '📚', type: 'Book' });
        setIsEditing(false);
        setCurrentId(null);
    };

    const deleteHandler = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await sendRequest(`${API_BASE_URL}/api/categories/${id}`, 'DELETE', null, {
                Authorization: 'Bearer ' + auth.token
            });
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) { }
    };

    const editHandler = (cat) => {
        setForm({
            name: cat.name,
            description: cat.description || '',
            icon: cat.icon || '📚',
            type: cat.type || 'Book'
        });
        setCurrentId(cat.id);
        setIsEditing(true);
        setShowModal(true);
    };

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    <button onClick={() => window.location.href = '/admin'}>📊 Overview</button>
                    <button onClick={() => window.location.href = '/admin/books'}>📚 Books</button>
                    <button className="active">📁 Categories</button>
                </nav>
            </aside>

            <main className="admin-main-content">
                <header className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Category Management</h1>
                    <button className="btn-save" onClick={() => { resetForm(); setShowModal(true); }}>+ New Category</button>
                </header>

                {error && <div className="error-message">{error}</div>}
                {isLoading && <div className="loading-spinner">Synchronizing classification directory...</div>}

                <div className="users-section">
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Icon</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id}>
                                        <td style={{ fontSize: '1.5rem' }}>{cat.icon}</td>
                                        <td>{cat.name}</td>
                                        <td><span className={`role-badge ${cat.type.toLowerCase()}`}>{cat.type}</span></td>
                                        <td>{cat.description}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit" onClick={() => editHandler(cat)}>Edit</button>
                                                <button className="btn-delete" onClick={() => deleteHandler(cat.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {showModal && (
                <div className="modal-overlay active" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Category' : 'Create Category'}</h2>
                        </div>
                        <form onSubmit={submitHandler} className="edit-form">
                            <div className="form-group">
                                <label>Category Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Type</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="Book">Book Library</option>
                                    <option value="Library">General Library (Duas, Seerah, etc)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Icon (Emoji)</label>
                                <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} maxLength="2" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', minHeight: '80px' }}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">{isEditing ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageCategories;
