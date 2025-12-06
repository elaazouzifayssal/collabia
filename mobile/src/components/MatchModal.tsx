import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Avatar from './Avatar';

interface MatchModalProps {
  visible: boolean;
  currentUser: {
    name: string;
    email: string;
  };
  matchedUser: {
    name: string;
    email: string;
  };
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

const { width, height } = Dimensions.get('window');

export default function MatchModal({
  visible,
  currentUser,
  matchedUser,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      heartScale.setValue(0);

      // Run entry animations
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(heartScale, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.95)', 'rgba(99, 102, 241, 0.95)']}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* It's a Match! Text */}
          <Text style={styles.matchTitle}>It's a Match! 🎉</Text>
          <Text style={styles.matchSubtitle}>
            You and {matchedUser.name.split(' ')[0]} both want to collaborate
          </Text>

          {/* Avatars */}
          <View style={styles.avatarsContainer}>
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={['#fff', '#f0f0f0']}
                style={styles.avatarBorder}
              >
                <Avatar name={currentUser.name} email={currentUser.email} size={100} />
              </LinearGradient>
            </View>

            {/* Heart Icon */}
            <Animated.View
              style={[
                styles.heartContainer,
                { transform: [{ scale: heartScale }] },
              ]}
            >
              <LinearGradient
                colors={['#ec4899', '#f43f5e']}
                style={styles.heartGradient}
              >
                <Ionicons name="heart" size={28} color="#fff" />
              </LinearGradient>
            </Animated.View>

            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={['#fff', '#f0f0f0']}
                style={styles.avatarBorder}
              >
                <Avatar name={matchedUser.name} email={matchedUser.email} size={100} />
              </LinearGradient>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.sendMessageButton}
              onPress={onSendMessage}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#fff', '#f8f8f8']}
                style={styles.buttonGradient}
              >
                <Ionicons name="chatbubble-ellipses" size={22} color="#8b5cf6" />
                <Text style={styles.sendMessageText}>Send a Message</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keepSwipingButton}
              onPress={onKeepSwiping}
              activeOpacity={0.8}
            >
              <Text style={styles.keepSwipingText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  matchTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  matchSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: '500',
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  avatarWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarBorder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartContainer: {
    marginHorizontal: -20,
    zIndex: 10,
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  heartGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  sendMessageButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  sendMessageText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  keepSwipingButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  keepSwipingText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
});
