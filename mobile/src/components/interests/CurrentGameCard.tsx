import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CurrentGame, interestService } from '../../services/interestService';

interface CurrentGameCardProps {
  game: CurrentGame;
  onPress?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

export default function CurrentGameCard({
  game,
  onPress,
  onEdit,
  compact = false,
}: CurrentGameCardProps) {
  const daysSinceStart = interestService.getDaysSinceStart(game.startDate);
  const frequencyDisplay = interestService.getFrequencyDisplay(game.frequency);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ec4899', '#db2777']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactGradient}
        >
          <View style={styles.compactContent}>
            <Text style={styles.compactIcon}>🎮</Text>
            <View style={styles.compactInfo}>
              <Text style={styles.compactTitle} numberOfLines={1}>
                {game.name}
              </Text>
              {game.rank && (
                <Text style={styles.compactRank}>{game.rank}</Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ec4899', '#db2777', '#be185d']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🎮</Text>
            <Text style={styles.headerLabel}>Currently Playing</Text>
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
        <Text style={styles.gameName}>{game.name}</Text>

        <View style={styles.statsRow}>
          {game.rank && (
            <View style={styles.rankBadge}>
              <Ionicons name="trophy" size={14} color="#fbbf24" />
              <Text style={styles.rankText}>{game.rank}</Text>
            </View>
          )}

          {frequencyDisplay && (
            <View style={styles.frequencyBadge}>
              <Ionicons name="game-controller" size={14} color="#ec4899" />
              <Text style={styles.frequencyText}>{frequencyDisplay}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.playingIndicator}>
            <View style={styles.pulsingDot}>
              <View style={styles.pulsingDotInner} />
            </View>
            <Text style={styles.playingText}>Active</Text>
          </View>

          <View style={styles.daysContainer}>
            <Ionicons name="time-outline" size={14} color="#9ca3af" />
            <Text style={styles.daysText}>
              {daysSinceStart} day{daysSinceStart !== 1 ? 's' : ''}
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
    shadowColor: '#ec4899',
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
    gap: 14,
  },
  gameName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fbbf24',
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  frequencyText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#f472b6',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulsingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsingDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  playingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
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
  compactRank: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});
