import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from './Avatar';

interface CompactStudentCardProps {
  id: string;
  name: string;
  email: string;
  school?: string;
  interests?: string[];
  status?: 'active' | 'away' | 'offline';
  isNew?: boolean;
  sharedInterestCount?: number;
  onPress: () => void;
  onMessage: () => void;
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
  'React': '⚛️',
  'Python': '🐍',
  'JavaScript': '💛',
  'Startups': '🚀',
  'Marketing': '📣',
  'Business': '💼',
};

export default function CompactStudentCard({
  name,
  email,
  school,
  interests = [],
  status = 'offline',
  isNew,
  sharedInterestCount,
  onPress,
  onMessage,
}: CompactStudentCardProps) {
  const topInterests = interests.slice(0, 3);
  const scaleAnim = new Animated.Value(1);
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const getStatusConfig = () => {
    if (isNew) {
      return { label: 'New', color: '#3b82f6', emoji: '✨' };
    }

    switch (status) {
      case 'active':
        return { label: 'Available', color: '#10b981', emoji: '🟢' };
      case 'away':
        return { label: 'Learning', color: '#f59e0b', emoji: '📚' };
      default:
        return { label: 'Busy', color: '#ef4444', emoji: '🔴' };
    }
  };

  const statusConfig = getStatusConfig();

  const getInterestIcon = (interest: string): string => {
    return INTEREST_ICONS[interest] || '💡';
  };

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Avatar with Gradient Border */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#8b5cf6', '#3b82f6', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBorder}
          >
            <View style={styles.avatarInner}>
              <Avatar name={name} email={email} size={56} />
            </View>
          </LinearGradient>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Name & Status Badge */}
          <View style={styles.nameSection}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
              <Text style={styles.statusEmoji}>{statusConfig.emoji}</Text>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* School */}
          {school && (
            <Text style={styles.school} numberOfLines={1}>
              🎓 {school}
            </Text>
          )}

          {/* Shared Interests Highlight */}
          {sharedInterestCount !== undefined && sharedInterestCount > 0 && (
            <View style={styles.sharedContainer}>
              <Ionicons name="heart" size={12} color="#ec4899" />
              <Text style={styles.shared}>
                {sharedInterestCount} shared interest{sharedInterestCount > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* Interest Chips with Icons */}
          {topInterests.length > 0 && (
            <View style={styles.interestsRow}>
              {topInterests.map((interest, index) => (
                <View key={index} style={styles.interestChip}>
                  <Text style={styles.interestIcon}>{getInterestIcon(interest)}</Text>
                  <Text style={styles.interestText} numberOfLines={1}>
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Connect Button - Large Pill */}
        <TouchableOpacity
          style={styles.connectButton}
          onPress={(e) => {
            e.stopPropagation();
            onMessage();
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8b5cf6', '#6366f1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.connectGradient}
          >
            <Ionicons name="chatbubble-outline" size={16} color="#fff" />
            <Text style={styles.connectText}>Connect</Text>
          </LinearGradient>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 14,
  },
  gradientBorder: {
    borderRadius: 32,
    padding: 3,
  },
  avatarInner: {
    borderRadius: 28,
    backgroundColor: '#fff',
    padding: 2,
  },
  content: {
    marginBottom: 14,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusEmoji: {
    fontSize: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  school: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  sharedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  shared: {
    fontSize: 12,
    color: '#ec4899',
    fontWeight: '700',
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  interestIcon: {
    fontSize: 12,
  },
  interestText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  connectButton: {
    overflow: 'hidden',
    borderRadius: 16,
  },
  connectGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 7,
  },
  connectText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
