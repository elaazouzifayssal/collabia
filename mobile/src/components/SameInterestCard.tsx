import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from './Avatar';
import ProgressBar from './ui/ProgressBar';

interface SameInterestCardProps {
  name: string;
  email: string;
  location?: string;
  matchLabel: string;
  gradientColors: readonly [string, string, ...string[]];
  onPress: () => void;
  // Optional structured data
  progress?: number; // 0-100 for books
  status?: 'reading' | 'paused' | 'completed' | 'active' | 'learning' | 'playing';
  level?: 'beginner' | 'intermediate' | 'advanced';
  isActive?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  reading: 'Currently reading',
  paused: 'Paused',
  completed: 'Completed',
  active: 'Active',
  learning: 'Learning',
  playing: 'Playing',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#f59e0b',
  advanced: '#8b5cf6',
};

export default function SameInterestCard({
  name,
  email,
  location,
  matchLabel,
  gradientColors,
  onPress,
  progress,
  status,
  level,
  isActive = true,
}: SameInterestCardProps) {
  const firstName = name.split(' ')[0];
  const hasProgress = typeof progress === 'number' && progress >= 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Gradient border effect */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.cardInner}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <Avatar name={name} email={email} size={64} />
            {/* Active indicator */}
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: isActive ? '#22c55e' : '#9ca3af' },
              ]}
            />
          </View>

          {/* Name */}
          <Text style={styles.name} numberOfLines={1}>
            {firstName}
          </Text>

          {/* Location */}
          {location && (
            <Text style={styles.location} numberOfLines={1}>
              {location.split(',')[0]}
            </Text>
          )}

          {/* Progress bar for books */}
          {hasProgress && (
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={progress}
                height={4}
                gradientColors={gradientColors}
                showLabel={false}
              />
              <Text style={[styles.progressText, { color: gradientColors[0] }]}>
                {progress}% complete
              </Text>
            </View>
          )}

          {/* Level badge for skills */}
          {level && (
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: LEVEL_COLORS[level] + '20' },
              ]}
            >
              <View
                style={[styles.levelDot, { backgroundColor: LEVEL_COLORS[level] }]}
              />
              <Text style={[styles.levelText, { color: LEVEL_COLORS[level] }]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </View>
          )}

          {/* Status badge */}
          {status && !hasProgress && !level && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    status === 'paused' ? '#f59e0b20' : gradientColors[0] + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: status === 'paused' ? '#f59e0b' : gradientColors[0] },
                ]}
              >
                {STATUS_LABELS[status] || status}
              </Text>
            </View>
          )}

          {/* Match tag - only show if no other badges */}
          {!hasProgress && !level && !status && (
            <View style={styles.matchTagContainer}>
              <LinearGradient
                colors={[gradientColors[0] + '20', gradientColors[1] + '30']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.matchTag}
              >
                <Text
                  style={[styles.matchText, { color: gradientColors[0] }]}
                  numberOfLines={2}
                >
                  {matchLabel}
                </Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 130,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  gradientBorder: {
    borderRadius: 22,
    padding: 2.5,
  },
  cardInner: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: 180,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
    gap: 4,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  levelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  matchTagContainer: {
    width: '100%',
    marginTop: 'auto',
  },
  matchTag: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  matchText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
});
