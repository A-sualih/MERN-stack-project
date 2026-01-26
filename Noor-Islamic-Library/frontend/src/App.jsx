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
import MainNavigation from './components/Navigation/MainNavigation';
import { AuthContext } from './context/auth-context';

const App = () => {
  const [token, setToken] = useState(false);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);

  const login = useCallback((uid, token, role, expirationDate) => {
    setToken(token);
    setUserId(uid);
    setRole(role);
    localStorage.setItem(
      'userData',
      JSON.stringify({ userId: uid, token: token, role: role })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    setRole(null);
    localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (storedData && storedData.token) {
      login(storedData.userId, storedData.token, storedData.role);
    }
  }, [login]);

  let routes;

  if (token) {
    routes = (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quran" element={<Quran />} />
        <Route path="/hadith" element={<Hadith />} />
        <Route path="/tafsir" element={<Tafsir />} />
        <Route path="/books" element={<Books />} />
        <Route path="/library/:category" element={<Library />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    );
  }

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
