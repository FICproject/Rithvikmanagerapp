import React, { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../../store/AuthContext';

export const AppProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SafeAreaProvider>
      <AuthProvider>{children}</AuthProvider>
    </SafeAreaProvider>
  );
};
