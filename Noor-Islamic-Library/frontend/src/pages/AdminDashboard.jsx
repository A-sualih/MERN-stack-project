import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';
import { useHttpClient } from '../hooks/http-hook';
import './AdminDashboard.css';

const StatCard = ({ icon, label, value, trend, trendUp, color }) => (
    <div className="stat-card">
        <div className="stat-icon" style={{ color: color }}>{icon}</div>
        <div className="stat-info">
            <h3>{label}</h3>
            <div className="stat-value">{value}</div>
        </div>
        <div className={`stat-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            {trendUp ? '↑' : '↓'} {trend}
        </div>
    </div>
);

const SystemPulse = () => (
    <div className="health-monitor-premium" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '2px', color: 'var(--primary)' }}>SYSTEM PULSE</span>
            <div className="pulse-indicator" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="status-dot active"></div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>ONLINE</span>
            </div>
        </div>
        <div className="health-grid" style={{ marginTop: '0' }}>
            {['DB Cluster', 'CDN Edge', 'AI Node', 'Secure Gateway'].map(node => (
                <div key={node} className="health-node">
                    <div className="status-dot active"></div>
                    <span className="node-label">{node}</span>
                </div>
            ))}
        </div>
    </div>
);

const AdminDashboard = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest } = useHttpClient();

    const [stats, setStats] = useState({
        users: { total: 0, admins: 0, regular: 0, recent: 0 },
        content: { surahs: 0, hadiths: 0, libraryItems: 0, books: 0, categories: 0 },
        analytics: { totalViews: 12543, totalDownloads: 3421 },
        libraryBreakdown: { duas: 31, seerah: 15, fiqh: 10 },
        recentBooks: [],
        activity: [
            { id: 1, type: 'user', desc: 'Ahmed joined as a regular member', time: '2 mins ago' },
            { id: 2, type: 'book', desc: 'New Seerah PDF "Prophetic Character" published', time: '1 hour ago' },
            { id: 3, type: 'security', desc: 'Firewall intercepted 12 unauthorized requests', time: '4 hours ago' }
        ]
    });

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('overview');
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

            if (view === 'books') fetchBooks();
            if (view === 'categories') fetchCategories();
        } catch (err) { }
    };

    const fetchBooks = async () => {
        try {
            const data = await sendRequest('http://localhost:5000/api/books');
            setBooks(data.books);
            const catData = await sendRequest('http://localhost:5000/api/categories');
            if (catData && catData.categories) {
                setCategories(catData.categories);
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

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditForm({ name: user.name, email: user.email, role: user.role });
        setShowEditModal(true);
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

        try {
            const method = isEditingBook ? 'PATCH' : 'POST';
            const url = isEditingBook ? `http://localhost:5000/api/books/${currentId}` : 'http://localhost:5000/api/books';
            await sendRequest(url, method, formData, { Authorization: 'Bearer ' + auth.token });
            setShowBookModal(false);
            fetchBooks();
        } catch (err) { }
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
        } catch (err) { }
    };

    const renderOverview = () => (
        <div className="view-container animate-fade">
            <div className="stats-grid">
                <StatCard icon="👥" label="Total Accounts" value={stats.users.total} trend="12%" trendUp={true} color="var(--primary)" />
                <StatCard icon="📚" label="Digital Library" value={stats.content.books} trend="5% " trendUp={true} color="var(--secondary)" />
                <StatCard icon="📊" label="Global Views" value={stats.analytics.totalViews} trend="2%" trendUp={false} color="var(--accent)" />
                <StatCard icon="📥" label="Content Syncs" value={stats.analytics.totalDownloads} trend="24%" trendUp={true} color="var(--primary-light)" />
            </div>

            <div className="dashboard-content-grid">
                <div className="dashboard-card main-panel">
                    <h3>🔍 Control Center</h3>
                    <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginTop: '2rem' }}>
                        {[
                            { label: 'Add Book', icon: '➕', color: 'var(--primary)', view: 'books' },
                            { label: 'Manage Users', icon: '👤', color: 'var(--secondary)', view: 'users' },
                            { label: 'New Category', icon: '📁', color: 'var(--accent)', view: 'categories' },
                            { label: 'System Logs', icon: '📝', color: 'var(--text-dim)', view: 'activity' }
                        ].map(action => (
                            <button key={action.label} onClick={() => setView(action.view)} style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '24px',
                                padding: '25px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'var(--transition)'
                            }} className="action-tile">
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{action.icon}</div>
                                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: action.color }}>{action.label}</div>
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <h4 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', marginBottom: '1.5rem' }}>⚡ Recent Security Events</h4>
                        <div className="activity-feed-premium">
                            {stats.activity.map(act => (
                                <div key={act.id} className="activity-item-lux">
                                    <div className="activity-pip" style={{ color: act.type === 'security' ? 'var(--danger)' : 'var(--primary)' }}></div>
                                    <div className="activity-content">
                                        <p>{act.desc}</p>
                                        <span>{act.time} • Secure Node 01</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="dashboard-card side-panel">
                    <h3>⚖️ Library Balance</h3>
                    <div className="breakdown-list" style={{ marginTop: '1rem' }}>
                        {[
                            { label: 'Jurisprudence', count: stats.libraryBreakdown.fiqh, total: stats.content.libraryItems, color: 'var(--primary)' },
                            { label: 'Prophetic Seerah', count: stats.libraryBreakdown.seerah, total: stats.content.libraryItems, color: 'var(--secondary)' },
                            { label: 'Duas & Adhkar', count: stats.libraryBreakdown.duas, total: stats.content.libraryItems, color: '#8b5cf6' }
                        ].map(item => (
                            <div key={item.label} className="breakdown-item" style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                    <span style={{ fontWeight: '700' }}>{item.label}</span>
                                    <span style={{ color: item.color, fontWeight: '900' }}>{Math.round((item.count / item.total) * 100 || 0)}%</span>
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
                    </div>

                    <SystemPulse />
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="users-section animate-fade">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', margin: 0 }}>Verified Personas</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Security and directory management</p>
                </div>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-premium"
                    />
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>User Persona</th>
                            <th>Contact Node</th>
                            <th>Permission</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                            <tr key={user.id} className="user-table-row">
                                <td>
                                    <div className="user-profile-cell">
                                        <div className="user-avatar-lux" style={{
                                            background: user.role === 'admin' ? 'linear-gradient(135deg, #f43f5e, #fb923c)' : 'linear-gradient(135deg, #10b981, #3b82f6)'
                                        }}>
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="user-info-lux">
                                            <span className="user-name-lux">{user.name}</span>
                                            <span className="user-date-lux">Node Access since 2024</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                                <td><span className={`role-badge-lux ${user.role}`}>{user.role.toUpperCase()}</span></td>
                                <td>
                                    <div className={`status-pill-lux ${user.isActive ? 'active' : 'locked'}`}>
                                        <span className="status-dot"></span>
                                        {user.isActive ? 'OPERATIONAL' : 'RESTRICTED'}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons-lux">
                                        <button className="btn-action-lux edit">✏️</button>
                                        <button className="btn-action-lux block">🚫</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2><span>NOOR</span> OS</h2>
                </div>
                <nav className="sidebar-nav">
                    {[
                        { id: 'overview', icon: '📊', label: 'Monitor' },
                        { id: 'users', icon: '👤', label: 'Personas' },
                        { id: 'books', icon: '📚', label: 'Assets' },
                        { id: 'categories', icon: '📁', label: 'Clusters' },
                        { id: 'settings', icon: '⚙️', label: 'Config' }
                    ].map(item => (
                        <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}>
                            <span className="nav-icon">{item.icon}</span> {item.label}
                        </button>
                    ))}
                    <button className="nav-btn-special" onClick={auth.logout} style={{ marginTop: 'auto' }}>
                        <span className="nav-icon">🚪</span> Terminate
                    </button>
                </nav>
            </aside>

            <main className="admin-main-content">
                <header className="admin-header">
                    <div>
                        <h1>{view === 'overview' ? 'DASHBOARD' : view.toUpperCase()}</h1>
                        <p>Access Level: Root Administrator • {auth.userName}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: '700' }}>SYSTEM STATUS</div>
                        <div style={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1.1rem' }}>NOMINAL • 99.9%</div>
                    </div>
                </header>

                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Synchronizing with library core...</p>
                    </div>
                ) : (
                    <>
                        {view === 'overview' && renderOverview()}
                        {view === 'users' && renderUsers()}
                        {view === 'books' && (
                            <div className="users-section animate-fade">
                                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', margin: 0 }}>Digital Assets</h2>
                                        <p style={{ color: 'var(--text-muted)' }}>Inventory of PDF and scholarly works</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <input type="text" placeholder="Filter assets..." className="input-premium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                        <button className="btn-save" onClick={() => { setIsEditingBook(false); setShowBookModal(true); }}>+ New Asset</button>
                                    </div>
                                </div>
                                <div className="users-table-container">
                                    <table className="users-table">
                                        <thead>
                                            <tr>
                                                <th>Asset Identity</th>
                                                <th>Cluster</th>
                                                <th>Metrics</th>
                                                <th>Status</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map(book => (
                                                <tr key={book.id} className="user-table-row">
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                            <div style={{ width: '45px', height: '60px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                                                                {book.imageUrl ? <img src={`http://localhost:5000/${book.imageUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📖'}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '800', fontSize: '1rem' }}>{book.title}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{book.author}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span className="role-badge-lux user">{book.category}</span></td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem' }}>
                                                            <span>👁️ {book.views || 0}</span>
                                                            <span>📥 {book.downloads || 0}</span>
                                                        </div>
                                                    </td>
                                                    <td><div className="status-pill-lux active"><span className="status-dot"></span>LIVE</div></td>
                                                    <td><button className="btn-action-lux edit" onClick={() => { setIsEditingBook(true); setCurrentId(book.id); setBookForm({ ...book }); setShowBookModal(true); }}>Modify</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {view === 'categories' && (
                            <div className="animate-fade">
                                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                    <div>
                                        <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', margin: 0 }}>Content Clusters</h2>
                                        <p style={{ color: 'var(--text-muted)' }}>Taxonomy and classification nodes</p>
                                    </div>
                                    <button className="btn-save" onClick={() => { setIsEditingCategory(false); setShowCategoryModal(true); }}>+ Initialize Cluster</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                    {categories.map(cat => (
                                        <div key={cat.id} className="dashboard-card" style={{ position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{cat.icon || '📁'}</div>
                                            <h3 style={{ marginBottom: '10px' }}>{cat.name}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', minHeight: '50px' }}>{cat.description || 'System cluster for categorized library assets.'}</p>
                                            <div style={{ marginTop: '2rem', display: 'flex', gap: '10px' }}>
                                                <button className="btn-action-lux edit" onClick={() => { setIsEditingCategory(true); setCurrentId(cat.id); setCatForm({ ...cat }); setShowCategoryModal(true); }}>Edit Node</button>
                                                <button className="btn-action-lux block" onClick={async () => {
                                                    if (window.confirm('De-initialize this cluster?')) {
                                                        await sendRequest(`http://localhost:5000/api/categories/${cat.id}`, 'DELETE', null, { Authorization: 'Bearer ' + auth.token });
                                                        fetchCategories();
                                                    }
                                                }}>Purge</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {view === 'settings' && (
                            <div className="animate-fade" style={{ maxWidth: '800px' }}>
                                <div className="users-section">
                                    <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', marginBottom: '2rem' }}>Core Configuration</h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div className="form-group">
                                            <label>Cluster Identity</label>
                                            <input className="input-premium" defaultValue="Noor Islamic Library OS" />
                                        </div>
                                        <div className="form-group">
                                            <label>Security Protocol</label>
                                            <select className="input-premium">
                                                <option>Standard Encryption</option>
                                                <option>High-Security (Root)</option>
                                            </select>
                                        </div>
                                        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                            <h4 style={{ color: 'var(--danger)', margin: '0 0 10px 0' }}>🚨 Danger Zone</h4>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Irreversible system operations. These actions cannot be undone.</p>
                                            <button className="btn-action-lux block">Purge Database Cache</button>
                                        </div>
                                        <button className="btn-save">Deploy Global Changes</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* HIGH-END MODALS */}
            {showEditModal && (
                <div className="modal-overlay active" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontFamily: 'Outfit', marginBottom: '2rem' }}>Edit User Persona</h2>
                        <form onSubmit={updateUserHandler} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="form-group"><label>Identity</label><input className="input-premium" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></div>
                            <div className="form-group"><label>Email Node</label><input className="input-premium" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
                            <div className="form-group">
                                <label>Permissions</label>
                                <select className="input-premium" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                                    <option value="user">Standard Member</option>
                                    <option value="admin">Root Administrator</option>
                                    <option value="content-admin">Content Editor</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                                <button type="button" className="btn-action-lux block" onClick={() => setShowEditModal(false)}>Discard</button>
                                <button type="submit" className="btn-save" style={{ flex: 1 }}>Deploy Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showBookModal && (
                <div className="modal-overlay active" onClick={() => setShowBookModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
                        <h2 style={{ fontFamily: 'Outfit', marginBottom: '2rem' }}>Initialize Library Asset</h2>
                        <form onSubmit={handleBookSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="form-group">
                                    <label>PDF Master</label>
                                    <input type="file" name="pdf" onChange={handleBookFileChange} accept=".pdf" />
                                </div>
                                <div className="form-group">
                                    <label>Artwork</label>
                                    <input type="file" name="image" onChange={handleBookFileChange} accept="image/*" />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input className="input-premium" placeholder="Asset Title" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required />
                                <input className="input-premium" placeholder="Primary Author" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} required />
                                <select className="input-premium" value={bookForm.category} onChange={e => setBookForm({ ...bookForm, category: e.target.value })} required>
                                    <option value="">Select Cluster...</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                                <select className="input-premium" value={bookForm.language} onChange={e => setBookForm({ ...bookForm, language: e.target.value })}>
                                    <option>Amharic</option><option>Arabic</option><option>English</option>
                                </select>
                                <button type="submit" className="btn-save" style={{ marginTop: '20px' }}>Initialize Upload</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="modal-overlay active" onClick={() => setShowCategoryModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontFamily: 'Outfit', marginBottom: '2rem' }}>Create Content Cluster</h2>
                        <form onSubmit={handleCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <input className="input-premium" style={{ width: '100px', textAlign: 'center' }} placeholder="Icon" value={catForm.icon} onChange={e => setCatForm({ ...catForm, icon: e.target.value })} />
                                <input className="input-premium" style={{ flex: 1 }} placeholder="Cluster Name" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
                            </div>
                            <textarea className="input-premium" placeholder="Cluster Description" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} style={{ minHeight: '100px' }} />
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button type="button" className="btn-action-lux block" onClick={() => setShowCategoryModal(false)}>Discard</button>
                                <button type="submit" className="btn-save" style={{ flex: 1 }}>Initialize Node</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
