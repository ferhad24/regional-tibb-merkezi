import { createContext, useContext, useEffect, useState } from 'react';
import api, { tokenStorage } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        tokenStorage.clear();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    tokenStorage.set(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (form) => {
    await api.post('/auth/register', form);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isPatient = user?.role === 'ROLE_PATIENT';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, isAdmin, isPatient }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
