import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from './Avatar';

interface UserCardProps {
  id: string;
  name: string;
  email: string;
  age?: number;
  city?: string;
  school?: string;
  interests?: string[];
  lookingFor?: 'cofounder' | 'team' | 'freelance' | 'learn' | null;
  isOnline?: boolean;
  onPress: () => void;
  onConnect: () => void;
}

const INTEREST_EMOJIS: Record<string, string> = {
  'AI': '🤖',
  'Machine Learning': '🧠',
  'Web Development': '💻',
  'Mobile Apps': '📱',
  'Design': '🎨',
  'UI/UX': '✨',
  'Data Science': '📊',
  'Blockchain': '⛓️',
  'Cybersecurity': '🔒',
  'Cloud Computing': '☁️',
  'DevOps': '⚙️',
  'Entrepreneurship': '🚀',
  'Startups': '💡',
  'Marketing': '📣',
  'Business': '💼',
  'Finance': '💰',
  'React': '⚛️',
  'Python': '🐍',
  'JavaScript': '💛',
  'Java': '☕',
  'Web3': '🌐',
  'Mobile Dev': '📱',
  'Art': '🎨',
  'SAAS': '☁️',
  'Math': '🔢',
  'Physics': '⚗️',
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

export default function UserCard({
  name,
  email,
  age,
  city,
  school,
  interests = [],
  lookingFor,
  isOnline = false,
  onPress,
  onConnect,
}: UserCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation: fade + scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 1.03,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonAnim, {
      toValue: 0.95,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const getBadgeConfig = () => {
    switch (lookingFor) {
      case 'cofounder':
        return { label: 'Looking for Co-founder', emoji: '🚀' };
      case 'team':
        return { label: 'Looking for Team', emoji: '👥' };
      case 'freelance':
        return { label: 'Looking for Internship', emoji: '💼' };
      case 'learn':
        return { label: 'Looking to Learn', emoji: '📚' };
      default:
        return null;
    }
  };

  const badgeConfig = getBadgeConfig();
  const displayInterests = interests.slice(0, 3);
  const firstName = name.split(' ')[0];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { scale: Animated.multiply(scaleAnim, pressAnim) },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* Avatar with gradient border */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#8b5cf6', '#6366f1', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.avatarInner}>
              <Avatar name={name} email={email} size={76} />
            </View>
          </LinearGradient>

          {/* Online/Offline indicator */}
          <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? '#22c55e' : '#9ca3af' }]} />
        </View>

        {/* Name + Age */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>
            {firstName}
            {age && <Text style={styles.age}>, {age}</Text>}
          </Text>
        </View>

        {/* Location + School */}
        <View style={styles.locationSection}>
          {city && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text style={styles.infoText}>{city}</Text>
            </View>
          )}
          {school && (
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={14} color="#9ca3af" />
              <Text style={styles.infoText} numberOfLines={1}>{school}</Text>
            </View>
          )}
        </View>

        {/* Identity sentence */}
        {displayInterests.length > 0 && (
          <View style={styles.identitySection}>
            <Text style={styles.identityText}>
              I'm building:{' '}
              <Text style={styles.identityHighlight}>
                {displayInterests.join(', ')}
              </Text>
            </Text>
          </View>
        )}

        {/* Looking for badge */}
        {badgeConfig && (
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeEmoji}>{badgeConfig.emoji}</Text>
              <Text style={styles.badgeText}>{badgeConfig.label}</Text>
            </View>
          </View>
        )}

        {/* Interest tags with emojis */}
        {displayInterests.length > 0 && (
          <View style={styles.tagsContainer}>
            {displayInterests.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagEmoji}>
                  {INTEREST_EMOJIS[interest] || '💡'}
                </Text>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Say Hi button */}
        <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonAnim }] }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onConnect}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
          >
            <LinearGradient
              colors={['#8b5cf6', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Say Hi 👋</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 16,
  },
  card: {
    backgroundColor: '#FAF8F5',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  gradientBorder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FAF8F5',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: '50%',
    marginRight: -36,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#FAF8F5',
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  age: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6b7280',
  },
  locationSection: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  identitySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  identityText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  identityHighlight: {
    color: '#1f2937',
    fontWeight: '700',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  badgeEmoji: {
    fontSize: 14,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7c3aed',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  tagEmoji: {
    fontSize: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  buttonWrapper: {
    width: '100%',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
