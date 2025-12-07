import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface InterestSectionHeaderProps {
  emoji: string;
  title: string;
  value: string;
  count: number;
  gradientColors: readonly [string, string, ...string[]];
}

export default function InterestSectionHeader({
  emoji,
  title,
  value,
  count,
  gradientColors,
}: InterestSectionHeaderProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Icon container */}
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value} numberOfLines={1}>
            {value}
          </Text>
        </View>

        {/* Count chip */}
        <View style={styles.countChip}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    // Shadow
    shadowColor: '#6C4DFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 26,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  countChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 36,
    alignItems: 'center',
  },
  countText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
});
