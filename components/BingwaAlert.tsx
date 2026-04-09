import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, Pressable } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFeedback, AlertType } from '../context/FeedbackContext';

const { width } = Dimensions.get('window');

const THEMES = {
  success: {
    color: '#25D366',
    icon: 'checkmark-circle' as const,
    gradient: ['#25D366', '#128C7E'],
    bg: 'rgba(37, 211, 102, 0.1)',
  },
  error: {
    color: '#F4A261', // The Orange color from Permissions page
    icon: 'shield-alert' as const,
    gradient: ['#F4A261', '#E76F51'],
    bg: 'rgba(244, 162, 97, 0.1)',
  },
  info: {
    color: '#3B82F6',
    icon: 'information-circle' as const,
    gradient: ['#3B82F6', '#2563EB'],
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  warning: {
    color: '#FBBF24',
    icon: 'warning' as const,
    gradient: ['#FBBF24', '#D97706'],
    bg: 'rgba(251, 191, 36, 0.1)',
  },
};

export const BingwaAlert = () => {
  const { alertConfig, hideAlert } = useFeedback();
  const theme = THEMES[alertConfig.type] || THEMES.info;

  return (
    <Modal
      transparent
      visible={alertConfig.visible}
      animationType="none"
      onRequestClose={hideAlert}
    >
      <View style={styles.overlay}>
        <AnimatePresence>
          {alertConfig.visible && (
            <Pressable style={StyleSheet.absoluteFill} onPress={hideAlert}>
                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={styles.backdrop}
                />
            </Pressable>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {alertConfig.visible && (
            <MotiView
              from={{ opacity: 0, scale: 0.9, translateY: 20 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, translateY: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              style={styles.modalContainer}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
                <Ionicons name={theme.icon} size={48} color={theme.color} />
                <MotiView
                    from={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{ loop: true, duration: 2000, type: 'timing' }}
                    style={[styles.pulse, { backgroundColor: theme.color }]}
                />
              </View>

              <Text style={styles.title}>{alertConfig.title}</Text>
              <Text style={styles.message}>{alertConfig.message}</Text>

              <View style={styles.buttonContainer}>
                {alertConfig.buttons ? (
                  alertConfig.buttons.map((btn, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        hideAlert();
                        btn.onPress?.();
                      }}
                      style={styles.button}
                    >
                      <LinearGradient
                        colors={theme.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradient}
                      >
                        <Text style={styles.buttonText}>{btn.text}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))
                ) : (
                  <TouchableOpacity onPress={hideAlert} style={styles.button}>
                    <LinearGradient
                      colors={theme.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradient}
                    >
                      <Text style={styles.buttonText}>Got it</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 20, 26, 0.8)', // Matches Bingwa dark theme
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    backgroundColor: '#FFFFFF', // Light mode bg (TODO: support dark mode)
    borderRadius: 40,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_900Black',
    color: '#0B141A',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(11, 20, 26, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 56,
    borderRadius: 22,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'Poppins_800ExtraBold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
