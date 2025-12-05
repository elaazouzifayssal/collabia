import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Avatar from './Avatar';

interface InterestBubbleProps {
  emoji: string;
  name: string;
  studentCount: number;
  students: Array<{ id: string; name: string; email: string }>;
  onPress: () => void;
}

export default function InterestBubble({
  emoji,
  name,
  studentCount,
  students,
  onPress,
}: InterestBubbleProps) {
  const displayStudents = students.slice(0, 3);

  return (
    <TouchableOpacity style={styles.bubble} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.gradient}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.count}>
          {studentCount} {studentCount === 1 ? 'student' : 'students'}
        </Text>

        {displayStudents.length > 0 && (
          <View style={styles.avatars}>
            {displayStudents.map((student, index) => (
              <View
                key={student.id}
                style={[styles.avatarWrapper, { marginLeft: index > 0 ? -12 : 0, zIndex: 3 - index }]}
              >
                <Avatar name={student.name} email={student.email} size={28} />
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: 160,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    backgroundColor: '#f3e8ff',
    padding: 16,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7c3aed',
    textAlign: 'center',
    marginBottom: 4,
  },
  count: {
    fontSize: 12,
    color: '#9333ea',
    fontWeight: '500',
    marginBottom: 12,
  },
  avatars: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
  },
});
