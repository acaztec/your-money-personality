import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, Advisor, LoginCredentials, SignupData } from '../services/authService';

interface AuthContextType {
  advisor: Advisor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [advisor, setAdvisor] = useState<Advisor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const currentAdvisor = AuthService.getCurrentAdvisor();
    if (currentAdvisor && AuthService.isAuthenticated()) {
      setAdvisor(currentAdvisor);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const result = await AuthService.login(credentials);
    if (result.success && result.advisor) {
      setAdvisor(result.advisor);
    }
    return { success: result.success, error: result.error };
  };

  const signup = async (data: SignupData) => {
    const result = await AuthService.signup(data);
    if (result.success && result.advisor) {
      setAdvisor(result.advisor);
    }
    return { success: result.success, error: result.error };
  };

  const logout = () => {
    AuthService.logout();
    setAdvisor(null);
  };

  const value: AuthContextType = {
    advisor,
    isAuthenticated: !!advisor && AuthService.isAuthenticated(),
    isLoading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}