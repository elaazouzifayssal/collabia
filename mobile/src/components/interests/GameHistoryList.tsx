import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GameHistoryItem } from '../../services/interestService';

interface GameHistoryListProps {
  games: GameHistoryItem[];
  initiallyExpanded?: boolean;
  onGamePress?: (game: GameHistoryItem) => void;
}

function GameHistoryCard({
  game,
  onPress,
}: {
  game: GameHistoryItem;
  onPress?: () => void;
}) {
  const playedToDate = new Date(game.playedTo).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.gameIconContainer}>
        <Text style={styles.gameIcon}>🎮</Text>
      </View>

      <View style={styles.gameInfo}>
        <Text style={styles.gameName} numberOfLines={1}>
          {game.name}
        </Text>
        <Text style={styles.gameDate}>Until {playedToDate}</Text>
      </View>

      {game.rank && (
        <View style={styles.rankBadge}>
          <Ionicons name="trophy" size={12} color="#fbbf24" />
          <Text style={styles.rankText}>{game.rank}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function GameHistoryList({
  games,
  initiallyExpanded = false,
  onGamePress,
}: GameHistoryListProps) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

  if (games.length === 0) {
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
          <Text style={styles.headerIcon}>🕹️</Text>
          <Text style={styles.headerTitle}>Gaming History</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{games.length}</Text>
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
          {games.map((game) => (
            <GameHistoryCard
              key={game.id}
              game={game}
              onPress={onGamePress ? () => onGamePress(game) : undefined}
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
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  gameIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gameIcon: {
    fontSize: 16,
  },
  gameInfo: {
    flex: 1,
    gap: 4,
  },
  gameName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  gameDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fbbf24',
  },
});
