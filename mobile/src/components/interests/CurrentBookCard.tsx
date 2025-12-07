import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../ui/ProgressBar';
import { CurrentBook, interestService } from '../../services/interestService';

interface CurrentBookCardProps {
  book: CurrentBook;
  onPress?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

export default function CurrentBookCard({
  book,
  onPress,
  onEdit,
  compact = false,
}: CurrentBookCardProps) {
  const progress = interestService.getBookProgressPercent(book);
  const daysSinceStart = interestService.getDaysSinceStart(book.startDate);
  const statusDisplay = interestService.getBookStatusDisplay(book.status);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactGradient}
        >
          <View style={styles.compactContent}>
            <Text style={styles.compactIcon}>📖</Text>
            <View style={styles.compactInfo}>
              <Text style={styles.compactTitle} numberOfLines={1}>
                {book.title}
              </Text>
              <Text style={styles.compactProgress}>
                {progress}% complete
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>📖</Text>
            <Text style={styles.headerLabel}>Currently Reading</Text>
          </View>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <TouchableOpacity
        style={styles.body}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <Text style={styles.bookTitle}>{book.title}</Text>

        <View style={styles.progressSection}>
          <ProgressBar
            progress={progress}
            height={8}
            gradientColors={['#8b5cf6', '#a78bfa']}
          />
          <View style={styles.progressDetails}>
            <Text style={styles.pagesText}>
              {book.pagesRead} / {book.totalPages || '?'} pages
            </Text>
            <Text style={styles.percentText}>{progress}%</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusDisplay.color + '20' },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusDisplay.color }]}
            />
            <Text style={[styles.statusText, { color: statusDisplay.color }]}>
              {statusDisplay.text}
            </Text>
          </View>

          <View style={styles.daysContainer}>
            <Ionicons name="time-outline" size={14} color="#9ca3af" />
            <Text style={styles.daysText}>
              {daysSinceStart} day{daysSinceStart !== 1 ? 's' : ''} ago
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editButton: {
    padding: 4,
  },
  body: {
    padding: 16,
    gap: 16,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 26,
  },
  progressSection: {
    gap: 8,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagesText: {
    fontSize: 13,
    color: '#9ca3af',
  },
  percentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a78bfa',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  daysText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Compact styles
  compactContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  compactGradient: {
    padding: 12,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactIcon: {
    fontSize: 24,
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  compactProgress: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
