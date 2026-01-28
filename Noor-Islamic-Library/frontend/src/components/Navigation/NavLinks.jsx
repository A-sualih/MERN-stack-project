import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';

const NavLinks = () => {
    const auth = useContext(AuthContext);

    return (
        <ul className="nav-links">
            <li>
                <NavLink to="/" end><span>🏠</span> Home</NavLink>
            </li>
            {auth.isLoggedIn && (
                <>
                    <li>
                        <NavLink to="/quran"><span>📖</span> Qur'an</NavLink>
                    </li>
                    <li>
                        <NavLink to="/hadith"><span>📜</span> Hadith</NavLink>
                    </li>
                    <li>
                        <NavLink to="/tafsir"><span>🕌</span> Tafsir</NavLink>
                    </li>
                    <li>
                        <NavLink to="/library/Fiqh"><span>⚖️</span> Fiqh</NavLink>
                    </li>
                    <li>
                        <NavLink to="/library/Seerah"><span>🕋</span> Seerah</NavLink>
                    </li>
                    <li>
                        <NavLink to="/library/Duas"><span>🤲</span> Duas</NavLink>
                    </li>
                    <li>
                        <NavLink to="/books"><span>📚</span> Books</NavLink>
                    </li>
                </>
            )}
            {!auth.isLoggedIn && (
                <li>
                    <NavLink to="/auth" className="auth-btn"><span>🔑</span> Login</NavLink>
                </li>
            )}
            {auth.isLoggedIn && (
                <li className="nav-user-controls">
                    {(auth.role === 'admin' || auth.role === 'content-admin') && (
                        <NavLink to="/admin" className="admin-pill">⚡ Admin</NavLink>
                    )}
                    <NavLink to="/profile" className="profile-pill">👤 Profile</NavLink>
                    <button className="logout-pill" onClick={auth.logout}>Sign Out</button>
                </li>
            )}
        </ul>
    );
};

export default NavLinks;
