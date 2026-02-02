import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/auth-context';

import './Home.css';

const Home = () => {
    const auth = useContext(AuthContext);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "السَّلَامُ عَلَيْكُمْ وَصَبَاحُ الْخَيْرِ";
        if (hour < 18) return "السَّلَامُ عَلَيْكُمْ وَطَابَ مَسَاؤُكُمْ";
        return "السَّلَامُ عَلَيْكُمْ وَمَسَاءُ الْخَيْرِ";
    };

    const dailyAyah = {
        arabic: "رَبِّ زِدْنِي عِلْمًا",
        translation: "O my Lord, increase me in knowledge.",
        source: "Surah Taha [20:114]"
    };


    return (
        <div className="home-page">
            {/* Animated Background Blobs */}
            <div className="bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            {/* Hero Section */}
            <section className="home-hero">
                <div className="container hero-content-wrapper">
                    <span className="hero-badge">
                        <span style={{ fontSize: '1.2rem' }}>✨</span>
                        Authentic Islamic Wisdom
                    </span>
                    <h1 className="hero-title arabic-font">
                        {getTimeGreeting()} <br />
                        <span style={{ fontSize: '0.75em', opacity: 0.9 }}>أَهْلًا بِكُمْ فِي مَكْتَبَةِ النُّورِ الإِسْلَامِيَّةِ</span>
                    </h1>
                    <p className="hero-text">
                        Embark on a journey through divine revelation and prophetic tradition. Your comprehensive sanctuary for the Qur'an, Hadith, and the treasures of Islamic scholarship.
                    </p>

                    <div className="hero-search-container">
                        <div className="hero-search-bar">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search Ayahs, Hadiths, or scholarly works..."
                                className="search-input"
                            />
                            <button className="search-submit">Explore</button>
                        </div>
                        <div className="search-tags">
                            <span className="quick-access-label">Quick Access:</span>
                            <div className="tags-wrapper">
                                <Link to="/quran" className="tag-chip"><span>📖</span> Qur'an</Link>
                                <Link to="/hadith" className="tag-chip"><span>📜</span> Bukhari</Link>
                                <Link to="/library/Seerah" className="tag-chip"><span>🕋</span> Seerah</Link>
                                <Link to="/books" className="tag-chip"><span>📚</span> PDF Books</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Stats Section */}
            <div className="container">
                <div className="stats-grid glass">
                    <div className="stat-item">
                        <span className="stat-number">114</span>
                        <span className="stat-label">Surahs</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">15K+</span>
                        <span className="stat-label">Hadiths</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">PDF Books</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">Global Access</span>
                    </div>
                </div>
            </div>

            {/* Daily Ayah Section */}
            <section className="container daily-inspiration-wrapper">
                <div className="daily-quote-card">
                    <h3 className="section-subtitle" style={{ textAlign: 'left', marginBottom: '30px', color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        — Verse of the Day
                    </h3>
                    <div className="quote-arabic arabic-font">{dailyAyah.arabic}</div>
                    <p className="quote-translation" style={{ fontSize: '1.6rem', fontWeight: '500' }}>"{dailyAyah.translation}"</p>
                    <span className="quote-source" style={{ color: 'var(--secondary-light)', fontSize: '1.1rem' }}>{dailyAyah.source}</span>
                </div>
            </section>

            {/* Main Features Mosaic Grid */}
            <section className="home-section container">
                <div className="section-header">
                    <h2 className="section-title">Knowledge Pathways</h2>
                    <p className="section-subtitle">Navigate through our vast collection of authentic modules.</p>
                </div>

                <div className="grid-mosaic">
                    <div className="card glass feature-card large">
                        <div className="feature-icon">📖</div>
                        <h3>The Holy Qur'an</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Read, listen, and contemplate the Word of Allah. Complete with multiple translations and profound Tafsir from Ibn Kathir, Al-Sa'di, and more.</p>
                        <Link to={auth.isLoggedIn ? "/quran" : "/auth"} className="btn btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Start Recitation →</Link>
                    </div>

                    <div className="card glass feature-card tall">
                        <div className="feature-icon">📜</div>
                        <h3>Hadith Sanctuary</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Explore authentic Prophetic traditions. Includes Bukhari, Muslim, and specialized collections with Amharic translations.</p>
                        <Link to={auth.isLoggedIn ? "/hadith" : "/auth"} className="btn btn-outline" style={{ marginTop: 'auto' }}>Study Hadith →</Link>
                    </div>

                    <div className="card glass feature-card">
                        <div className="feature-icon">🤲</div>
                        <h3>Duas & Azkar</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Supplications from the Sunnah for morning, evening, and special occasions to keep your heart in remembrance.</p>
                        <Link to={auth.isLoggedIn ? "/library/Duas" : "/auth"} className="btn btn-outline" style={{ marginTop: 'auto' }}>Find Peace →</Link>
                    </div>

                    <div className="card glass feature-card">
                        <div className="feature-icon">🕋</div>
                        <h3>Seerah (Prophetic Biography)</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Detailed Seerah accounts from authentic sources to understand the mercy sent to all of mankind.</p>
                        <Link to={auth.isLoggedIn ? "/library/Seerah" : "/auth"} className="btn btn-outline" style={{ marginTop: 'auto' }}>Read History →</Link>
                    </div>

                    <div className="card glass feature-card large">
                        <div className="feature-icon">📚</div>
                        <h3>Digital Library</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Download and read hundreds of scholarly PDFs. From Fiqh and Aqeedah textbooks to modern Islamic research papers.</p>
                        <Link to={auth.isLoggedIn ? "/books" : "/auth"} className="btn btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }}>Enter Library →</Link>
                    </div>
                </div>
            </section>

            {/* Community CTA */}
            <section className="container home-section" style={{ marginBottom: '150px' }}>
                <div className="glass" style={{ padding: '80px', borderRadius: '40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.3), rgba(15, 23, 42, 0.7))', border: '1px solid rgba(16, 185, 129, 0.2)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, var(--primary-light), transparent)', opacity: 0.1 }}></div>
                    <h2 style={{ fontSize: '3.5rem', marginBottom: '25px', fontWeight: '800' }}>Start Your Journey Today</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.3rem', maxWidth: '700px', margin: '0 auto 50px', lineHeight: '1.7' }}>
                        Join over thousands of seekers of knowledge. Create a free account to unlock bookmarking, history, and exclusive content.
                    </p>
                    {!auth.isLoggedIn ? (
                        <Link to="/auth" className="btn btn-primary" style={{ padding: '20px 60px', borderRadius: '100px', fontSize: '1.2rem' }}>Get Lifetime Access</Link>
                    ) : (
                        <div style={{ color: 'var(--primary-light)', fontWeight: '800', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                            <span style={{ fontSize: '2rem' }}>🕊️</span> Welcome Home, Seeker of Knowledge.
                        </div>
                    )}
                </div>
            </section >

            {/* Luxury Footer */}
            < footer style={{ textAlign: 'center', padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(2, 6, 23, 0.5)' }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-light)' }}>📖 NOOR LIBRARY</div>
                    <p style={{ color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>Preserving and spreading the light of knowledge for generations to come. Join us in this noble mission.</p>
                    <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '20px' }}>© {new Date().getFullYear()} Noor Islamic Library. All rights reserved.</p>
                </div>
            </footer >
        </div >
    );
};

export default Home;
