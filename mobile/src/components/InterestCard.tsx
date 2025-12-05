import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

interface InterestCardProps {
  emoji: string;
  name: string;
  studentCount: number;
  onPress: () => void;
}

export default function InterestCard({
  emoji,
  name,
  studentCount,
  onPress,
}: InterestCardProps) {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.count}>
          {studentCount} student{studentCount !== 1 ? 's' : ''}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: '#f3e8ff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: 6,
  },
  count: {
    fontSize: 12,
    color: '#9333ea',
    fontWeight: '500',
  },
});
