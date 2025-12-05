import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import Avatar from './Avatar';

interface CompactInterestCardProps {
  emoji: string;
  name: string;
  studentCount: number;
  students: Array<{ id: string; name: string; email: string }>;
  gradient: string[];
  onPress: () => void;
}

export default function CompactInterestCard({
  emoji,
  name,
  studentCount,
  students,
  gradient,
  onPress,
}: CompactInterestCardProps) {
  const displayStudents = students.slice(0, 3);
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[styles.gradient, { backgroundColor: gradient[0] + '15' }]}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={[styles.name, { color: gradient[0] }]} numberOfLines={1}>
            {capitalizedName}
          </Text>
          <Text style={styles.count}>{studentCount}</Text>

          {displayStudents.length > 0 && (
            <View style={styles.avatars}>
              {displayStudents.map((student, index) => (
                <View
                  key={student.id}
                  style={[styles.avatarWrapper, { marginLeft: index > 0 ? -10 : 0, zIndex: 3 - index }]}
                >
                  <Avatar name={student.name} email={student.email} size={24} />
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  gradient: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  count: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 10,
  },
  avatars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
