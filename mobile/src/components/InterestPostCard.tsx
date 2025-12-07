import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from './Avatar';
import { InterestPost, interestPostService } from '../services/interestPostService';

interface InterestPostCardProps {
  post: InterestPost;
  gradientColors?: readonly [string, string];
  onPress: () => void;
  onLike: () => void;
  onComment: () => void;
  onInterestPress?: () => void;
  compact?: boolean;
  showInterestPill?: boolean;
}

const INTEREST_LABELS = {
  book: 'READING THE SAME BOOK',
  game: 'PLAYING THE SAME GAME',
  skill: 'LEARNING THE SAME SKILL',
};

const INTEREST_ICONS = {
  book: '📚',
  game: '🎮',
  skill: '🎯',
};

export default function InterestPostCard({
  post,
  gradientColors,
  onPress,
  onLike,
  onComment,
  onInterestPress,
  compact = false,
  showInterestPill = false,
}: InterestPostCardProps) {
  const timeAgo = interestPostService.formatRelativeTime(post.createdAt);
  const colors = gradientColors || interestPostService.getTypeGradient(post.type);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactHeader}>
          <Avatar name={post.user.name} email={post.user.email} size={28} />
          <Text style={styles.compactName} numberOfLines={1}>
            {post.user.name.split(' ')[0]}
          </Text>
          <Text style={styles.compactTime}>{timeAgo}</Text>
        </View>
        <Text style={styles.compactContent} numberOfLines={2}>
          {post.content}
        </Text>
        <View style={styles.compactStats}>
          <View style={styles.compactStat}>
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={14}
              color={post.isLiked ? '#ef4444' : '#9ca3af'}
            />
            <Text style={styles.compactStatText}>{post.likeCount}</Text>
          </View>
          <View style={styles.compactStat}>
            <Ionicons name="chatbubble-outline" size={14} color="#9ca3af" />
            <Text style={styles.compactStatText}>{post.commentCount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Interest Context Pill */}
      {showInterestPill && (
        <TouchableOpacity
          style={styles.interestPillContainer}
          onPress={onInterestPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.interestPill}
          >
            <Text style={styles.interestPillIcon}>{INTEREST_ICONS[post.type]}</Text>
            <Text style={styles.interestPillLabel}>{INTEREST_LABELS[post.type]}</Text>
            <Text style={styles.interestPillSeparator}>–</Text>
            <Text style={styles.interestPillValue} numberOfLines={1}>{post.interestValue}</Text>
            <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.8)" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Author Row */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={styles.header}>
          <Avatar name={post.user.name} email={post.user.email} size={44} />
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{post.user.name}</Text>
            <View style={styles.headerMeta}>
              {post.user.location && (
                <>
                  <Text style={styles.locationText}>{post.user.location}</Text>
                  <Text style={styles.dot}>·</Text>
                </>
              )}
              <Text style={styles.timeText}>{timeAgo}</Text>
              {post.progressSnapshot !== null && post.type === 'book' && (
                <>
                  <Text style={styles.dot}>·</Text>
                  <View style={[styles.progressBadge, { backgroundColor: colors[0] + '20' }]}>
                    <Text style={[styles.progressText, { color: colors[0] }]}>
                      p.{post.progressSnapshot}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.content}>{post.content}</Text>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={post.isLiked ? '#ef4444' : '#6b7280'}
          />
          <Text style={[styles.actionText, post.isLiked && styles.actionTextActive]}>
            {post.likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onComment}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={21} color="#6b7280" />
          <Text style={styles.actionText}>{post.commentCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  interestPillContainer: {
    marginBottom: 14,
  },
  interestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  interestPillIcon: {
    fontSize: 14,
  },
  interestPillLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.5,
  },
  interestPillSeparator: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  interestPillValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  dot: {
    fontSize: 12,
    color: '#9ca3af',
    marginHorizontal: 6,
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#ef4444',
  },
  // Compact styles
  compactContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: 200,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  compactName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  compactTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  compactContent: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 8,
  },
  compactStats: {
    flexDirection: 'row',
    gap: 12,
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactStatText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
