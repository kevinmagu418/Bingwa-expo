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
    emoji: '🌽', // Maize - Success/Harvest
    gradient: ['#25D366', '#128C7E'],
    bg: 'rgba(37, 211, 102, 0.1)',
    animation: 'pop',
  },
  error: {
    color: '#F4A261',
    icon: 'alert-circle' as const,
    emoji: '🐛', // Pest/Bug - Error
    gradient: ['#F4A261', '#E76F51'],
    bg: 'rgba(244, 162, 97, 0.1)',
    animation: 'shake',
  },
  info: {
    color: '#3B82F6',
    icon: 'information-circle' as const,
    emoji: '💡', // Insight/Knowledge - Info
    gradient: ['#3B82F6', '#2563EB'],
    bg: 'rgba(59, 130, 246, 0.1)',
    animation: 'slide',
  },
  warning: {
    color: '#FBBF24',
    icon: 'warning' as const,
    emoji: '🔔', // Bell/Alert - Warning
    gradient: ['#FBBF24', '#D97706'],
    bg: 'rgba(251, 191, 36, 0.1)',
    animation: 'pulse',
  },
};

export const BingwaAlert = () => {
  const { alertConfig, hideAlert } = useFeedback();
  const theme = THEMES[alertConfig.type] || THEMES.info;

  const isError = alertConfig.type === 'error';

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
              from={{ 
                opacity: 0, 
                scale: 0.8, 
                translateY: 20,
                translateX: 0 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                translateY: 0,
                translateX: isError ? [0, -10, 10, -10, 10, 0] : 0
              }}
              exit={{ opacity: 0, scale: 0.8, translateY: 20 }}
              transition={{ 
                type: 'spring', 
                damping: 20,
                translateX: { type: 'timing', duration: 400 } 
              }}
              className="bg-white dark:bg-darkSurface"
              style={styles.modalContainer}
            >
              {/* Floating Decorative Emoji with Hover Animation */}
              <MotiView
                from={{ opacity: 0, scale: 0, translateY: 0 }}
                animate={{ 
                  opacity: 0.4, 
                  scale: 1, 
                  rotate: '15deg',
                  translateY: [0, -15, 0] // Continuous Hover
                }}
                transition={{ 
                  opacity: { delay: 200 },
                  scale: { delay: 200 },
                  translateY: { 
                    loop: true, 
                    duration: 3000, 
                    type: 'timing' 
                  }
                }}
                style={{ position: 'absolute', top: 20, right: 20 }}
              >
                <Text style={{ fontSize: 48 }}>{theme.emoji}</Text>
              </MotiView>

              <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
                <MotiView
                    from={{ scale: 0, rotate: '-180deg' }}
                    animate={{ scale: 1, rotate: '0deg' }}
                    transition={{ type: 'spring', damping: 12, delay: 100 }}
                >
                    <Ionicons name={theme.icon} size={48} color={theme.color} />
                </MotiView>
                
                <MotiView
                    from={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ loop: true, duration: 2500, type: 'timing' }}
                    style={[styles.pulse, { backgroundColor: theme.color }]}
                />
              </View>

              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 300 }}
              >
                <Text className="text-textPrimary dark:text-darkTextPrimary" style={styles.title}>
                    {alertConfig.title}
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 450 }}
              >
                <Text className="text-textSecondary dark:text-darkTextSecondary" style={styles.message}>
                    {alertConfig.message}
                </Text>
              </MotiView>

              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 600 }}
                style={styles.buttonContainer}
              >
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
              </MotiView>
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
    backgroundColor: 'rgba(11, 20, 26, 0.85)',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 48,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulse: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_900Black',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 60,
    borderRadius: 24,
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
    letterSpacing: 2,
  },
});
