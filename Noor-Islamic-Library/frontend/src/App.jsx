import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Auth from './pages/Auth';
import Quran from './pages/Quran';
import Hadith from './pages/Hadith';
import Tafsir from './pages/Tafsir';
import Books from './pages/Books';
import Library from './pages/Library';
import AdminDashboard from './pages/AdminDashboard';
import ManageBooks from './pages/ManageBooks';
import ManageCategories from './pages/ManageCategories';
import MainNavigation from './components/Navigation/MainNavigation';

import { AuthContext } from './context/auth-context';

const App = () => {
  const [token, setToken] = useState(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);

  const login = useCallback((uid, token, role, expirationDate) => {
    setToken(token);
    setUserId(uid);
    setRole(role);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60); // 1 hour
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      'userData',
      JSON.stringify({
        userId: uid,
        token: token,
        role: role,
        expiration: tokenExpirationDate.toISOString()
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    setRole(null);
    localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    let logoutTimer;
    if (token && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
    return () => clearTimeout(logoutTimer);
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(storedData.userId, storedData.token, storedData.role, new Date(storedData.expiration));
    } else if (storedData && new Date(storedData.expiration) <= new Date()) {
      logout();
    }
  }, [login, logout]);

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/quran" element={<Quran />} />
      <Route path="/hadith" element={<Hadith />} />
      <Route path="/tafsir" element={<Tafsir />} />
      <Route path="/books" element={<Books />} />
      <Route path="/library/:category" element={<Library />} />
      {!token && <Route path="/auth" element={<Auth />} />}
      {token && (role === 'admin' || role === 'content-admin') && (
        <>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<ManageBooks />} />
          <Route path="/admin/categories" element={<ManageCategories />} />
        </>
      )}


      <Route path="*" element={<Navigate to={token ? "/" : "/auth"} />} />
    </Routes>
  );

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        userId: userId,
        role: role,
        login: login,
        logout: logout
      }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
