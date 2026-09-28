import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { LoginScreen } from '../../features/auth/LoginScreen';
import { ForgotPasswordScreen } from '../../features/auth/ForgotPasswordScreen';
import { RegisterScreen } from '../../features/auth/RegisterScreen';

export const AuthNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'LOGIN' | 'FORGOT_PASSWORD' | 'REGISTER'>('LOGIN');

  useEffect(() => {
    const onBackPress = () => {
      if (currentScreen === 'FORGOT_PASSWORD' || currentScreen === 'REGISTER') {
        setCurrentScreen('LOGIN');
        return true;
      }
      // On Login screen, allow default Android back behavior (app background/exit)
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [currentScreen]);

  if (currentScreen === 'FORGOT_PASSWORD') {
    return <ForgotPasswordScreen onBack={() => setCurrentScreen('LOGIN')} />;
  }

  if (currentScreen === 'REGISTER') {
    return (
      <RegisterScreen
        onBackToLogin={() => setCurrentScreen('LOGIN')}
        onRegisterSuccess={() => setCurrentScreen('LOGIN')}
      />
    );
  }

  return (
    <LoginScreen
      onForgotPassword={() => setCurrentScreen('FORGOT_PASSWORD')}
      onRegister={() => setCurrentScreen('REGISTER')}
    />
  );
};


