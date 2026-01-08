import React from 'react';
import { Link } from 'react-router-dom';
import NavLinks from './NavLinks';

const MainNavigation = () => {
    return (
        <nav className="glass">
            <Link to="/" className="logo">
                <span style={{ fontSize: '1.8rem' }}>📖</span> Noor Library
            </Link>
            <NavLinks />
        </nav>
    );
};

export default MainNavigation;
