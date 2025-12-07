import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookHistoryItem } from '../../services/interestService';

interface BookHistoryListProps {
  books: BookHistoryItem[];
  initiallyExpanded?: boolean;
  onBookPress?: (book: BookHistoryItem) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={12}
          color={star <= rating ? '#fbbf24' : '#4b5563'}
        />
      ))}
    </View>
  );
}

function BookHistoryCard({
  book,
  onPress,
}: {
  book: BookHistoryItem;
  onPress?: () => void;
}) {
  const isCompleted = book.status === 'completed';
  const finishedDate = new Date(book.finishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.bookIconContainer}>
        <Text style={styles.bookIcon}>{isCompleted ? '✅' : '⏸️'}</Text>
      </View>

      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <View style={styles.bookMeta}>
          {isCompleted && book.rating && <StarRating rating={book.rating} />}
          <Text style={styles.bookDate}>{finishedDate}</Text>
        </View>
      </View>

      <View
        style={[
          styles.statusPill,
          { backgroundColor: isCompleted ? '#22c55e20' : '#f59e0b20' },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: isCompleted ? '#22c55e' : '#f59e0b' },
          ]}
        >
          {isCompleted ? 'Completed' : 'Paused'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function BookHistoryList({
  books,
  initiallyExpanded = false,
  onBookPress,
}: BookHistoryListProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  if (books.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📚</Text>
          <Text style={styles.headerTitle}>Reading History</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{books.length}</Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#9ca3af"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.listContainer}>
          {books.map((book) => (
            <BookHistoryCard
              key={book.id}
              book={book}
              onPress={onBookPress ? () => onBookPress(book) : undefined}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
  },
  listContainer: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  bookIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookIcon: {
    fontSize: 16,
  },
  bookInfo: {
    flex: 1,
    gap: 4,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  bookDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
