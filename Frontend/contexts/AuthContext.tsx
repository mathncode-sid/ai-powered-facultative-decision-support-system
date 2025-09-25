'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: UserRole) => boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Simulate checking for existing session on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // In a real app, this would check for stored tokens/session
        const storedUser = localStorage.getItem('krfds_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Mock login - in real implementation, call API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data based on email
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0].replace('.', ' ').split(' ').map(n => 
          n.charAt(0).toUpperCase() + n.slice(1)
        ).join(' '),
        role: email.includes('underwriter') ? 'facultative_underwriter' :
              email.includes('portfolio') ? 'portfolio_manager' :
              email.includes('manager') ? 'senior_manager' : 'facultative_underwriter',
        department: 'Facultative Underwriting',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        lastLogin: new Date(),
        permissions: [
          { resource: 'submissions', actions: ['read', 'write', 'approve'] },
          { resource: 'portfolio', actions: ['read'] },
          { resource: 'reports', actions: ['read', 'write'] },
        ],
      };

      localStorage.setItem('krfds_user', JSON.stringify(mockUser));
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid credentials' });
    }
  };

  const logout = (): void => {
    localStorage.removeItem('krfds_user');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!state.user) return false;
    
    const permission = state.user.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action as any) : false;
  };

  const hasRole = (role: UserRole): boolean => {
    return state.user?.role === role;
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};