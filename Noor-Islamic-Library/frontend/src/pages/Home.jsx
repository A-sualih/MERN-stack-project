import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container">
            <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 className="hero-title">
                    Noor Islamic Library
                </h1>
                <p className="hero-text">
                    Explore a vast collection of Islamic knowledge. Read the Qur'an, search the Hadith, and access authentic Islamic books, all in one place.
                </p>
                <div style={{ marginTop: '40px' }}>
                    <Link to="/quran" className="btn btn-primary" style={{ margin: '10px' }}>Start Reading</Link>
                    <Link to="/auth" className="btn btn-outline" style={{ margin: '10px' }}>Join Community</Link>
                </div>
            </header>

            <div className="grid">
                <div className="card glass">
                    <h2 style={{ color: 'var(--primary-light)', marginBottom: '15px' }}>📖 The Holy Qur'an</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Read and listen to the divine words. Accessible offline with translations.</p>
                    <Link to="/quran" style={{ display: 'block', marginTop: '20px', color: 'var(--secondary-light)', fontWeight: '600' }}>Explore →</Link>
                </div>
                <div className="card glass">
                    <h2 style={{ color: 'var(--primary-light)', marginBottom: '15px' }}>📜 Prophetic Hadith</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Search through authentic collections like Sahih Bukhari and Muslim.</p>
                    <Link to="/hadith" style={{ display: 'block', marginTop: '20px', color: 'var(--secondary-light)', fontWeight: '600' }}>Search →</Link>
                </div>
                <div className="card glass">
                    <h2 style={{ color: 'var(--primary-light)', marginBottom: '15px' }}>📚 Islamic Books</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Download and read scholarly works, PDF textbooks, and more.</p>
                    <Link to="/books" style={{ display: 'block', marginTop: '20px', color: 'var(--secondary-light)', fontWeight: '600' }}>Browse →</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
