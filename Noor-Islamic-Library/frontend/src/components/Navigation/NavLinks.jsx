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
                <NavLink to="/library/Tafsir">Tafsir</NavLink>
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
           