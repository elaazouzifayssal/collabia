import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import InterestBubble from './InterestBubble';

interface Interest {
  name: string;
  emoji: string;
  count: number;
  students: Array<{ id: string; name: string; email: string }>;
}

interface InterestSectionProps {
  interests: Interest[];
  onInterestPress: (interest: Interest) => void;
}

export default function InterestSection({ interests, onInterestPress }: InterestSectionProps) {
  if (interests.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Explore by Interest</Text>
      <FlatList
        horizontal
        data={interests}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <InterestBubble
            emoji={item.emoji}
            name={item.name}
            studentCount={item.count}
            students={item.students}
            onPress={() => onInterestPress(item)}
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        decelerationRate="fast"
        snapToInterval={172}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
});
