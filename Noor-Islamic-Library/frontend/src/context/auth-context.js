import { createContext } from 'react';

export const AuthContext = createContext({
    isLoggedIn: false,
    userId: null,
    token: null,
    role: null,
    login: (uid, token, role, expirationDate) => { },
    logout: () => { }
});
