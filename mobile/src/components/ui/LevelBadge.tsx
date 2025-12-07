import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LevelBadgeProps {
  level: 'beginner' | 'intermediate' | 'advanced' | string;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const LEVEL_CONFIG = {
  beginner: {
    label: 'Beginner',
    icon: '🌱',
    colors: ['#22c55e', '#16a34a'] as const,
  },
  intermediate: {
    label: 'Intermediate',
    icon: '🔥',
    colors: ['#f59e0b', '#d97706'] as const,
  },
  advanced: {
    label: 'Advanced',
    icon: '⭐',
    colors: ['#8b5cf6', '#7c3aed'] as const,
  },
};

export default function LevelBadge({
  level,
  size = 'medium',
  showIcon = true,
}: LevelBadgeProps) {
  const config = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || {
    label: level,
    icon: '📚',
    colors: ['#6b7280', '#4b5563'] as const,
  };

  const sizeStyles = {
    small: { paddingHorizontal: 8, paddingVertical: 4, fontSize: 11, iconSize: 12 },
    medium: { paddingHorizontal: 12, paddingVertical: 6, fontSize: 13, iconSize: 14 },
    large: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 15, iconSize: 18 },
  };

  const currentSize = sizeStyles[size];

  return (
    <LinearGradient
      colors={config.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.badge,
        {
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
        },
      ]}
    >
      {showIcon && (
        <Text style={[styles.icon, { fontSize: currentSize.iconSize }]}>
          {config.icon}
        </Text>
      )}
      <Text style={[styles.label, { fontSize: currentSize.fontSize }]}>
        {config.label}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 4,
  },
  icon: {
    marginRight: 2,
  },
  label: {
    fontWeight: '700',
    color: '#fff',
  },
});
