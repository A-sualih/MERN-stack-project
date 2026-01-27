import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavLinks from './NavLinks';

const MainNavigation = () => {
    const [drawerIsOpen, setDrawerIsOpen] = useState(false);

    const toggleDrawer = () => {
        setDrawerIsOpen(!drawerIsOpen);
    };

    return (
        <>
            {drawerIsOpen && <div className="backdrop" onClick={toggleDrawer}></div>}
            <nav className="glass main-nav">
                <Link to="/" className="logo">
                    <span style={{ fontSize: '1.8rem' }}>📖</span> Noor Library
                </Link>

                <button className="main-navigation__menu-btn" onClick={toggleDrawer}>
                    <span />
                    <span />
                    <span />
                </button>

                <div className={`nav-links-container ${drawerIsOpen ? 'open' : ''}`} onClick={() => setDrawerIsOpen(false)}>
                    <NavLinks />
                </div>
            </nav>
        </>
    );
};

export default MainNavigation;
