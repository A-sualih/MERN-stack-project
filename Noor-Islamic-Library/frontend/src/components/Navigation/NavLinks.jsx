import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';

const NavLinks = () => {
    const auth = useContext(AuthContext);

    return (
        <ul className="nav-links">
            <li>
                <NavLink to="/" end>Home</NavLink>
            </li>
            <li>
                <NavLink to="/quran">Qur'an</NavLink>
            </li>
            <li>
                <NavLink to="/hadith">Hadith</NavLink>
            </li>
            <li>
                <NavLink to="/tafsir">Tafsir</NavLink>
            </li>
            <li>
                <NavLink to="/library/Fiqh">Fiqh</NavLink>
            </li>
            <li>
                <NavLink to="/library/Seerah">Seerah</NavLink>
            </li>
            <li>
                <NavLink to="/library/Duas">Duas</NavLink>
            </li>
            <li>
                <NavLink to="/books">Books</NavLink>
            </li>
            {!auth.isLoggedIn && (
                <li>
                    <NavLink to="/auth">Authenticate</NavLink>
                </li>
            )}
            {auth.isLoggedIn && (
                <li>
                    <button className="btn btn-outline" onClick={auth.logout}>LOGOUT</button>
                </li>
            )}
            {auth.isLoggedIn && auth.role === 'admin' && (
                <li>
                    <NavLink to="/admin" className="btn btn-primary">ADMIN</NavLink>
                </li>
            )}
        </ul>
    );
};

export default NavLinks;
