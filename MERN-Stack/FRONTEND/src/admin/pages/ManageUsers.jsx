import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import UserList from "../../user/components/UserList";
import { Link } from "react-router-dom";
import "./ManageUsers.css";

const ManageUsers = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedUsers, setLoadedUsers] = useState();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const responseData = await sendRequest(
                    "http://localhost:5001/api/admin/users",
                    "GET",
                    null,
                    { Authorization: "Bearer " + auth.token }
                );
                setLoadedUsers(responseData.users);
            } catch (err) { }
        };
        fetchUsers();
    }, [sendRequest, auth.token]);

    const userDeleteHandler = async (deletedUserId) => {
        try {
            await sendRequest(
                `http://localhost:5001/api/admin/users/${deletedUserId}`,
                "DELETE",
                null,
                { Authorization: "Bearer " + auth.token }
            );
            setLoadedUsers(prevUsers => prevUsers.filter(user => user.id !== deletedUserId));
        } catch (err) { }
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            <div className="manage-users-page">
                <Link to="/admin" className="button">Back to Dashboard</Link>
                <h2>Manage Users</h2>
                {!isLoading && loadedUsers && (
                    <ul className="user-list">
                        {loadedUsers.map(user => (
                            <li key={user.id} className="user-item">
                                <div className="user-item__content">
                                    <div className="user-item__info">
                                        <h2>{user.name}</h2>
                                        <h3>{user.places.length} {user.places.length === 1 ? 'Place' : 'Places'}</h3>
                                        {user.isAdmin && <span className="admin-badge">ADMIN</span>}
                                    </div>
                                    <button className="button button--danger" onClick={() => userDeleteHandler(user.id)}>DELETE</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </React.Fragment>
    );
};

export default ManageUsers;
