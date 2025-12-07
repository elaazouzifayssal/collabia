import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { interestPostService, InterestPost } from '../services/interestPostService';
import Avatar from './Avatar';

interface UserInterestPostsProps {
  userId: string;
  type: 'book' | 'skill' | 'game';
  interestValue: string;
  gradientColors: readonly [string, string];
  onPostPress: (post: InterestPost) => void;
  onViewAll: () => void;
  onCreatePost: () => void;
}

export default function UserInterestPosts({
  userId,
  type,
  interestValue,
  gradientColors,
  onPostPress,
  onViewAll,
  onCreatePost,
}: UserInterestPostsProps) {
  const [posts, setPosts] = useState<InterestPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadPosts();
  }, [userId, type, interestValue]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await interestPostService.getUserPosts(userId, type, interestValue);
      setPosts(data.posts);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Failed to load user interest posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const typeLabel = type === 'book' ? 'this book' : type === 'skill' ? 'this skill' : 'this game';

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={gradientColors[0]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles-outline" size={14} color={gradientColors[0]} />
          <Text style={[styles.headerTitle, { color: gradientColors[0] }]}>
            Your posts about {typeLabel}
          </Text>
        </View>
        <TouchableOpacity onPress={onCreatePost} activeOpacity={0.8}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.newPostButton}
          >
            <Ionicons name="add" size={14} color="#fff" />
            <Text style={styles.newPostText}>Post</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Posts */}
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <TouchableOpacity onPress={onCreatePost} activeOpacity={0.8}>
            <Text style={[styles.emptyLink, { color: gradientColors[0] }]}>
              Share your thoughts
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {posts.slice(0, 2).map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postCard}
              onPress={() => onPostPress(post)}
              activeOpacity={0.7}
            >
              <Text style={styles.postContent} numberOfLines={2}>
                {post.content}
              </Text>
              <View style={styles.postFooter}>
                <View style={styles.postStats}>
                  <View style={styles.postStat}>
                    <Ionicons
                      name={post.isLiked ? 'heart' : 'heart-outline'}
                      size={12}
                      color={post.isLiked ? '#ef4444' : '#9ca3af'}
                    />
                    <Text style={styles.postStatText}>{post.likeCount}</Text>
                  </View>
                  <View style={styles.postStat}>
                    <Ionicons name="chatbubble-outline" size={12} color="#9ca3af" />
                    <Text style={styles.postStatText}>{post.commentCount}</Text>
                  </View>
                </View>
                <Text style={styles.postTime}>
                  {interestPostService.formatRelativeTime(post.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {totalCount > 2 && (
            <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
              <Text style={[styles.viewAllText, { color: gradientColors[0] }]}>
                View all {totalCount} posts
              </Text>
              <Ionicons name="chevron-forward" size={14} color={gradientColors[0]} />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  newPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  newPostText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
  },
  emptyLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  postTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
