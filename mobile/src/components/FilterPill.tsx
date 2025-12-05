import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterPillProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  isActive: boolean;
  onPress: () => void;
}

export default function FilterPill({ label, icon, emoji, isActive, onPress }: FilterPillProps) {
  return (
    <TouchableOpacity
      style={[styles.pill, isActive && styles.pillActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={isActive ? '#fff' : '#6b7280'}
          style={styles.icon}
        />
      ) : emoji ? (
        <Text style={[styles.emoji, isActive && styles.emojiActive]}>{emoji}</Text>
      ) : null}
      <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginRight: 8,
    gap: 6,
  },
  pillActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  icon: {
    marginRight: 2,
  },
  emoji: {
    fontSize: 14,
  },
  emojiActive: {
    opacity: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  labelActive: {
    color: '#fff',
  },
});
