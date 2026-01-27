import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { useHttpClient } from '../hooks/http-hook';
import './AdminDashboard.css';

const Sparkline = ({ color }) => (
    <svg width="100" height="30" viewBox="0 0 100 30" style={{ opacity: 0.6 }}>
        <path
            d="M0 20 Q 20 5, 40 18 T 80 10 T 100 25"
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
        />
    </svg>
);

const AdminDashboard = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [stats, setStats] = useState({
        users: { total: 0, admins: 0, regular: 0, recent: 0 },
        content: { surahs: 0, hadiths: 0, libraryItems: 0, books: 0, categories: 0 },
        analytics: { totalViews: 0, totalDownloads: 0 },
        libraryBreakdown: { duas: 0, seerah: 0, fiqh: 0 },
        recentBooks: [],
        activity: []
    });
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('overview'); // overview, users, books, categories, settings, activity
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' });
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [isEditingBook, setIsEditingBook] = useState(false);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [bookForm, setBookForm] = useState({ title: '', author: '', description: '', category: '', language: 'Amharic', pdf: null, epub: null, image: null });
    const [catForm, setCatForm] = useState({ name: '', description: '', icon: '📚', type: 'Book' });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        if (view === 'books') fetchBooks();
        if (view === 'categories') fetchCategories();
    }, [auth.token, view]);

    const fetchDashboardData = async () => {
        if (!auth.token) return;
        try {
            const statsData = await sendRequest(
                'http://localhost:5000/api/admin/stats',
                'GET',
                null,
                { Authorization: 'Bearer ' + auth.token }
            );
            setStats(prev => ({ ...prev, ...statsData.stats }));

            const usersData = await sendRequest(
                'http://localhost:5000/api/admin/users',
                'GET',
                null,
                { Authorization: 'Bearer ' + auth.token }
            );
            setUsers(usersData.users);
        } catch (err) { }
    };

    const fetchBooks = async () => {
        try {
            const data = await sendRequest('http://localhost:5000/api/books');
            setBooks(data.books);
            const catData = await sendRequest('http://localhost:5000/api/categories');
            if (catData && catData.categories) {
                setCategories(catData.categories);
                // Auto-set the first category if current form has none
                if (catData.categories.length > 0 && !bookForm.category) {
                    setBookForm(prev => ({ ...prev, category: catData.categories[0].name }));
                }
            }
        } catch (err) { }
    };

    const fetchCategories = async () => {
        try {
            const data = await sendRequest('http://localhost:5000/api/categories');
            setCategories(data.categories);
        } catch (err) { }
    };

    const toggleUserStatusHandler = async (userId) => {
        try {
            const response = await sendRequest(
                `http://localhost:5000/api/admin/users/${userId}/toggle-status`,
                'PATCH',
                null,
                { Authorization: 'Bearer ' + auth.token }
            );
            setUsers(prevUsers =>
                prevUsers.map(u => u.id === userId ? { ...u, isActive: response.isActive } : u)
            );
        } catch (err) { }
    };

    const deleteUserHandler = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;
        try {
            await sendRequest(
                `http://localhost:5000/api/admin/users/${userId}`,
                'DELETE',
                null,
                { Authorization: 'Bearer ' + auth.token }
            );
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        } catch (err) { }
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditForm({ name: user.name, email: user.email, role: user.role });
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedUser(null);
        setEditForm({ name: '', email: '', role: 'user' });
    };

    const updateUserHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await sendRequest(
                `http://localhost:5000/api/admin/users/${selectedUser.id}`,
                'PATCH',
                JSON.stringify(editForm),
                {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token
                }
            );
            setUsers(prevUsers =>
                prevUsers.map(u => u.id === selectedUser.id ? response.user : u)
            );
            setShowEditModal(false);
        } catch (err) { }
    };

    const handleBookFileChange = (e) => {
        setBookForm({ ...bookForm, [e.target.name]: e.target.files[0] });
    };

    const handleBookSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', bookForm.title);
        formData.append('author', bookForm.author);
        formData.append('description', bookForm.description || '');
        formData.append('category', bookForm.category);
        formData.append('language', bookForm.language);
        if (bookForm.pdf) formData.append('pdf', bookForm.pdf);
        if (bookForm.epub) formData.append('epub', bookForm.epub);
        if (bookForm.image) formData.append('image', bookForm.image);

        if (!bookForm.category) {
            alert('CRITICAL: Please select or create a category first! The library cannot categorize this asset without one.');
            return;
        }

        try {
            const method = isEditingBook ? 'PATCH' : 'POST';
            const url = isEditingBook ? `http://localhost:5000/api/books/${currentId}` : 'http://localhost:5000/api/books';
            console.log('--- Initializing Asset Upload ---');
            console.log('Target URL:', url);
            console.log('Method:', method);
            console.log('Payload Category:', bookForm.category);

            const response = await sendRequest(url, method, formData, {
                Authorization: 'Bearer ' + auth.token
            });

            console.log('Upload Successful:', response);
            setShowBookModal(false);
            // Reset form to first category
            setBookForm({ title: '', author: '', description: '', category: categories[0]?.name || '', language: 'Amharic', pdf: null, epub: null, image: null });
            fetchBooks();
            alert('Success! Asset initialized and synchronized with the library repository.');
        } catch (err) {
            console.error('--- UPLOAD FAILED ---');
            console.error('Local Error:', err);
            alert('Upload Failed: ' + (err.message || 'Unknown server error during asset initialization.'));
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const method = isEditingCategory ? 'PATCH' : 'POST';
            const url = isEditingCategory ? `http://localhost:5000/api/categories/${currentId}` : 'http://localhost:5000/api/categories';
            await sendRequest(url, method, JSON.stringify(catForm), {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + auth.token
            });
            setShowCategoryModal(false);
            fetchCategories();
            alert('Category successfully deployed to classification directory.');
        } catch (err) {
            alert('Category Deployment Failed: ' + err.message);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderOverview = () => (
        <div className="view-container">
            <div className="stats-grid">
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="stat-icon" style={{ color: '#10b981' }}>👥</div>
                        <div className="stat-trend trend-up">+12% ↑</div>
                    </div>
                    <div className="stat-info">
                        <h3>Total Accounts</h3>
                        <div className="stat-value">{stats.users.total}</div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Live system database</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="stat-icon" style={{ color: '#3b82f6' }}>📚</div>
                        <div className="stat-trend trend-up">+5% ↑</div>
                    </div>
                    <div className="stat-info">
                        <h3>Digital Assets</h3>
                        <div className="stat-value">{stats.content.books}</div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Verified PDF/EPUB entries</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="stat-icon" style={{ color: '#8b5cf6' }}>👁️</div>
                        <div className="stat-trend trend-down">-2% ↓</div>
                    </div>
                    <div className="stat-info">
                        <h3>Impressions</h3>
                        <div className="stat-value">{stats.analytics.totalViews}</div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Global content reach</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className="stat-icon" style={{ color: '#f59e0b' }}>📥</div>
                        <div className="stat-trend trend-up">+24% ↑</div>
                    </div>
                    <div className="stat-info">
                        <h3>Offline Syncs</h3>
                        <div className="stat-value">{stats.analytics.totalDownloads}</div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Successful file transfers</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content-grid">
                <div className="dashboard-card">
                    <h3>⚡ Live Activity Monitor</h3>
                    <div className="activity-feed-premium">
                        {stats.activity.map(act => (
                            <div key={act.id} className="activity-item-lux">
                                <div className="activity-pip" style={{ color: act.type === 'security' ? '#ef4444' : act.type === 'book' ? '#10b981' : '#3b82f6' }}></div>
                                <div className="activity-content">
                                    <p>{act.desc}</p>
                                    <span>{act.time} • System Node: 01</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="dashboard-card">
                    <h3>📊 Content Distribution</h3>
                    <div className="breakdown-list" style={{ marginTop: '1rem' }}>
                        {[
                            { label: 'Fiqh & Jurisprudence', count: stats.libraryBreakdown.fiqh, total: stats.content.libraryItems, color: '#10b981' },
                            { label: 'Prophetic Seerah', count: stats.libraryBreakdown.seerah, total: stats.content.libraryItems, color: '#3b82f6' },
                            { label: 'Duas & Adhkar', count: stats.libraryBreakdown.duas, total: stats.content.libraryItems, color: '#8b5cf6' }
                        ].map(item => (
                            <div key={item.label} className="breakdown-item" style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                    <span style={{ fontWeight: '600', opacity: 0.9 }}>{item.label}</span>
                                    <span style={{ color: item.color, fontWeight: '800' }}>{Math.round((item.count / item.total) * 100 || 0)}%</span>
                                </div>
                                <div className="distribution-track">
                                    <div className="distribution-fill" style={{
                                        width: `${(item.count / item.total) * 100 || 0}%`,
                                        background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                                        boxShadow: `0 0 15px ${item.color}33`
                                    }}></div>
                                </div>
                            </div>
                        ))}

                        <div className="health-monitor-premium">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>SYSTEM PULSE</span>
                                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 'bold' }}>STABLE • 99.9%</span>
                            </div>
                            <div className="health-grid">
                                <div className="health-node">
                                    <div className="health-pip online"></div>
                                    <span className="node-label">Database</span>
                                </div>
                                <div className="health-node">
                                    <div className="health-pip online"></div>
                                    <span className="node-label">API Node</span>
                                </div>
                                <div className="health-node">
                                    <div className="health-pip online"></div>
                                    <span className="node-label">Storage</span>
                                </div>
                                <div className="health-node">
                                    <div className="health-pip online"></div>
                                    <span className="node-label">Security</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="view-container">
            <div className="users-section">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>User Directory</h2>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', width: '300px' }}
                        />
                    </div>
                </div>
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email Address</th>
                                <th>Role</th>
                                <th>Account Status</th>
                                <th>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className={user.isActive ? '' : 'inactive-row'}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {user.name.charAt(0)}
                                            </div>
                                            {user.name} {user.id === auth.userId && <span className="you-badge" style={{ marginLeft: '8px' }}>Admin</span>}
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                                    <td>
                                        <span className={`status-badge ${user.isActive ? 'active' : 'disabled'}`}>
                                            {user.isActive ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-edit" onClick={() => openEditModal(user)}>Edit</button>
                                            <button
                                                className={`btn-toggle ${user.isActive ? 'deactivate' : 'activate'}`}
                                                onClick={() => toggleUserStatusHandler(user.id)}
                                                disabled={user.id === auth.userId}
                                            >
                                                {user.isActive ? 'Block' : 'Unblock'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderBooks = () => {
        const filteredBooks = books.filter(b =>
            b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.author.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
            <div className="view-container">
                <div className="users-section">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ marginBottom: '4px' }}>Book Repository</h2>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Manage and monitor library assets</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Find books..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="btn-save" onClick={() => {
                                setIsEditingBook(false);
                                setBookForm({ title: '', author: '', description: '', category: categories[0]?.name || '', language: 'Amharic', pdf: null, epub: null, image: null });
                                setShowBookModal(true);
                            }}>+ Add New Book</button>
                        </div>
                    </div>
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Assets</th>
                                    <th>Category & Lang</th>
                                    <th>Engagement Metrics</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBooks.map(book => (
                                    <tr key={book.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '56px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {book.imageUrl ? <img src={`http://localhost:5000/${book.imageUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.2rem' }}>📘</span>}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{book.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>By {book.author}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div><span className="role-badge user">{book.category}</span></div>
                                            <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.7 }}>{book.language}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem' }}>
                                                <span title="Views">👁️ {book.views || 0}</span>
                                                <span title="Downloads">📥 {book.downloads || 0}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="status-badge active">Published</span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-edit" onClick={() => { setIsEditingBook(true); setCurrentId(book.id); setBookForm({ ...book }); setShowBookModal(true); }}>Edit</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderCategories = () => (
        <div className="view-container">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2>Classification Directory</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Organize your library by content type and genre</p>
                </div>
                <button className="btn-save" onClick={() => { setIsEditingCategory(false); setCatForm({ name: '', description: '', icon: '📚', type: 'Book' }); setShowCategoryModal(true); }}>
                    + New Classification
                </button>
            </div>

            <div className="settings-container">
                {categories.map(cat => (
                    <div key={cat.id} className="settings-group" style={{ position: 'relative' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{cat.icon || '📁'}</div>
                        <h3 style={{ margin: '0 0 5px 0' }}>{cat.name}</h3>
                        <span className="role-badge user" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{cat.type}</span>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem', minHeight: '40px' }}>
                            {cat.description || 'No description provided for this classification.'}
                        </p>
                        <div className="action-buttons" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                            <button className="btn-edit" onClick={() => { setIsEditingCategory(true); setCurrentId(cat.id); setCatForm({ ...cat }); setShowCategoryModal(true); }}>Modify</button>
                            <button className="logout-pill" style={{ fontSize: '0.75rem', padding: '5px 10px' }} onClick={async () => {
                                if (window.confirm('Delete this classification? Assets might become un-categorized.')) {
                                    try {
                                        await sendRequest(`http://localhost:5000/api/categories/${cat.id}`, 'DELETE', null, { Authorization: 'Bearer ' + auth.token });
                                        fetchCategories();
                                    } catch (err) { }
                                }
                            }}>Terminal</button>
                        </div>
                    </div>
                ))}

                {categories.length === 0 && (
                    <div className="settings-action-card" style={{ gridColumn: 'span 2', padding: '4rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗂️</div>
                        <h3>No Categories Defined</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You need at least one category before you can upload books.</p>
                        <button className="btn-save" onClick={() => setShowCategoryModal(true)}>Create First Category</button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="view-container">
            <div className="settings-container">
                {/* GENERAL CONFIGURATION */}
                <div className="settings-group">
                    <h3>⚙️ Core Configuration</h3>
                    <div className="setting-item">
                        <label>Library Name</label>
                        <input type="text" defaultValue="Noor Islamic Library" className="form-control" />
                        <span className="setting-helper">This name appears on the landing page and navigation bar.</span>
                    </div>
                    <div className="setting-item">
                        <label>Primary Language</label>
                        <select className="form-control">
                            <option>Amharic</option>
                            <option>Arabic</option>
                            <option>English</option>
                        </select>
                        <span className="setting-helper">Set the default system language for new visitors.</span>
                    </div>
                    <div className="setting-row">
                        <div>
                            <label style={{ display: 'block', marginBottom: '2px' }}>Public Registrations</label>
                            <span className="setting-helper">Allow new users to sign up via the frontend.</span>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" defaultChecked />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <button className="btn-save" style={{ marginTop: '1rem' }}>Deploy Changes</button>
                </div>

                {/* SECURITY & MAINTENANCE */}
                <div className="settings-group danger-zone">
                    <h3>🛡️ Security & Maintenance</h3>
                    <div className="setting-row">
                        <div>
                            <label style={{ display: 'block', marginBottom: '2px' }}>Maintenance Mode</label>
                            <span className="setting-helper">Take the library offline for specific updates.</span>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <div className="settings-action-card">
                            <div>
                                <h4 style={{ margin: 0 }}>🧹 Clear System Cache</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '5px 0' }}>Refresh all temporary data and static translations.</p>
                            </div>
                            <button className="action-btn-mini">Execute Purge</button>
                        </div>

                        <div className="settings-action-card" style={{ marginTop: '1rem' }}>
                            <div>
                                <h4 style={{ margin: 0, color: '#ef4444' }}>📦 Database Backup</h4>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '5px 0' }}>Create a secure snapshot of current library data.</p>
                            </div>
                            <button className="action-btn-mini">Start Export</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="admin-dashboard">
            <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? '✕' : '☰'}
            </button>

            <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <h2>NOOR ADMIN</h2>
                </div>
                <nav className="sidebar-nav">
                    <button className={view === 'overview' ? 'active' : ''} onClick={() => { setView('overview'); setIsMobileMenuOpen(false); }}>📊 Dashboard</button>
                    <button className={view === 'users' ? 'active' : ''} onClick={() => { setView('users'); setIsMobileMenuOpen(false); }}>👤 Users</button>
                    <button className={view === 'books' ? 'active' : ''} onClick={() => { setView('books'); setIsMobileMenuOpen(false); }}>📚 Books</button>
                    <button className={view === 'categories' ? 'active' : ''} onClick={() => { setView('categories'); setIsMobileMenuOpen(false); }}>📁 Categories</button>
                    <div style={{ height: '1px', background: 'var(--glass-border)', margin: '1rem 0' }}></div>
                    <button className={view === 'settings' ? 'active' : ''} onClick={() => { setView('settings'); setIsMobileMenuOpen(false); }}>⚙️ Settings</button>
                    <button onClick={auth.logout}>🚪 Sign Out</button>
                </nav>
            </aside>

            <main className="admin-main-content">
                <header className="admin-header">
                    <h1>{view.toUpperCase()} CONTROL</h1>
                    <p>Welcome, {auth.userName || 'Admin'}</p>
                </header>

                {error && <div className="error-message">{error}</div>}

                {isLoading ? (
                    <div className="loading-spinner">Synchronizing with server...</div>
                ) : (
                    <>
                        {view === 'overview' && renderOverview()}
                        {view === 'users' && renderUsers()}
                        {view === 'books' && renderBooks()}
                        {view === 'categories' && renderCategories()}
                        {view === 'settings' && renderSettings()}
                    </>
                )}
            </main>

            {/* MODALS */}
            {showEditModal && (
                <div className="modal-overlay active" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h2>Edit User</h2></div>
                        <form onSubmit={updateUserHandler} className="edit-form">
                            <div className="form-group"><label>Name</label><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                            <div className="form-group"><label>Email</label><input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
                            <div className="form-group">
                                <label>Role</label>
                                <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="content-admin">Content Admin</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showBookModal && (
                <div className="modal-overlay active" onClick={() => setShowBookModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '900px' }}>
                        <div className="modal-header">
                            <h2>{isEditingBook ? 'Edit Book Asset' : 'New Library Asset'}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Asset Studio / {isEditingBook ? 'Modify' : 'Create'}</p>
                        </div>
                        <form onSubmit={handleBookSubmit} className="book-modal-layout">
                            {/* Left Side: File Upload Zones */}
                            <div className="file-upload-section">
                                <div className="file-upload-zone">
                                    <span className="upload-icon">📄</span>
                                    <span className="upload-label">PDF Master {isEditingBook && '(Optional)'}</span>
                                    <span className="upload-meta">Required for primary viewing</span>
                                    <input type="file" name="pdf" onChange={handleBookFileChange} accept=".pdf" />
                                    {bookForm.pdf && <div className="active-file-badge">✓</div>}
                                </div>
                                <div className="file-upload-zone">
                                    <span className="upload-icon">📱</span>
                                    <span className="upload-label">EPUB Format</span>
                                    <span className="upload-meta">Mobile-responsive reading (Optional)</span>
                                    <input type="file" name="epub" onChange={handleBookFileChange} accept=".epub" />
                                    {bookForm.epub && <div className="active-file-badge">✓</div>}
                                </div>
                                <div className="file-upload-zone">
                                    <span className="upload-icon">🖼️</span>
                                    <span className="upload-label">Cover Artwork</span>
                                    <span className="upload-meta">Visual identity for the catalog</span>
                                    <input type="file" name="image" onChange={handleBookFileChange} accept="image/*" />
                                    {bookForm.image && <div className="active-file-badge">✓</div>}
                                </div>
                            </div>

                            {/* Right Side: Metadata Fields */}
                            <div className="form-info-section">
                                <div className="input-group-premium">
                                    <label>Asset Title</label>
                                    <input className="input-premium" placeholder="e.g. Sahih Al-Bukhari" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required />
                                </div>
                                <div className="input-group-premium">
                                    <label>Primary Author</label>
                                    <input className="input-premium" placeholder="Name of scholar or author" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} required />
                                </div>
                                <div className="input-group-premium">
                                    <label>Category {categories.length === 0 && <span style={{ color: '#ff4d4d', fontSize: '0.7rem' }}> (No categories found!)</span>}</label>
                                    <select className="input-premium" value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} required>
                                        <option value="">-- Select Category --</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    {categories.length === 0 && (
                                        <button type="button" onClick={() => setView('categories')} style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.75rem', textAlign: 'left', cursor: 'pointer', padding: '5px 0' }}>
                                            + Create your first category here
                                        </button>
                                    )}
                                </div>
                                <div className="input-group-premium">
                                    <label>Language</label>
                                    <select className="input-premium" value={bookForm.language} onChange={e => setBookForm({ ...bookForm, language: e.target.value })}>
                                        <option>Amharic</option><option>Arabic</option><option>English</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer-premium">
                                <button type="button" className="action-btn-mini" onClick={() => setShowBookModal(false)}>Discard</button>
                                <button type="submit" className="btn-save" style={{ padding: '14px 40px' }}>
                                    {isEditingBook ? 'Update Master Asset' : 'Initialize Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="modal-overlay active" onClick={() => setShowCategoryModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>{isEditingCategory ? 'Modify Classification' : 'New Classification'}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Core Data / {isEditingCategory ? 'Edit' : 'Create'}</p>
                        </div>
                        <form onSubmit={handleCategorySubmit} className="form-info-section">
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '15px' }}>
                                <div className="input-group-premium">
                                    <label>Icon</label>
                                    <input className="input-premium" style={{ textAlign: 'center', fontSize: '1.5rem' }} value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} placeholder="📚" />
                                </div>
                                <div className="input-group-premium">
                                    <label>Category name</label>
                                    <input className="input-premium" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Fiqh, Seerah..." required />
                                </div>
                            </div>

                            <div className="input-group-premium">
                                <label>Classification Type</label>
                                <select className="input-premium" value={catForm.type} onChange={e => setCatForm({ ...catForm, type: e.target.value })}>
                                    <option value="Book">📚 PDF Book Repository</option>
                                    <option value="Library">🏛️ General Library Content</option>
                                </select>
                            </div>

                            <div className="input-group-premium">
                                <label>Description</label>
                                <textarea className="input-premium" style={{ minHeight: '80px', resize: 'none' }} value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="Briefly describe this category..." />
                            </div>

                            <div className="modal-footer-premium" style={{ gridColumn: 'span 1' }}>
                                <button type="button" className="action-btn-mini" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">
                                    {isEditingCategory ? 'Sync Classification' : 'Deploy Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
