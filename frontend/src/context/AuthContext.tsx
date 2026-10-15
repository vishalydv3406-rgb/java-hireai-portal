import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthResponse } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isCandidate: boolean;
  isRecruiter: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; role: string; fullName: string; companyName?: string }) => Promise<void>;
  logout: () => void;
  quickLoginAs: (role: 'CANDIDATE' | 'RECRUITER') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hireai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hireai_token'));

  const handleAuthSuccess = (res: AuthResponse) => {
    const u: User = {
      id: res.userId,
      email: res.email,
      role: res.role,
      fullName: res.fullName,
    };
    setUser(u);
    setToken(res.accessToken);
    localStorage.setItem('hireai_token', res.accessToken);
    localStorage.setItem('hireai_refreshToken', res.refreshToken);
    localStorage.setItem('hireai_user', JSON.stringify(u));
  };

  const login = async (data: { email: string; password: string }) => {
    const res = await authApi.login(data);
    handleAuthSuccess(res);
  };

  const register = async (data: { email: string; password: string; role: string; fullName: string; companyName?: string }) => {
    const res = await authApi.register(data);
    handleAuthSuccess(res);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hireai_token');
    localStorage.removeItem('hireai_refreshToken');
    localStorage.removeItem('hireai_user');
  };

  // Demo 1-click login helper
  const quickLoginAs = async (role: 'CANDIDATE' | 'RECRUITER') => {
    const email = role === 'CANDIDATE' ? 'candidate@hireai.dev' : 'recruiter@hireai.dev';
    const password = 'Password123!';
    try {
      await login({ email, password });
    } catch {
      // If user does not exist yet, automatically register them!
      await register({
        email,
        password,
        role,
        fullName: role === 'CANDIDATE' ? 'Alex Rivera (Staff Engineer)' : 'Sarah Jenkins (Tech Recruiter)',
        companyName: role === 'RECRUITER' ? 'Acme Cloud Systems' : undefined,
      });
    }
  };

  const isCandidate = user?.role === 'CANDIDATE';
  const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isCandidate,
        isRecruiter,
        login,
        register,
        logout,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
