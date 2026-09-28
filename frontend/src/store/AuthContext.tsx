import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Manager } from '../types';
import { authService, AuthLoginResult } from '../services/auth/AuthService';
import { pushNotificationService } from '../services/push/PushNotificationService';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  manager: Manager | null;
  token: string | null;
  authError: string | null;
  login: (username: string, password: string) => Promise<AuthLoginResult>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [manager, setManager] = useState<Manager | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const currentManager = await authService.getCurrentManager();
        if (currentManager) {
          setManager(currentManager);
          setIsAuthenticated(true);
          // Register FCM token for current authenticated manager
          pushNotificationService.registerDeviceToken(currentManager.id, currentManager.role, {
            state: currentManager.state,
            district: currentManager.districts?.[0],
            division: currentManager.division,
            pincode: currentManager.pincode,
          }).catch(err => console.warn('FCM token registration failed on bootstrap:', err));
        }
      } catch (err) {
        console.warn('Auth bootstrap failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (username: string, password: string): Promise<AuthLoginResult> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await authService.login(username, password);
      if (result.success && result.manager && result.token) {
        setToken(result.token);
        setManager(result.manager);
        setIsAuthenticated(true);
        // Register FCM device token on login
        pushNotificationService.registerDeviceToken(result.manager.id, result.manager.role, {
          state: result.manager.state,
          district: result.manager.districts?.[0],
          division: result.manager.division,
          pincode: result.manager.pincode,
        }).catch(err => console.warn('FCM token registration failed on login:', err));
      } else if (result.errorMessage) {
        setAuthError(result.errorMessage);
      }
      return result;
    } catch (err) {
      const fallbackError = 'An unexpected authentication error occurred.';
      setAuthError(fallbackError);
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: fallbackError,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (manager) {
        await pushNotificationService.deactivateDeviceToken(manager.id).catch(err => {
          console.warn('FCM token deactivation error on logout:', err);
        });
      }
      await authService.logout();
      setToken(null);
      setManager(null);
      setIsAuthenticated(false);
      setAuthError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        manager,
        token,
        authError,
        login,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
