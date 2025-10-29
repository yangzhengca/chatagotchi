import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from './api';
import { stytch } from './StytchProvider';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  img?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  genLoginToken: (email: string) => Promise<void>;
  verifyToken: (email: string, token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  setError: (error: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const genLoginToken = async (email: string) => {
    try {
      const response = await authApi.genLoginCode(email);
      if (!response.success) {
        if (!response.userExist) {
          setError('User not found. Please create an account at datalab.biggeo.com');
          // Optionally redirect
          setTimeout(() => {
            window.location.href = 'https://datalab.biggeo.com';
          }, 3000);
        } else {
          setError('Failed to generate login token. Please try again.');
        }
        return;
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };


  const verifyToken = async (email: string, token: string) => {
    try {
      const response = await authApi.verifyToken(email, token);
      setToken(response.stytchJwt);
      setUser(response.user);
      localStorage.setItem('token', response.stytchJwt);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };


  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    stytch.session.revoke();
  };

  const value = {
    user,
    token,
    genLoginToken,
    verifyToken,
    logout,
    loading,
    error,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};