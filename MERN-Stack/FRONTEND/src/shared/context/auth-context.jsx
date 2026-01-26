import { createContext } from "react";
export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  userId: null,
  token: null,
  isAdmin: false,
  login: (uid, token, expirationDate, isAdmin) => { },
  logout: () => { },
});
