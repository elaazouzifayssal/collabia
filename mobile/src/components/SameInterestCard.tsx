import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from './Avatar';

interface SameInterestCardProps {
  name: string;
  email: string;
  location?: string;
  matchLabel: string;
  gradientColors: readonly [string, string, ...string[]];
  onPress: () => void;
}

export default function SameInterestCard({
  name,
  email,
  location,
  matchLabel,
  gradientColors,
  onPress,
}: SameInterestCardProps) {
  const firstName = name.split(' ')[0];

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
            <View style={styles.activeIndicator} />
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

          {/* Match tag */}
          <View style={styles.matchTagContainer}>
            <LinearGradient
              colors={[gradientColors[0] + '20', gradientColors[1] + '30']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.matchTag}
            >
              <Text style={[styles.matchText, { color: gradientColors[0] }]} numberOfLines={2}>
                {matchLabel}
              </Text>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 130,
    marginRight: 14,
    // Card shadow
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
    backgroundColor: '#22c55e',
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
