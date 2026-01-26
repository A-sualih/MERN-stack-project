import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { Link } from "react-router-dom";
import "./AdminDashboard.css"; // We'll create a simple CSS file

const AdminDashboard = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [stats, setStats] = useState({ users: 0, places: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const responseData = await sendRequest(
                    "http://localhost:5001/api/admin/stats",
                    "GET",
                    null,
                    { Authorization: "Bearer " + auth.token }
                );
                setStats(responseData.stats);
            } catch (err) { }
        };
        fetchStats();
    }, [sendRequest, auth.token]);

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && <LoadingSpinner asOverlay />}
            <div className="admin-dashboard">
                <h1>Admin Dashboard</h1>
                <div className="stats-container">
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <p>{stats.users}</p>
                        <Link to="/admin/users" className="button">Manage Users</Link>
                    </div>
                    <div className="stat-card">
                        <h3>Total Places</h3>
                        <p>{stats.places}</p>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};

export default AdminDashboard;
