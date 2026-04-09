import React, { createContext, useContext, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
}

interface FeedbackContextType {
  showAlert: (config: Omit<AlertConfig, 'visible'>) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  hideAlert: () => void;
  alertConfig: AlertConfig;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const showAlert = useCallback((config: Omit<AlertConfig, 'visible'>) => {
    setAlertConfig({ ...config, visible: true });
    
    // Automatic Haptics
    if (Platform.OS !== 'web') {
      if (config.type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      } else if (config.type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
    }
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showAlert({ type: 'success', title, message });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string) => {
    showAlert({ type: 'error', title, message });
  }, [showAlert]);

  return (
    <FeedbackContext.Provider value={{ showAlert, showSuccess, showError, hideAlert, alertConfig }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};
