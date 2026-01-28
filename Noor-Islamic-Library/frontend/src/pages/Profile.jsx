import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { useHttpClient } from '../hooks/http-hook';
import './Profile.css';

const Profile = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        dateOfBirth: '',
        country: 'Ethiopia',
        streetAddress: '',
        aptSuite: '',
        city: '',
        stateProvince: '',
        zipPostalCode: '',
        phone: ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const responseData = await sendRequest(
                    `http://localhost:5000/api/users/profile/${auth.userId}`,
                    'GET',
                    null,
                    { Authorization: 'Bearer ' + auth.token }
                );
                const user = responseData.user;
                setUserData({
                    name: user.name || '',
                    email: user.email || '',
                    dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                    country: user.country || 'Ethiopia',
                    streetAddress: user.streetAddress || '',
                    aptSuite: user.aptSuite || '',
                    city: user.city || '',
                    stateProvince: user.stateProvince || '',
                    zipPostalCode: user.zipPostalCode || '',
                    phone: user.phone || ''
                });
            } catch (err) { }
        };
        if (auth.userId) fetchUserData();
    }, [sendRequest, auth.userId, auth.token]);

    const inputHandler = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await sendRequest(
                `http://localhost:5000/api/users/profile/${auth.userId}`,
                'PATCH',
                JSON.stringify(userData),
                {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token
                }
            );
            alert('Profile updated successfully! ✨');
        } catch (err) { }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <header className="profile-header-lux">
                    <div className="profile-avatar-large">
                        {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="profile-title-area">
                        <h1>{userData.name || 'Your Profile'}</h1>
                        <p>{userData.email}</p>
                    </div>
                </header>

                {error && <div className="error-message" style={{ marginBottom: '30px' }}>{error}</div>}

                <form onSubmit={submitHandler} className="profile-grid-lux">
                    {/* Basic Info */}
                    <div className="profile-section-card">
                        <h3>👤 Basic Information</h3>
                        <div className="input-lux-group">
                            <label>Full Name *</label>
                            <input
                                className="input-lux"
                                name="name"
                                value={userData.name}
                                onChange={inputHandler}
                                required
                            />
                        </div>
                        <div className="input-lux-group">
                            <label>Date of Birth *</label>
                            <input
                                className="input-lux"
                                type="date"
                                name="dateOfBirth"
                                value={userData.dateOfBirth}
                                onChange={inputHandler}
                                required
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="profile-section-card">
                        <h3>📞 Contact Details</h3>
                        <div className="input-lux-group">
                            <label>Phone *</label>
                            <div className="phone-input-container">
                                <select className="input-lux country-code-lux" disabled>
                                    <option>+251</option>
                                </select>
                                <input
                                    className="input-lux"
                                    type="tel"
                                    name="phone"
                                    placeholder="912 345 678"
                                    value={userData.phone}
                                    onChange={inputHandler}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-lux-group">
                            <label>Country *</label>
                            <input
                                className="input-lux"
                                name="country"
                                value={userData.country}
                                onChange={inputHandler}
                                required
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="profile-section-card full-width-section">
                        <h3>🏠 Residential Address</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="input-lux-group">
                                <label>Street Address *</label>
                                <input
                                    className="input-lux"
                                    name="streetAddress"
                                    placeholder="Enter street address"
                                    value={userData.streetAddress}
                                    onChange={inputHandler}
                                    required
                                />
                            </div>
                            <div className="input-lux-group">
                                <label>Apt / Suite (Optional)</label>
                                <input
                                    className="input-lux"
                                    name="aptSuite"
                                    placeholder="Apt/Suite"
                                    value={userData.aptSuite}
                                    onChange={inputHandler}
                                />
                            </div>
                            <div className="input-lux-group">
                                <label>City *</label>
                                <input
                                    className="input-lux"
                                    name="city"
                                    placeholder="Enter city"
                                    value={userData.city}
                                    onChange={inputHandler}
                                    required
                                />
                            </div>
                            <div className="input-lux-group">
                                <label>State / Province</label>
                                <input
                                    className="input-lux"
                                    name="stateProvince"
                                    placeholder="Enter state/province"
                                    value={userData.stateProvince}
                                    onChange={inputHandler}
                                />
                            </div>
                            <div className="input-lux-group">
                                <label>ZIP / Postal Code</label>
                                <input
                                    className="input-lux"
                                    name="zipPostalCode"
                                    placeholder="Enter ZIP code"
                                    value={userData.zipPostalCode}
                                    onChange={inputHandler}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="full-width-section" style={{ display: 'flex', justifyContent: 'center' }}>
                        <button type="submit" className="save-profile-btn" disabled={isLoading}>
                            {isLoading ? 'Updating Repository...' : '✨ SAVE PROFILE DETAILS'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
