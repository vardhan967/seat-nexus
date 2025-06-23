
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  authToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
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
  const [authToken, setAuthToken] = useState<string | null>(null);

  const decodeJWT = (token: string): User | null => {
    try {
      console.log('Attempting to decode JWT token:', token.substring(0, 50) + '...');
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      console.log('Successfully decoded user from JWT:', decoded);
      return decoded;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  const login = (token: string) => {
    console.log('Login function called with token');
    localStorage.setItem('authToken', token);
    setAuthToken(token);
    const decodedUser = decodeJWT(token);
    if (decodedUser) {
      setUser(decodedUser);
      console.log('User set successfully:', decodedUser);
    } else {
      console.error('Failed to decode user from token');
    }
  };

  const logout = () => {
    console.log('Logout function called');
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    console.log('Checking for stored token on app load:', storedToken ? 'Token found' : 'No token found');
    if (storedToken) {
      setAuthToken(storedToken);
      const decodedUser = decodeJWT(storedToken);
      if (decodedUser) {
        setUser(decodedUser);
        console.log('User restored from stored token:', decodedUser);
      }
    }
  }, []);

  const isAuthenticated = !!user && !!authToken;
  console.log('Authentication state:', { isAuthenticated, hasUser: !!user, hasToken: !!authToken });

  const value = {
    user,
    authToken,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
