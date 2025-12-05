import React, { useEffect, useState } from 'react';
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

interface PersonCardProps {
  id: string;
  name: string;
  email: string;
  age?: number;
  location?: string;
  school?: string;
  bio?: string;
  buildingStatement?: string;
  interests?: string[];
  statusBadge?: 'cofounder' | 'team' | 'opportunities' | null;
  isOnline?: boolean;
  onPress: () => void;
  onConnect: () => void;
}

const INTEREST_ICONS: Record<string, string> = {
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
  'Web3': '⛓️',
  'Mobile Dev': '📱',
  'Math': '🔢',
  'Physics': '⚗️',
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

export default function PersonCard({
  id,
  name,
  email,
  age,
  location,
  school,
  bio,
  buildingStatement,
  interests = [],
  statusBadge,
  isOnline = false,
  onPress,
  onConnect,
}: PersonCardProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const getStatusBadgeConfig = () => {
    switch (statusBadge) {
      case 'cofounder':
        return {
          label: 'Looking for co-founder',
          icon: 'rocket-outline' as const,
          colors: ['#f59e0b', '#f97316'],
        };
      case 'team':
        return {
          label: 'Looking for team',
          icon: 'people-outline' as const,
          colors: ['#8b5cf6', '#6366f1'],
        };
      case 'opportunities':
        return {
          label: 'Looking for opportunities',
          icon: 'sparkles-outline' as const,
          colors: ['#10b981', '#059669'],
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusBadgeConfig();
  const displayInterests = interests.slice(0, 3);
  const displayName = name.split(' ')[0]; // First name only

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.card}>
          {/* Header: Avatar + Name + Age */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#8b5cf6', '#3b82f6', '#06b6d4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBorder}
              >
                <View style={styles.avatarInner}>
                  <Avatar name={name} email={email} size={68} />
                </View>
              </LinearGradient>

              {/* Online/Busy Indicator */}
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? '#10b981' : '#ef4444' },
                ]}
              />
            </View>

            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {displayName}
                </Text>
                {age && <Text style={styles.age}>{age}</Text>}
              </View>

              {location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color="#6b7280" />
                  <Text style={styles.location} numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              )}

              {school && (
                <View style={styles.schoolRow}>
                  <Ionicons name="school" size={14} color="#6b7280" />
                  <Text style={styles.school} numberOfLines={1}>
                    {school}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Status Badge */}
          {statusConfig && (
            <LinearGradient
              colors={statusConfig.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statusBadge}
            >
              <Ionicons name={statusConfig.icon} size={14} color="#fff" />
              <Text style={styles.statusBadgeText}>{statusConfig.label}</Text>
            </LinearGradient>
          )}

          {/* Building Statement */}
          {buildingStatement && (
            <View style={styles.buildingSection}>
              <Text style={styles.buildingLabel}>I'm building:</Text>
              <Text style={styles.buildingText} numberOfLines={2}>
                {buildingStatement}
              </Text>
            </View>
          )}

          {/* Interest Tags */}
          {displayInterests.length > 0 && (
            <View style={styles.interestsContainer}>
              {displayInterests.map((interest, index) => (
                <View key={index} style={styles.interestChip}>
                  <Text style={styles.interestEmoji}>
                    {INTEREST_ICONS[interest] || '💡'}
                  </Text>
                  <Text style={styles.interestText} numberOfLines={1}>
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Connect Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={(e) => {
              e.stopPropagation();
              onConnect();
            }}
          >
            <LinearGradient
              colors={['#8b5cf6', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.connectButton}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#fff" />
              <Text style={styles.connectButtonText}>Connect</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  gradientBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 4,
  },
  avatarInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  headerInfo: {
    flex: 1,
    paddingTop: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginRight: 6,
  },
  age: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  school: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 14,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  buildingSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  buildingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  buildingText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    maxWidth: '48%',
  },
  interestEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  interestText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7c3aed',
    flex: 1,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
});
