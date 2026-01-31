import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { useHttpClient } from '../hooks/http-hook';
import { API_BASE_URL } from '../config';

const Auth = () => {
    const auth = useContext(AuthContext);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const switchModeHandler = () => {
        setIsLoginMode(prevMode => !prevMode);
    };

    const inputHandler = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const authSubmitHandler = async event => {
        event.preventDefault();

        if (isLoginMode) {
            try {
                const responseData = await sendRequest(
                    `${API_BASE_URL}/api/users/login`,
                    'POST',
                    JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    }),
                    { 'Content-Type': 'application/json' }
                );
                console.log('[Auth] Login successful, role:', responseData.role);
                auth.login(responseData.userId, responseData.token, responseData.role);
            } catch (err) { }
        } else {
            try {
                const responseData = await sendRequest(
                    `${API_BASE_URL}/api/users/signup`,
                    'POST',
                    JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password
                    }),
                    { 'Content-Type': 'application/json' }
                );
                auth.login(responseData.userId, responseData.token, responseData.role);
            } catch (err) { }
        }
    };

    return (
        <div className="container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 150px)',
            padding: '20px'
        }}>
            <div className="card glass auth-card" style={{ width: '100%', maxWidth: '450px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{isLoginMode ? 'Login' : 'Create Account'}</h2>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <form onSubmit={authSubmitHandler}>
                    {!isLoginMode && (
                        <input
                            className="form-control"
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={inputHandler}
                            required
                        />
                    )}
                    <input
                        className="form-control"
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={inputHandler}
                        required
                    />
                    <input
                        className="form-control"
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={inputHandler}
                        required
                        minLength="6"
                    />
                    <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={isLoading}>
                        {isLoading ? 'Processing...' : (isLoginMode ? 'LOGIN' : 'SIGNUP')}
                    </button>
                </form>
                <hr style={{ margin: '20px 0', borderColor: 'var(--glass-border)' }} />
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={switchModeHandler}>
                    SWITCH TO {isLoginMode ? 'SIGNUP' : 'LOGIN'}
                </button>
            </div>
        </div>
    );
};

export default Auth;
