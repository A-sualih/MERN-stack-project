import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { useHttpClient } from '../hooks/http-hook';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [stats, setStats] = useState({ users: 0 });
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statsData = await sendRequest(
                    'http://localhost:5000/api/admin/stats',
                    'GET',
                    null,
                    { Authorization: 'Bearer ' + auth.token }
                );
                setStats(statsData.stats);

                const usersData = await sendRequest(
                    'http://localhost:5000/api/admin/users',
                    'GET',
                    null,
                    { Authorization: 'Bearer ' + auth.token }
                );
                setUsers(usersData.users);

            } catch (err) { }
        };
        fetchDashboardData();
    }, [sendRequest, auth.token]);

    const deleteUserHandler = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await sendRequest(
                `http://localhost:5000/api/admin/users/${userId}`,
                'DELETE',
                null,
                { Authorization: 'Bearer ' + auth.token }
            );
            setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
            setStats(prevStats => ({ ...prevStats, users: prevStats.users - 1 }));
        } catch (err) { }
    };

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
            </header>

            {error && <div className="error-message">{error}</div>}
            {isLoading && <div className="loading-spinner">Loading...</div>}

            {!isLoading && (
                <>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Users</h3>
                            <div className="stat-value">{stats.users}</div>
                        </div>
                        {/* Add more stats cards here later */}
                    </div>

                    <div className="users-section">
                        <h2>User Management</h2>
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`role-badge ${user.role}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => deleteUserHandler(user.id)}
                                                    disabled={user.role === 'admin'} // Prevent deleting admins
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
